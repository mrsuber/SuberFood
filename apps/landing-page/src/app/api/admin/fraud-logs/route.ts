import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/fraud-logs - Get all fraud logs with filtering
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
    const filter = searchParams.get('filter') // 'all', 'banned', 'high-risk'
    const search = searchParams.get('search') // Search by phone, email, or referral code
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { guestPhone: { contains: search } },
        { guestEmail: { contains: search, mode: 'insensitive' } },
        { referralCode: { code: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (filter === 'banned') {
      where.causedAutoBan = true
    } else if (filter === 'high-risk') {
      where.fraudScore = { gte: 60 }
    }

    // Fetch fraud logs
    const fraudLogs = await prisma.fraudLog.findMany({
      where,
      include: {
        referralCode: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // Fetch statistics
    const stats = await prisma.fraudLog.aggregate({
      _count: { id: true },
      _avg: { fraudScore: true },
    })

    const bannedCodes = await prisma.referralCode.count({
      where: {
        isSuspended: true,
        autoBannedAt: { not: null }
      }
    })

    const recentBans = await prisma.fraudLog.count({
      where: {
        causedAutoBan: true,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    })

    return NextResponse.json({
      success: true,
      fraudLogs: fraudLogs.map(log => ({
        id: log.id,
        referrerUserId: log.referrerUserId,
        referrerName: log.referralCode.user.name,
        referrerEmail: log.referralCode.user.email,
        referrerPhone: log.referralCode.user.phone,
        referralCode: log.referralCode.code,
        referralCodeId: log.referralCodeId,
        guestPhone: log.guestPhone,
        guestEmail: log.guestEmail,
        ipAddress: log.ipAddress,
        fraudScore: log.fraudScore,
        confidence: log.confidence,
        reason: log.reason,
        details: log.details,
        wasBlocked: log.wasBlocked,
        strikeNumber: log.strikeNumber,
        causedAutoBan: log.causedAutoBan,
        createdAt: log.createdAt,
      })),
      stats: {
        totalFraudAttempts: stats._count.id,
        averageFraudScore: Math.round(stats._avg.fraudScore || 0),
        bannedCodes,
        recentBans,
      }
    })
  } catch (error) {
    console.error('Error fetching fraud logs:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch fraud logs',
      },
      { status: 500 }
    )
  }
}
