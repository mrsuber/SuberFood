import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/referrals/[id]
 * Get detailed information about a specific referral code
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const referralCode = await prisma.referralCode.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            createdAt: true,
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
                phone: true,
                createdAt: true,
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
            createdAt: 'desc',
          },
        },
        earnings: {
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                totalAmount: true,
                status: true,
                paymentStatus: true,
                createdAt: true,
                items: {
                  include: {
                    product: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
            referral: {
              include: {
                referee: {
                  select: {
                    name: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!referralCode) {
      return NextResponse.json(
        { success: false, message: 'Referral code not found' },
        { status: 404 }
      )
    }

    // Calculate stats
    const pendingEarnings = referralCode.earnings
      .filter(e => !e.isPaid)
      .reduce((sum, e) => sum + Number(e.commissionAmount), 0)

    const paidEarnings = referralCode.earnings
      .filter(e => e.isPaid)
      .reduce((sum, e) => sum + Number(e.commissionAmount), 0)

    return NextResponse.json({
      success: true,
      referralCode: {
        ...referralCode,
        totalEarnings: Number(referralCode.totalEarnings),
        lifetimeEarnings: Number(referralCode.lifetimeEarnings),
        pendingEarnings,
        paidEarnings,
      },
    })
  } catch (error) {
    console.error('[ADMIN REFERRALS] Error fetching referral details:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch referral details',
      },
      { status: 500 }
    )
  }
}
