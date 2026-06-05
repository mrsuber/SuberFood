import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/orders
 * Fetch paginated orders for admin dashboard with optimized queries
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has admin role
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    const where: any = {}

    if (type && type !== 'all') {
      where.type = type
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    // Run queries in parallel for better performance
    const [orders, totalCount, statsData] = await Promise.all([
      // Fetch paginated orders with minimal data for list view
      prisma.order.findMany({
        where,
        select: {
          id: true,
          orderNumber: true,
          type: true,
          status: true,
          total: true,
          createdAt: true,
          customerName: true,
          phoneNumber: true,
          deliveryAddress: true,
          shippingAddress: true,
          tableNumber: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          restaurant: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              state: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),

      // Get total count for pagination
      prisma.order.count({ where }),

      // Calculate stats using database aggregations (much faster)
      prisma.order.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
        _sum: {
          total: true,
        },
      }),
    ])

    // Process stats from aggregation
    const stats = {
      totalOrders: totalCount,
      pending: 0,
      processing: 0,
      delivered: 0,
      totalRevenue: 0,
    }

    statsData.forEach((stat) => {
      const count = stat._count.id
      const revenue = stat._sum.total || 0

      if (stat.status === 'PENDING') {
        stats.pending = count
      } else if (stat.status === 'CONFIRMED' || stat.status === 'PREPARING') {
        stats.processing += count
      } else if (stat.status === 'COMPLETED' || stat.status === 'DELIVERED') {
        stats.delivered += count
      }

      stats.totalRevenue += revenue
    })

    // Transform orders to include itemCount instead of full items array
    const transformedOrders = orders.map((order) => ({
      ...order,
      items: [], // Empty for list view
      itemCount: order._count.items,
      _count: undefined, // Remove from response
    }))

    return NextResponse.json({
      orders: transformedOrders,
      stats,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
      },
    })
  } catch (error) {
    console.error('Error fetching admin orders:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch orders',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
