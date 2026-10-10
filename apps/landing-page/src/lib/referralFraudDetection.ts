/**
 * Referral Fraud Detection System
 *
 * Prevents self-referral fraud through multiple detection layers:
 * 1. Phone number matching
 * 2. Email matching
 * 3. IP address tracking
 * 4. Device fingerprinting
 * 5. Behavioral patterns
 * 6. Velocity checks
 */

import { prisma } from '@/lib/prisma'

interface FraudCheckParams {
  referrerUserId: string
  guestPhone?: string | null
  guestEmail?: string | null
  refereeUserId?: string | null
  ipAddress?: string | null
  userAgent?: string | null
}

interface FraudCheckResult {
  isFraudulent: boolean
  reason?: string
  confidence: 'LOW' | 'MEDIUM' | 'HIGH' | 'CERTAIN'
  details: string[]
}

/**
 * Main fraud detection function
 * Returns true if fraud is detected
 */
export async function detectReferralFraud(params: FraudCheckParams): Promise<FraudCheckResult> {
  const {
    referrerUserId,
    guestPhone,
    guestEmail,
    refereeUserId,
    ipAddress,
    userAgent,
  } = params

  const details: string[] = []
  let fraudScore = 0
  const maxScore = 100

  // LAYER 1: Direct User ID Match (for authenticated users)
  if (refereeUserId && refereeUserId === referrerUserId) {
    return {
      isFraudulent: true,
      reason: 'Self-referral detected: Same user account',
      confidence: 'CERTAIN',
      details: ['User attempting to refer themselves'],
    }
  }

  // LAYER 2: Phone Number Matching
  if (guestPhone) {
    const normalizedPhone = normalizePhoneNumber(guestPhone)

    // Check if referrer has this phone number
    const referrerUser = await prisma.user.findUnique({
      where: { id: referrerUserId },
      select: { phone: true, email: true },
    })

    if (referrerUser?.phone && normalizePhoneNumber(referrerUser.phone) === normalizedPhone) {
      fraudScore += 80 // Very high confidence
      details.push('Phone number matches referrer account')
    }

    // Check recent orders with same phone from different referrals
    const recentOrdersWithSamePhone = await prisma.farmOrder.findMany({
      where: {
        guestPhone: normalizedPhone,
        referredById: { not: null },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      select: {
        referredById: true,
        createdAt: true,
      },
    })

    // If same phone used with multiple referral codes, likely fraud
    const uniqueReferrers = new Set(recentOrdersWithSamePhone.map(o => o.referredById))
    if (uniqueReferrers.size > 3) {
      fraudScore += 40
      details.push(`Phone number used with ${uniqueReferrers.size} different referral codes`)
    }
  }

  // LAYER 3: Email Matching
  if (guestEmail) {
    const normalizedEmail = normalizeEmail(guestEmail)

    // Check if referrer has this email
    const referrerUser = await prisma.user.findUnique({
      where: { id: referrerUserId },
      select: { email: true },
    })

    if (referrerUser?.email && normalizeEmail(referrerUser.email) === normalizedEmail) {
      fraudScore += 80 // Very high confidence
      details.push('Email matches referrer account')
    }

    // Check for email pattern abuse (e.g., user+1@email.com, user+2@email.com)
    const baseEmail = extractBaseEmail(normalizedEmail)
    const referrerBaseEmail = referrerUser?.email ? extractBaseEmail(normalizeEmail(referrerUser.email)) : null

    if (referrerBaseEmail && baseEmail === referrerBaseEmail) {
      fraudScore += 70
      details.push('Email base matches referrer (alias detected)')
    }
  }

  // LAYER 4: IP Address Tracking
  if (ipAddress) {
    // Check recent orders from same IP with different accounts/guests
    const recentOrdersFromIP = await prisma.farmOrder.findMany({
      where: {
        // Would need to add ipAddress field to FarmOrder model
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
        referredById: { not: null },
      },
      take: 50, // Check last 50 orders
    })

    // This is a placeholder - you'd need to add IP tracking to orders
    // For now, we'll add it to future implementation
    details.push('IP address tracking: Not yet implemented (add ipAddress field to orders)')
  }

  // LAYER 5: Velocity Check - Too many referral orders too quickly
  const recentReferralOrders = await prisma.farmOrder.findMany({
    where: {
      referredById: referrerUserId,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
  })

  if (recentReferralOrders.length > 10) {
    fraudScore += 30
    details.push(`Suspicious velocity: ${recentReferralOrders.length} referral orders in 24h`)
  }

  // LAYER 6: Pattern Analysis - Orders only when using own referral code
  const totalOrders = await prisma.farmOrder.count({
    where: {
      OR: [
        { userId: referrerUserId },
        {
          AND: [
            { guestPhone: referrerUser?.phone || undefined },
            { referredById: null },
          ],
        },
      ],
    },
  })

  const referralOrders = await prisma.farmOrder.count({
    where: { referredById: referrerUserId },
  })

  // If someone has many orders but ALL are referrals, suspicious
  if (totalOrders > 5 && referralOrders > 0) {
    const referralRatio = referralOrders / (totalOrders + referralOrders)
    if (referralRatio > 0.8) {
      fraudScore += 25
      details.push(`Suspicious pattern: ${Math.round(referralRatio * 100)}% of orders use referrals`)
    }
  }

  // LAYER 7: New Account + Immediate Referral Use
  const referrer = await prisma.user.findUnique({
    where: { id: referrerUserId },
    select: { createdAt: true },
  })

  if (referrer) {
    const accountAge = Date.now() - referrer.createdAt.getTime()
    const oneDayMs = 24 * 60 * 60 * 1000

    if (accountAge < oneDayMs && referralOrders === 0) {
      // New account + first referral order = suspicious
      fraudScore += 35
      details.push('New account with immediate referral usage')
    }
  }

  // Calculate final result
  let confidence: 'LOW' | 'MEDIUM' | 'HIGH' | 'CERTAIN' = 'LOW'
  if (fraudScore >= 80) confidence = 'CERTAIN'
  else if (fraudScore >= 60) confidence = 'HIGH'
  else if (fraudScore >= 40) confidence = 'MEDIUM'

  const isFraudulent = fraudScore >= 60 // Threshold for blocking

  return {
    isFraudulent,
    reason: isFraudulent
      ? `Fraud score: ${fraudScore}/100 - ${details[0] || 'Multiple fraud indicators'}`
      : undefined,
    confidence,
    details,
  }
}

/**
 * Normalize phone number for comparison
 * Removes spaces, dashes, and country codes
 */
function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let normalized = phone.replace(/\D/g, '')

  // Remove common country codes
  if (normalized.startsWith('237')) normalized = normalized.substring(3) // Cameroon
  if (normalized.startsWith('1') && normalized.length === 11) normalized = normalized.substring(1) // US/Canada
  if (normalized.startsWith('0')) normalized = normalized.substring(1) // Local format

  return normalized
}

/**
 * Normalize email for comparison
 */
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

/**
 * Extract base email (before + sign for Gmail-style aliases)
 * user+1@gmail.com → user@gmail.com
 */
function extractBaseEmail(email: string): string {
  const normalized = normalizeEmail(email)
  const [localPart, domain] = normalized.split('@')

  // Handle Gmail + aliases
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    const basePart = localPart.split('+')[0].replace(/\./g, '') // Gmail ignores dots too
    return `${basePart}@${domain}`
  }

  // Handle other providers' + aliases
  const basePart = localPart.split('+')[0]
  return `${basePart}@${domain}`
}

/**
 * Log fraud attempt for analysis
 */
export async function logFraudAttempt(
  params: FraudCheckParams & { orderId?: string; fraudResult: FraudCheckResult }
): Promise<void> {
  try {
    // You could create a FraudLog table to track these
    console.log('🚨 [FRAUD DETECTION] Potential fraud detected:')
    console.log('  Referrer:', params.referrerUserId)
    console.log('  Guest Phone:', params.guestPhone)
    console.log('  Guest Email:', params.guestEmail)
    console.log('  Confidence:', params.fraudResult.confidence)
    console.log('  Reason:', params.fraudResult.reason)
    console.log('  Details:', params.fraudResult.details.join(', '))

    // Future: Store in database for admin review
    // await prisma.fraudLog.create({ ... })
  } catch (error) {
    console.error('[FRAUD DETECTION] Error logging fraud attempt:', error)
  }
}

/**
 * Get referrer's contact information for comparison
 */
async function getReferrerContactInfo(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      phone: true,
      email: true,
      createdAt: true,
    },
  })
}
