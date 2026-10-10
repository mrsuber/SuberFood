/**
 * Phone-Based Account Creation System
 *
 * Automatically creates user accounts when guests place orders with payment
 * Uses phone number as unique identifier
 * Account remains incomplete until user sets password and verifies email
 */

import { prisma } from '@/lib/prisma'
import { normalizePhoneNumber } from '@/lib/referralFraudDetection'

interface CreatePhoneAccountParams {
  phone: string
  fullName: string
  email?: string | null
}

interface PhoneAccountResult {
  userId: string
  isNewAccount: boolean
  accountExists: boolean
}

/**
 * Create or get existing phone-based account
 * This is called automatically when a guest places an order with payment
 */
export async function createOrGetPhoneAccount(
  params: CreatePhoneAccountParams
): Promise<PhoneAccountResult> {
  const { phone, fullName, email } = params

  // Normalize phone number for consistency
  const normalizedPhone = normalizePhoneNumber(phone)

  try {
    // Check if account already exists with this phone
    const existingUser = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
      select: { id: true }
    })

    if (existingUser) {
      return {
        userId: existingUser.id,
        isNewAccount: false,
        accountExists: true
      }
    }

    // Check if email exists (if provided)
    if (email) {
      const emailUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        select: { id: true, phone: true }
      })

      if (emailUser) {
        // Email exists but phone doesn't match
        // Update the existing account with the phone number
        await prisma.user.update({
          where: { id: emailUser.id },
          data: {
            phone: normalizedPhone,
            phoneVerified: true // Phone verified by payment
          }
        })

        return {
          userId: emailUser.id,
          isNewAccount: false,
          accountExists: true
        }
      }
    }

    // Create new phone-based account
    const newUser = await prisma.user.create({
      data: {
        phone: normalizedPhone,
        phoneVerified: true, // Verified by successful payment
        email: email ? email.toLowerCase().trim() : null,
        emailVerified: null, // Not verified yet
        name: fullName,
        firstName: fullName.split(' ')[0],
        lastName: fullName.split(' ').slice(1).join(' ') || null,
        password: null, // No password yet - account incomplete
        isAccountComplete: false, // User needs to set password and verify email
        role: 'CUSTOMER',
        status: 'ACTIVE',
      }
    })

    console.log('✅ [PHONE ACCOUNT] Created new account:', {
      userId: newUser.id,
      phone: normalizedPhone,
      name: fullName
    })

    return {
      userId: newUser.id,
      isNewAccount: true,
      accountExists: false
    }
  } catch (error) {
    console.error('[PHONE ACCOUNT] Error creating/getting account:', error)
    throw error
  }
}
