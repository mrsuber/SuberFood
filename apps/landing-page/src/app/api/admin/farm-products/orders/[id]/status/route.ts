import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export const dynamic = 'force-dynamic'

// POST /api/admin/farm-products/orders/[id]/status - Update order status
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status, note } = await req.json()

    const order = await prisma.farmOrder.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        referredBy: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update order status in transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order status
      const updated = await tx.farmOrder.update({
        where: { id: params.id },
        data: {
          status,
          ...(status === 'COMPLETED' && { completedAt: new Date() }),
          ...(status === 'CANCELLED' && { cancelledAt: new Date() }),
        },
      })

      // Add status history
      await tx.farmOrderStatusHistory.create({
        data: {
          orderId: params.id,
          status,
          note: note || `Order status updated to ${status}`,
          updatedBy: session.user.id,
        },
      })

      // Handle referral commission when order is completed
      if (status === 'COMPLETED' && order.referredById && order.costPrice) {
        const referrerCommission = Number(order.costPrice) * 0.05 // 5% of farm cost

        // Find referral relationship
        const referral = await tx.referral.findFirst({
          where: {
            referrerId: order.referredById,
            refereeId: order.userId || undefined,
            status: 'ACTIVE',
          },
          include: {
            referralCode: true,
          },
        })

        if (referral) {
          // Create referral earning record
          const profitAmount = order.profitAmount ? Number(order.profitAmount) : 0
          await tx.referralEarning.create({
            data: {
              referralId: referral.id,
              orderId: order.id,
              orderTotal: order.totalAmount,
              orderCost: order.totalCost || new Decimal(0),
              profitAmount: new Decimal(profitAmount),
              commissionRate: new Decimal(50), // 50% commission rate (but of 10% profit = 5% of farm cost)
              commissionAmount: new Decimal(referrerCommission),
              isPaid: true,
              paidAt: new Date(),
            },
          })

          // Credit referrer wallet
          const referrerWallet = await tx.wallet.findUnique({
            where: { userId: order.referredById },
          })

          if (referrerWallet) {
            const newBalance = referrerWallet.balance.add(new Decimal(referrerCommission))

            await tx.walletTransaction.create({
              data: {
                walletId: referrerWallet.id,
                type: 'REFERRAL_EARNING',
                amount: new Decimal(referrerCommission),
                balanceBefore: referrerWallet.balance,
                balanceAfter: newBalance,
                description: `Referral commission from order ${order.orderNumber}`,
                referenceType: 'ORDER',
                referenceId: order.id,
              },
            })

            await tx.wallet.update({
              where: { id: referrerWallet.id },
              data: {
                balance: newBalance,
                totalReferralEarnings: referrerWallet.totalReferralEarnings.add(
                  new Decimal(referrerCommission)
                ),
              },
            })
          } else {
            // Create wallet for referrer if it doesn't exist
            const newWallet = await tx.wallet.create({
              data: {
                userId: order.referredById,
                balance: new Decimal(referrerCommission),
                totalReferralEarnings: new Decimal(referrerCommission),
              },
            })

            await tx.walletTransaction.create({
              data: {
                walletId: newWallet.id,
                type: 'REFERRAL_EARNING',
                amount: new Decimal(referrerCommission),
                balanceBefore: new Decimal(0),
                balanceAfter: new Decimal(referrerCommission),
                description: `Referral commission from order ${order.orderNumber}`,
                referenceType: 'ORDER',
                referenceId: order.id,
              },
            })
          }
        }
      }

      return updated
    })

    return NextResponse.json({
      success: true,
      data: updatedOrder,
    })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update order status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
