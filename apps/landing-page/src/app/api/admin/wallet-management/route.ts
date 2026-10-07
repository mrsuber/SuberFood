import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/admin/wallet-management - Get all wallets with stats
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

    // Fetch all wallets with user info
    const wallets = await prisma.wallet.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            transactions: true,
          },
        },
      },
      orderBy: {
        balance: 'desc',
      },
    })

    // Calculate stats
    const stats = wallets.reduce(
      (acc, wallet) => {
        const balance = Number(wallet.balance)
        const earned = Number(wallet.totalEarned)
        const spent = Number(wallet.totalSpent)

        return {
          totalWallets: acc.totalWallets + 1,
          totalBalance: acc.totalBalance + balance,
          totalEarned: acc.totalEarned + earned,
          totalSpent: acc.totalSpent + spent,
          activeWallets: acc.activeWallets + (balance > 0 ? 1 : 0),
        }
      },
      {
        totalWallets: 0,
        totalBalance: 0,
        totalEarned: 0,
        totalSpent: 0,
        activeWallets: 0,
      }
    )

    return NextResponse.json({
      success: true,
      stats,
      wallets,
    })
  } catch (error) {
    console.error('Error fetching wallet management data:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch wallet data' },
      { status: 500 }
    )
  }
}
