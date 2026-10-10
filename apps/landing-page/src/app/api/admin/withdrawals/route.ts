import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/withdrawals
 * Get all withdrawal requests with filtering
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'all'

    // Build where clause
    const where: any = {}
    if (status !== 'all') {
      where.status = status.toUpperCase()
    }

    // Get all withdrawal requests
    const withdrawalRequests = await prisma.withdrawalRequest.findMany({
      where,
      include: {
        wallet: {
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
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate statistics
    const stats = {
      total: withdrawalRequests.length,
      pending: withdrawalRequests.filter(w => w.status === 'PENDING').length,
      completed: withdrawalRequests.filter(w => w.status === 'COMPLETED').length,
      rejected: withdrawalRequests.filter(w => w.status === 'REJECTED').length,
      totalPendingAmount: withdrawalRequests
        .filter(w => w.status === 'PENDING')
        .reduce((sum, w) => sum + Number(w.amount), 0),
      totalCompletedAmount: withdrawalRequests
        .filter(w => w.status === 'COMPLETED')
        .reduce((sum, w) => sum + Number(w.amount), 0),
    }

    // Format withdrawal requests for frontend
    const formattedRequests = withdrawalRequests.map(req => ({
      id: req.id,
      amount: Number(req.amount),
      method: req.method,
      phoneNumber: req.phoneNumber,
      accountDetails: req.accountDetails,
      status: req.status,
      adminNotes: req.adminNotes,
      createdAt: req.createdAt,
      reviewedAt: req.reviewedAt,
      user: req.wallet.user,
      reviewer: req.reviewer,
      walletBalance: Number(req.wallet.balance),
    }))

    return NextResponse.json({
      success: true,
      stats,
      withdrawalRequests: formattedRequests,
    })
  } catch (error) {
    console.error('[ADMIN WITHDRAWALS] Error fetching withdrawals:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch withdrawals',
      },
      { status: 500 }
    )
  }
}
