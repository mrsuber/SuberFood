import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/referrals/banned - Get all banned referral codes
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

    // Fetch banned referral codes
    const bannedCodes = await prisma.referralCode.findMany({
      where: {
        OR: [
          { isSuspended: true },
          { autoBannedAt: { not: null } }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        fraudLogs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            fraudLogs: true,
          }
        }
      },
      orderBy: { autoBannedAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      bannedCodes: bannedCodes.map(code => ({
        id: code.id,
        code: code.code,
        userId: code.userId,
        userName: code.user.name,
        userEmail: code.user.email,
        userPhone: code.user.phone,
        fraudAttempts: code.fraudAttempts,
        lastFraudAttemptAt: code.lastFraudAttemptAt,
        autoBannedAt: code.autoBannedAt,
        autoBanReason: code.autoBanReason,
        isSuspended: code.isSuspended,
        isActive: code.isActive,
        totalFraudLogs: code._count.fraudLogs,
        recentFraudLogs: code.fraudLogs.map(log => ({
          id: log.id,
          fraudScore: log.fraudScore,
          confidence: log.confidence,
          reason: log.reason,
          strikeNumber: log.strikeNumber,
          createdAt: log.createdAt,
        })),
        createdAt: code.createdAt,
      }))
    })
  } catch (error) {
    console.error('Error fetching banned referral codes:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch banned codes',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/referrals/banned - Manually unban a referral code
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { referralCodeId, action } = await req.json()

    if (action === 'unban') {
      // Unban the referral code
      await prisma.referralCode.update({
        where: { id: referralCodeId },
        data: {
          isSuspended: false,
          isActive: true,
          fraudAttempts: 0, // Reset strike counter
          suspensionReason: null,
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Referral code unbanned successfully'
      })
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error managing banned code:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to manage banned code',
      },
      { status: 500 }
    )
  }
}
