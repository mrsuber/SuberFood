import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/admin/financial-ledger - Get all financial transactions with stats
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    // Get period filter from query params
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'all'

    // Calculate date filter
    let dateFilter = {}
    const now = new Date()

    switch (period) {
      case 'today':
        dateFilter = {
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          },
        }
        break
      case 'week':
        const weekAgo = new Date(now)
        weekAgo.setDate(now.getDate() - 7)
        dateFilter = {
          createdAt: {
            gte: weekAgo,
          },
        }
        break
      case 'month':
        dateFilter = {
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
          },
        }
        break
      case 'year':
        dateFilter = {
          createdAt: {
            gte: new Date(now.getFullYear(), 0, 1),
          },
        }
        break
      default:
        // all - no filter
        break
    }

    // Fetch all financial transactions
    const transactions = await prisma.financialTransaction.findMany({
      where: dateFilter,
      include: {
        order: {
          select: {
            orderNumber: true,
            guestName: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate stats
    const stats = transactions.reduce(
      (acc, tx) => {
        const totalAmount = Number(tx.totalAmount)
        const farmCost = Number(tx.farmCost)
        const transportCost = Number(tx.transportCost)
        const referrerCommission = Number(tx.referrerCommission)
        const profit = Number(tx.profit)

        return {
          totalRevenue: acc.totalRevenue + totalAmount,
          totalFarmCosts: acc.totalFarmCosts + farmCost,
          totalTransportCosts: acc.totalTransportCosts + transportCost,
          totalReferrerCommissions: acc.totalReferrerCommissions + referrerCommission,
          totalProfit: acc.totalProfit + profit,
          transactionCount: acc.transactionCount + 1,
        }
      },
      {
        totalRevenue: 0,
        totalFarmCosts: 0,
        totalTransportCosts: 0,
        totalReferrerCommissions: 0,
        totalProfit: 0,
        transactionCount: 0,
      }
    )

    return NextResponse.json({
      success: true,
      stats,
      transactions,
    })
  } catch (error) {
    console.error('Error fetching financial ledger:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch financial data' },
      { status: 500 }
    )
  }
}
