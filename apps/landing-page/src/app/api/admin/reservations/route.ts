import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/reservations
 * Filters: ?status=PENDING|CONFIRMED|... ?restaurantId= ?range=upcoming|today|past|all
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const restaurantId = searchParams.get('restaurantId')
    const range = searchParams.get('range') || 'upcoming'

    // "Today" in West Africa Time (UTC+1), independent of the server's timezone
    const WAT_OFFSET_MS = 60 * 60 * 1000
    const watNow = new Date(Date.now() + WAT_OFFSET_MS)
    const startOfToday = new Date(
      Date.UTC(watNow.getUTCFullYear(), watNow.getUTCMonth(), watNow.getUTCDate()) - WAT_OFFSET_MS
    )
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)

    const where: any = {}
    if (status && status !== 'all') where.status = status
    if (restaurantId && restaurantId !== 'all') where.restaurantId = restaurantId
    if (range === 'upcoming') where.reservationDate = { gte: startOfToday }
    if (range === 'today') where.reservationDate = { gte: startOfToday, lt: endOfToday }
    if (range === 'past') where.reservationDate = { lt: startOfToday }

    const [reservations, byStatus, restaurants] = await Promise.all([
      prisma.reservation.findMany({
        where,
        orderBy: { reservationDate: range === 'past' ? 'desc' : 'asc' },
        take: 300,
        include: {
          restaurant: { select: { id: true, name: true, city: true } },
          user: { select: { id: true, name: true, email: true, phone: true } },
          table: { select: { id: true, tableNumber: true } },
        },
      }),
      prisma.reservation.groupBy({
        by: ['status'],
        where: { reservationDate: { gte: startOfToday } },
        _count: true,
      }),
      prisma.restaurant.findMany({ select: { id: true, name: true, city: true }, orderBy: { name: 'asc' } }),
    ])

    return NextResponse.json({
      success: true,
      data: reservations,
      restaurants,
      stats: {
        upcomingByStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
        today: reservations.filter((r) => r.reservationDate >= startOfToday && r.reservationDate < endOfToday).length,
      },
    })
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch reservations' }, { status: 500 })
  }
}
