import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/referrals
 * Get all referral codes and their performance stats
 */
export async function GET(req: NextRequest) {
  try {
    // Get all referral codes with related data
    const referralCodes = await prisma.referralCode.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        verification: true,
        referrals: {
          include: {
            referee: {
              select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        earnings: {
          include: {
            order: {
              select: {
                orderNumber: true,
                totalAmount: true,
                status: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: {
        totalEarnings: 'desc',
      },
    })

    // Calculate overall statistics
    const stats = {
      totalReferralCodes: referralCodes.length,
      verifiedReferrers: referralCodes.filter(r => r.verification?.isVerified).length,
      totalReferrals: referralCodes.reduce((sum, r) => sum + r.totalReferrals, 0),
      totalEarnings: referralCodes.reduce((sum, r) => sum + Number(r.totalEarnings), 0),
      totalPendingEarnings: referralCodes.reduce((sum, r) => {
        const pending = r.earnings
          .filter(e => !e.isPaid)
          .reduce((s, e) => s + Number(e.commissionAmount), 0)
        return sum + pending
      }, 0),
      totalPaidEarnings: referralCodes.reduce((sum, r) => {
        const paid = r.earnings
          .filter(e => e.isPaid)
          .reduce((s, e) => s + Number(e.commissionAmount), 0)
        return sum + paid
      }, 0),
    }

    // Format referral codes for frontend
    const formattedReferralCodes = referralCodes.map(rc => {
      const pendingEarnings = rc.earnings
        .filter(e => !e.isPaid)
        .reduce((sum, e) => sum + Number(e.commissionAmount), 0)

      const paidEarnings = rc.earnings
        .filter(e => e.isPaid)
        .reduce((sum, e) => sum + Number(e.commissionAmount), 0)

      return {
        id: rc.id,
        code: rc.code,
        user: rc.user,
        totalReferrals: rc.totalReferrals,
        activeReferrals: rc.activeReferrals,
        totalEarnings: Number(rc.totalEarnings),
        lifetimeEarnings: Number(rc.lifetimeEarnings),
        pendingEarnings,
        paidEarnings,
        isVerified: rc.verification?.isVerified || false,
        verificationStatus: rc.verification?.status,
        verificationSubmittedAt: rc.verification?.submittedAt,
        createdAt: rc.createdAt,
        lastUsedAt: rc.lastUsedAt,
        referralsCount: rc.referrals.length,
        earningsCount: rc.earnings.length,
      }
    })

    return NextResponse.json({
      success: true,
      stats,
      referralCodes: formattedReferralCodes,
    })
  } catch (error) {
    console.error('[ADMIN REFERRALS] Error fetching referrals:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch referrals',
      },
      { status: 500 }
    )
  }
}
