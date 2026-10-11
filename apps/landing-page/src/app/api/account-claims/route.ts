import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizePhoneNumber } from '@/lib/referralFraudDetection'

export const dynamic = 'force-dynamic'

/**
 * POST /api/account-claims
 *
 * Submit an account claim request.
 * Used when a user enters the wrong email during order and needs admin help.
 */
export async function POST(req: NextRequest) {
  try {
    const {
      phoneNumber,
      newEmail,
      fullName,
      reason,
      idDocumentUrl,
      proofOfOwnership,
      additionalNotes
    } = await req.json()

    // Validate required fields
    if (!phoneNumber || !fullName || !reason) {
      return NextResponse.json(
        {
          success: false,
          error: 'Phone number, full name, and reason are required'
        },
        { status: 400 }
      )
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber)

    // Check if phone exists in system
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: normalizedPhone },
          { phoneNumbers: { some: { phoneNumber: normalizedPhone } } }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
      }
    })

    // Create account claim
    const accountClaim = await prisma.accountClaim.create({
      data: {
        phoneNumber: normalizedPhone,
        newEmail: newEmail ? newEmail.toLowerCase().trim() : null,
        fullName,
        reason,
        idDocumentUrl: idDocumentUrl || null,
        proofOfOwnership: proofOfOwnership || null,
        additionalNotes: additionalNotes || null,
        existingUserId: existingUser?.id || null,
        status: 'PENDING',
      }
    })

    console.log('📝 [ACCOUNT CLAIM] New claim submitted:', {
      claimId: accountClaim.id,
      phone: normalizedPhone,
      name: fullName,
      existingAccount: !!existingUser
    })

    return NextResponse.json({
      success: true,
      claimId: accountClaim.id,
      message: 'Account claim submitted successfully. An admin will review your request.',
      existingAccount: existingUser ? {
        email: existingUser.email,
        name: existingUser.name,
      } : null
    })
  } catch (error) {
    console.error('[ACCOUNT CLAIM] Error creating claim:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit account claim'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/account-claims
 *
 * Get account claim status (for users) or all claims (for admins)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const phoneNumber = searchParams.get('phone')
    const claimId = searchParams.get('claimId')

    if (claimId) {
      // Get specific claim by ID
      const claim = await prisma.accountClaim.findUnique({
        where: { id: claimId },
        include: {
          existingUser: {
            select: {
              id: true,
              email: true,
              name: true,
            }
          }
        }
      })

      if (!claim) {
        return NextResponse.json(
          { success: false, error: 'Claim not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        claim: {
          id: claim.id,
          phoneNumber: claim.phoneNumber,
          newEmail: claim.newEmail,
          fullName: claim.fullName,
          reason: claim.reason,
          status: claim.status,
          createdAt: claim.createdAt,
          reviewedAt: claim.reviewedAt,
          reviewNotes: claim.reviewNotes,
          existingAccount: claim.existingUser ? {
            email: claim.existingUser.email,
            name: claim.existingUser.name,
          } : null
        }
      })
    } else if (phoneNumber) {
      // Get claims by phone number
      const normalizedPhone = normalizePhoneNumber(phoneNumber)

      const claims = await prisma.accountClaim.findMany({
        where: { phoneNumber: normalizedPhone },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({
        success: true,
        claims: claims.map(claim => ({
          id: claim.id,
          status: claim.status,
          reason: claim.reason,
          createdAt: claim.createdAt,
          reviewedAt: claim.reviewedAt,
        }))
      })
    }

    return NextResponse.json(
      { success: false, error: 'Phone number or claim ID required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[ACCOUNT CLAIM] Error fetching claims:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch claims'
      },
      { status: 500 }
    )
  }
}
