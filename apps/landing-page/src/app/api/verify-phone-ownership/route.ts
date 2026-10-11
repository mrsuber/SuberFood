import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizePhoneNumber } from '@/lib/referralFraudDetection'

export const dynamic = 'force-dynamic'

/**
 * POST /api/verify-phone-ownership
 *
 * Checks if a phone number is already registered to an account.
 * Used during checkout and registration to prevent duplicate accounts.
 *
 * Returns:
 * - exists: boolean
 * - account: { id, email, name, isComplete } if exists
 * - requiresConfirmation: boolean
 */
export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      )
    }

    const normalizedPhone = normalizePhoneNumber(phone)

    // Check if phone exists in User table (primary phone)
    const existingUser = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        isAccountComplete: true,
        createdAt: true,
      }
    })

    if (existingUser) {
      return NextResponse.json({
        success: true,
        exists: true,
        requiresConfirmation: true,
        account: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name || `${existingUser.firstName || ''} ${existingUser.lastName || ''}`.trim(),
          isComplete: existingUser.isAccountComplete,
          createdAt: existingUser.createdAt,
        }
      })
    }

    // Check if phone exists in UserPhoneNumber table
    const existingPhoneNumber = await prisma.userPhoneNumber.findUnique({
      where: { phoneNumber: normalizedPhone },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            firstName: true,
            lastName: true,
            isAccountComplete: true,
            createdAt: true,
          }
        }
      }
    })

    if (existingPhoneNumber) {
      return NextResponse.json({
        success: true,
        exists: true,
        requiresConfirmation: true,
        account: {
          id: existingPhoneNumber.user.id,
          email: existingPhoneNumber.user.email,
          name: existingPhoneNumber.user.name || `${existingPhoneNumber.user.firstName || ''} ${existingPhoneNumber.user.lastName || ''}`.trim(),
          isComplete: existingPhoneNumber.user.isAccountComplete,
          createdAt: existingPhoneNumber.user.createdAt,
          phoneLabel: existingPhoneNumber.label,
        }
      })
    }

    // Phone number not found
    return NextResponse.json({
      success: true,
      exists: false,
      requiresConfirmation: false,
    })
  } catch (error) {
    console.error('[PHONE VERIFICATION] Error checking phone ownership:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify phone ownership'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/verify-phone-ownership
 *
 * User confirms ownership of a phone number.
 * This links the phone to their current session/order.
 */
export async function PUT(req: NextRequest) {
  try {
    const { phone, userId, action } = await req.json()

    if (!phone || !action) {
      return NextResponse.json(
        { success: false, error: 'Phone number and action are required' },
        { status: 400 }
      )
    }

    const normalizedPhone = normalizePhoneNumber(phone)

    if (action === 'confirm') {
      // User confirms they own this phone
      // This means they should log in instead of creating a new account

      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: normalizedPhone },
            { phoneNumbers: { some: { phoneNumber: normalizedPhone } } }
          ]
        },
        select: {
          id: true,
          email: true,
          isAccountComplete: true,
        }
      })

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Account not found for this phone number' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        action: 'redirect_to_login',
        message: 'Please log in to your existing account',
        account: {
          id: user.id,
          email: user.email,
          isComplete: user.isAccountComplete,
        }
      })
    } else if (action === 'report') {
      // User reports this phone as not theirs (stolen/incorrect)
      // Create an account claim for admin review

      await prisma.accountClaim.create({
        data: {
          phoneNumber: normalizedPhone,
          reason: 'Phone number reported as incorrect or stolen during checkout',
          fullName: 'Pending user submission',
          status: 'PENDING',
          additionalNotes: 'Auto-created from checkout phone conflict',
        }
      })

      return NextResponse.json({
        success: true,
        action: 'account_claim_created',
        message: 'Report submitted. An admin will review this case.',
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[PHONE VERIFICATION] Error confirming phone ownership:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to confirm phone ownership'
      },
      { status: 500 }
    )
  }
}
