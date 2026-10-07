import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/admin/payment-transactions - Get all payment transactions with stats
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

    // Fetch all payment transactions
    const transactions = await prisma.paymentTransaction.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        farmOrder: {
          select: {
            orderNumber: true,
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
        const amount = Number(tx.amount)

        return {
          totalTransactions: acc.totalTransactions + 1,
          totalAmount: acc.totalAmount + (tx.status === 'SUCCESS' ? amount : 0),
          successfulPayments:
            acc.successfulPayments + (tx.status === 'SUCCESS' ? 1 : 0),
          failedPayments:
            acc.failedPayments + (tx.status === 'FAILED' ? 1 : 0),
          pendingPayments:
            acc.pendingPayments +
            (tx.status === 'PENDING' || tx.status === 'PROCESSING' ? 1 : 0),
        }
      },
      {
        totalTransactions: 0,
        totalAmount: 0,
        successfulPayments: 0,
        failedPayments: 0,
        pendingPayments: 0,
      }
    )

    // Map to include order info
    const transactionsWithOrder = transactions.map((tx) => ({
      ...tx,
      order: tx.farmOrder || null,
    }))

    return NextResponse.json({
      success: true,
      stats,
      transactions: transactionsWithOrder,
    })
  } catch (error) {
    console.error('Error fetching payment transactions:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch payment transactions' },
      { status: 500 }
    )
  }
}
