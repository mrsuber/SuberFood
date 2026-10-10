import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export const dynamic = 'force-dynamic'

const PAYWITHCAMSOL_API_URL = process.env.PAYWITHCAMSOL_API_URL || 'https://paywithcamsol.com'
const PAYWITHCAMSOL_SECRET_KEY = process.env.PAYWITHCAMSOL_SECRET_KEY || ''

/**
 * GET /api/farm-products/payment/status/[refillId]
 *
 * Check payment status with PayWithCamsol and update order accordingly
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ refillId: string }> }
) {
  try {
    const { refillId } = await params

    if (!refillId) {
      return NextResponse.json(
        { success: false, message: 'Refill ID is required' },
        { status: 400 }
      )
    }

    console.log('[PAYMENT STATUS] Checking status for refillId:', refillId)

    // Check payment status with PayWithCamsol
    const response = await fetch(`${PAYWITHCAMSOL_API_URL}/api/v1/balance/refill/${refillId}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': PAYWITHCAMSOL_SECRET_KEY,
      },
    })

    const data = await response.json()
    console.log('[PAYMENT STATUS] PayWithCamsol response:', JSON.stringify(data, null, 2))

    if (!response.ok) {
      console.error('[PAYMENT STATUS] Status check failed:', data)
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Payment status check failed',
          details: data
        },
        { status: response.status }
      )
    }

    // Find the order with this refill ID
    const order = await prisma.farmOrder.findFirst({
      where: { paymentReference: refillId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      console.error('[PAYMENT STATUS] Order not found for refillId:', refillId)
      return NextResponse.json({
        success: true,
        paymentStatus: data.data?.refillState || data.status,
        message: 'Payment status retrieved (no order found)',
        data,
      })
    }

    // CRITICAL FIX: If order is already CONFIRMED, don't revert it!
    // The backend polling service may have already confirmed this order
    if (order.paymentStatus === 'COMPLETED' && order.status === 'CONFIRMED') {
      console.log('[PAYMENT STATUS] Order already confirmed by backend polling, keeping status')
      return NextResponse.json({
        success: true,
        paymentStatus: 'COMPLETED',
        orderStatus: 'CONFIRMED',
        orderNumber: order.orderNumber,
        message: 'Payment already confirmed',
        data,
      })
    }

    // Map PayWithCamsol refill state to our payment status
    // PayWithCamsol returns status in data.status field
    const refillState = data.data?.status || data.data?.refillState || data.status
    let paymentStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' = 'PENDING'
    let orderStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' = order.status

    console.log('[PAYMENT STATUS] Refill state from PayWithCamsol:', refillState)
    console.log('[PAYMENT STATUS] Full data.data:', JSON.stringify(data.data, null, 2))
    console.log('[PAYMENT STATUS] Current order status:', order.status, 'Current payment status:', order.paymentStatus)

    // CRITICAL: Only treat as COMPLETED when PayWithCamsol confirms payment
    // 'Pending' (capital P) = waiting for customer to confirm on phone
    // 'Processing' (capital P) or 'Completed' = customer confirmed, money withdrawn
    // Match the exact logic from working camsol_management_system
    if (refillState === 'Completed' ||
        refillState === 'PROCESSING' ||
        refillState === 'Processing') {
      // Payment confirmed by customer!
      paymentStatus = 'COMPLETED'
      orderStatus = 'CONFIRMED'
    } else if (refillState === 'Failed' || refillState === 'FAILED' || refillState === 'failed') {
      paymentStatus = 'FAILED'
      orderStatus = 'CANCELLED'
    } else if (refillState === 'Cancelled' || refillState === 'CANCELED' || refillState === 'Canceled') {
      paymentStatus = 'CANCELLED'
      orderStatus = 'CANCELLED'
    } else if (refillState === 'Pending' || refillState === 'pending' || refillState === 'PENDING') {
      // Still waiting for customer to dial code and confirm
      paymentStatus = 'PROCESSING'
      // ONLY set to PENDING if order is not already CONFIRMED
      orderStatus = order.status === 'CONFIRMED' ? 'CONFIRMED' : 'PENDING'
    } else {
      // Unknown status, keep current status
      paymentStatus = order.paymentStatus || 'PENDING'
      orderStatus = order.status
    }

    console.log('[PAYMENT STATUS] Mapped status:', { paymentStatus, orderStatus })

    // Only update if status has changed
    if (order.paymentStatus !== paymentStatus) {
      console.log('[PAYMENT STATUS] Updating order:', order.id, 'to', paymentStatus)

      // Update order
      await prisma.farmOrder.update({
        where: { id: order.id },
        data: {
          paymentStatus,
          status: orderStatus,
          paidAt: paymentStatus === 'COMPLETED' ? new Date() : order.paidAt,
          paymentDetails: data,
        },
      })

      // Add status history entry
      await prisma.farmOrderStatusHistory.create({
        data: {
          orderId: order.id,
          status: orderStatus,
          note: `Payment ${paymentStatus.toLowerCase()}: ${refillState}`,
        },
      })

      // If payment completed, decrease product stock and handle referral commission
      if (paymentStatus === 'COMPLETED' && order.status !== 'CONFIRMED') {
        console.log('[PAYMENT STATUS] Payment completed! Decreasing stock for order items')
        for (const item of order.items) {
          await prisma.farmProduct.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          })
          console.log(`[PAYMENT STATUS] Decreased stock for product ${item.productId} by ${item.quantity}`)
        }

        // Handle referral commission if order has referral
        if (order.referredById) {
          console.log('[PAYMENT STATUS] 💰 Processing referral commission for referrer:', order.referredById)

          try {
            // Calculate commission (50% of profit)
            const orderTotal = Number(order.totalAmount)
            const orderCost = Number(order.totalCost || 0)
            const profitAmount = orderTotal - orderCost
            const commissionAmount = profitAmount * 0.5 // 50% of profit

            console.log('[PAYMENT STATUS] Commission calculation:', {
              orderTotal,
              orderCost,
              profitAmount,
              commissionAmount
            })

            // Find referral relationship
            const referral = await prisma.referral.findFirst({
              where: {
                referralCodeId: order.referralCodeId,
                refereeId: order.userId || undefined,
                status: 'ACTIVE',
              },
            })

            if (referral && commissionAmount > 0) {
              // Create referral earning record
              await prisma.referralEarning.create({
                data: {
                  referralId: referral.id,
                  orderId: order.id,
                  orderTotal: new Decimal(orderTotal),
                  orderCost: new Decimal(orderCost),
                  profitAmount: new Decimal(profitAmount),
                  commissionRate: new Decimal(50), // 50% commission rate
                  commissionAmount: new Decimal(commissionAmount),
                  isPaid: false, // Set to false - will be paid via withdrawal
                },
              })

              // Credit referrer wallet
              const referrerWallet = await prisma.wallet.findUnique({
                where: { userId: order.referredById },
              })

              if (referrerWallet) {
                const newBalance = referrerWallet.balance.add(new Decimal(commissionAmount))

                await prisma.walletTransaction.create({
                  data: {
                    walletId: referrerWallet.id,
                    type: 'REFERRAL_REWARD',
                    amount: new Decimal(commissionAmount),
                    balanceBefore: referrerWallet.balance,
                    balanceAfter: newBalance,
                    description: `Referral commission from order ${order.orderNumber}`,
                    referenceType: 'FARM_ORDER',
                    referenceId: order.id,
                  },
                })

                await prisma.wallet.update({
                  where: { id: referrerWallet.id },
                  data: {
                    balance: newBalance,
                    totalEarned: referrerWallet.totalEarned.add(new Decimal(commissionAmount)),
                  },
                })

                console.log(`[PAYMENT STATUS] ✅ Referrer wallet credited: ${commissionAmount} XAF`)
              } else {
                // Create wallet for referrer if it doesn't exist
                const newWallet = await prisma.wallet.create({
                  data: {
                    userId: order.referredById,
                    balance: new Decimal(commissionAmount),
                    totalEarned: new Decimal(commissionAmount),
                  },
                })

                await prisma.walletTransaction.create({
                  data: {
                    walletId: newWallet.id,
                    type: 'REFERRAL_REWARD',
                    amount: new Decimal(commissionAmount),
                    balanceBefore: new Decimal(0),
                    balanceAfter: new Decimal(commissionAmount),
                    description: `Referral commission from order ${order.orderNumber}`,
                    referenceType: 'FARM_ORDER',
                    referenceId: order.id,
                  },
                })

                console.log(`[PAYMENT STATUS] ✅ New wallet created and credited: ${commissionAmount} XAF`)
              }

              // Update referral code stats
              await prisma.referralCode.update({
                where: { id: referral.referralCodeId },
                data: {
                  totalEarnings: {
                    increment: new Decimal(commissionAmount),
                  },
                  lifetimeEarnings: {
                    increment: new Decimal(commissionAmount),
                  },
                },
              })

              console.log('[PAYMENT STATUS] ✅ Referral commission processing complete')
            }
          } catch (referralError) {
            console.error('[PAYMENT STATUS] ❌ Error processing referral commission:', referralError)
            // Don't fail the entire payment confirmation if referral fails
          }
        }
      }
    } else {
      console.log('[PAYMENT STATUS] No status change, skipping update')
    }

    return NextResponse.json({
      success: true,
      paymentStatus,
      orderStatus,
      orderNumber: order.orderNumber,
      message: 'Payment status checked successfully',
      data,
    })

  } catch (error) {
    console.error('[PAYMENT STATUS] Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to check payment status',
      },
      { status: 500 }
    )
  }
}
