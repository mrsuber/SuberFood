import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/account-claims
 *
 * Get all account claims for admin review
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // 'PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'

    const where = status ? { status: status as any } : {}

    const claims = await prisma.accountClaim.findMany({
      where,
      include: {
        existingUser: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            createdAt: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get statistics
    const stats = {
      pending: await prisma.accountClaim.count({ where: { status: 'PENDING' } }),
      underReview: await prisma.accountClaim.count({ where: { status: 'UNDER_REVIEW' } }),
      approved: await prisma.accountClaim.count({ where: { status: 'APPROVED' } }),
      rejected: await prisma.accountClaim.count({ where: { status: 'REJECTED' } }),
      total: await prisma.accountClaim.count(),
    }

    return NextResponse.json({
      success: true,
      claims: claims.map(claim => ({
        id: claim.id,
        phoneNumber: claim.phoneNumber,
        newEmail: claim.newEmail,
        fullName: claim.fullName,
        reason: claim.reason,
        idDocumentUrl: claim.idDocumentUrl,
        proofOfOwnership: claim.proofOfOwnership,
        additionalNotes: claim.additionalNotes,
        status: claim.status,
        reviewedBy: claim.reviewedBy,
        reviewedAt: claim.reviewedAt,
        reviewNotes: claim.reviewNotes,
        createdAt: claim.createdAt,
        existingAccount: claim.existingUser ? {
          id: claim.existingUser.id,
          email: claim.existingUser.email,
          name: claim.existingUser.name,
          phone: claim.existingUser.phone,
          createdAt: claim.existingUser.createdAt,
        } : null
      })),
      stats
    })
  } catch (error) {
    console.error('[ADMIN] Error fetching account claims:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch claims'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/account-claims
 *
 * Update account claim status and optionally update the user account
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { claimId, action, reviewNotes } = await req.json()

    if (!claimId || !action) {
      return NextResponse.json(
        { success: false, message: 'Claim ID and action are required' },
        { status: 400 }
      )
    }

    const claim = await prisma.accountClaim.findUnique({
      where: { id: claimId },
      include: {
        existingUser: true
      }
    })

    if (!claim) {
      return NextResponse.json(
        { success: false, message: 'Claim not found' },
        { status: 404 }
      )
    }

    if (action === 'approve') {
      // Approve the claim and update the user's email
      await prisma.$transaction(async (tx) => {
        // Update the claim status
        await tx.accountClaim.update({
          where: { id: claimId },
          data: {
            status: 'APPROVED',
            reviewedBy: session.user.id,
            reviewedAt: new Date(),
            reviewNotes: reviewNotes || 'Approved by admin',
          }
        })

        // Update the user's email if provided and user exists
        if (claim.existingUserId && claim.newEmail) {
          await tx.user.update({
            where: { id: claim.existingUserId },
            data: {
              email: claim.newEmail,
              emailVerified: null, // Email changed, needs reverification
            }
          })

          console.log('✅ [ADMIN] Account claim approved and email updated:', {
            claimId,
            userId: claim.existingUserId,
            newEmail: claim.newEmail
          })
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Account claim approved and email updated successfully'
      })
    } else if (action === 'reject') {
      // Reject the claim
      await prisma.accountClaim.update({
        where: { id: claimId },
        data: {
          status: 'REJECTED',
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          reviewNotes: reviewNotes || 'Rejected by admin',
        }
      })

      console.log('❌ [ADMIN] Account claim rejected:', {
        claimId,
        reason: reviewNotes
      })

      return NextResponse.json({
        success: true,
        message: 'Account claim rejected'
      })
    } else if (action === 'review') {
      // Mark as under review
      await prisma.accountClaim.update({
        where: { id: claimId },
        data: {
          status: 'UNDER_REVIEW',
          reviewNotes: reviewNotes,
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Account claim marked as under review'
      })
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[ADMIN] Error updating account claim:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update claim'
      },
      { status: 500 }
    )
  }
}
