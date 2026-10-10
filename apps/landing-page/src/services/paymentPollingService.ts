/**
 * Backend Payment Polling Service
 *
 * CRITICAL: This runs on the server and continues even if user closes browser
 * Ensures payments are confirmed even if frontend polling stops
 */

import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import {
  sendOrderConfirmationNotification,
  sendReferralCommissionNotification,
} from '@/lib/notifications'

const PAYWITHCAMSOL_API_URL = process.env.NEXT_PUBLIC_PAYWITHCAMSOL_API_URL || 'https://paywithcamsol.com/api/v1'
const PAYWITHCAMSOL_SECRET_KEY = process.env.PAYWITHCAMSOL_SECRET_KEY || ''

interface PollingConfig {
  maxAttempts: number
  intervalMs: number
  onSuccess?: (orderId: string) => void
  onFailure?: (orderId: string, reason: string) => void
  onTimeout?: (orderId: string) => void
}

const DEFAULT_CONFIG: PollingConfig = {
  maxAttempts: 40, // 40 attempts * 3 seconds = 2 minutes
  intervalMs: 3000, // 3 seconds
}

/**
 * Active polling jobs
 * Key: orderId, Value: timeout/interval IDs for cleanup
 */
const activePollingJobs = new Map<string, NodeJS.Timeout>()

/**
 * Start backend polling for a payment
 * This runs independently of the frontend
 */
export async function startPaymentPolling(
  orderId: string,
  refillId: string,
  config: Partial<PollingConfig> = {}
): Promise<void> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  console.log('[PAYMENT POLLING SERVICE] Starting backend polling for order:', orderId, 'refillId:', refillId)

  // Check if already polling this order
  if (activePollingJobs.has(orderId)) {
    console.log('[PAYMENT POLLING SERVICE] Already polling order:', orderId)
    return
  }

  let attempts = 0

  const poll = async () => {
    try {
      attempts++
      console.log(`[PAYMENT POLLING SERVICE] Polling attempt ${attempts}/${finalConfig.maxAttempts} for order ${orderId}`)

      // Fetch order from database to check current status
      const order = await prisma.farmOrder.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      if (!order) {
        console.error('[PAYMENT POLLING SERVICE] Order not found:', orderId)
        stopPolling(orderId)
        finalConfig.onFailure?.(orderId, 'Order not found')
        return
      }

      // If already confirmed, stop polling (webhook or frontend might have completed it)
      if (order.paymentStatus === 'COMPLETED' && order.status === 'CONFIRMED') {
        console.log('[PAYMENT POLLING SERVICE] Payment already confirmed for order:', orderId)
        stopPolling(orderId)
        finalConfig.onSuccess?.(orderId)
        return
      }

      // Check payment status from PayWithCamsol
      const paymentStatus = await checkPaymentStatus(refillId)

      if (!paymentStatus) {
        console.warn('[PAYMENT POLLING SERVICE] Failed to fetch payment status, will retry')
        scheduleNextPoll()
        return
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('[PAYMENT POLLING SERVICE] 📊 BACKEND POLL RESULT')
      console.log('[PAYMENT POLLING SERVICE] Attempt:', attempts, '/', finalConfig.maxAttempts)
      console.log('[PAYMENT POLLING SERVICE] RefillId:', refillId)
      console.log('[PAYMENT POLLING SERVICE] Raw PayWithCamsol Status:', paymentStatus.status)
      console.log('[PAYMENT POLLING SERVICE] Full PayWithCamsol Data:', JSON.stringify(paymentStatus.data, null, 2))
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      // Check if payment is completed
      if (
        paymentStatus.status === 'Completed' ||
        paymentStatus.status === 'PROCESSING' ||
        paymentStatus.status === 'Processing'
      ) {
        console.log('🎉 [PAYMENT POLLING SERVICE] ✅ PAYMENT CONFIRMED BY CUSTOMER!')
        console.log('[PAYMENT POLLING SERVICE] Order to confirm:', orderId)

        // Update order in database
        await confirmOrder(order, paymentStatus)

        stopPolling(orderId)
        finalConfig.onSuccess?.(orderId)
        return
      }

      // Check if payment failed
      if (
        paymentStatus.status === 'Failed' ||
        paymentStatus.status === 'FAILED' ||
        paymentStatus.status === 'Cancelled'
      ) {
        console.log('❌ [PAYMENT POLLING SERVICE] PAYMENT FAILED/CANCELLED')
        console.log('[PAYMENT POLLING SERVICE] Order:', orderId)
        console.log('[PAYMENT POLLING SERVICE] Failure status:', paymentStatus.status)

        await prisma.farmOrder.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'FAILED',
            status: 'CANCELLED',
          },
        })

        stopPolling(orderId)
        finalConfig.onFailure?.(orderId, `Payment ${paymentStatus.status}`)
        return
      }

      // Continue polling if still pending
      console.log('⏳ [PAYMENT POLLING SERVICE] Status still "Pending" - Customer has NOT confirmed yet')
      console.log('[PAYMENT POLLING SERVICE] Will check again in', finalConfig.intervalMs / 1000, 'seconds...')
      scheduleNextPoll()

    } catch (error) {
      console.error('[PAYMENT POLLING SERVICE] Error during polling:', error)
      scheduleNextPoll()
    }
  }

  const scheduleNextPoll = () => {
    if (attempts >= finalConfig.maxAttempts) {
      console.warn('[PAYMENT POLLING SERVICE] Max polling attempts reached for order:', orderId)
      stopPolling(orderId)
      finalConfig.onTimeout?.(orderId)
      return
    }

    const timeoutId = setTimeout(poll, finalConfig.intervalMs)
    activePollingJobs.set(orderId, timeoutId)
  }

  // Start first poll immediately
  poll()
}

/**
 * Stop polling for an order
 */
export function stopPolling(orderId: string): void {
  const timeoutId = activePollingJobs.get(orderId)
  if (timeoutId) {
    clearTimeout(timeoutId)
    activePollingJobs.delete(orderId)
    console.log('[PAYMENT POLLING SERVICE] Stopped polling for order:', orderId)
  }
}

/**
 * Check payment status from PayWithCamsol
 */
async function checkPaymentStatus(refillId: string): Promise<{ status: string; data?: any } | null> {
  try {
    const url = `${PAYWITHCAMSOL_API_URL}/balance/refill/${refillId}/status`
    console.log('[PAYMENT POLLING SERVICE] Checking status at URL:', url)
    console.log('[PAYMENT POLLING SERVICE] Using API Key:', PAYWITHCAMSOL_SECRET_KEY ? `${PAYWITHCAMSOL_SECRET_KEY.substring(0, 10)}...` : 'NOT SET')

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': PAYWITHCAMSOL_SECRET_KEY,
      },
    })

    console.log('[PAYMENT POLLING SERVICE] Response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[PAYMENT POLLING SERVICE] PayWithCamsol API error:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      })
      return null
    }

    const data = await response.json()
    console.log('[PAYMENT POLLING SERVICE] Raw API response:', JSON.stringify(data, null, 2))

    const extractedStatus = data.data?.status || data.data?.refillState || data.status
    console.log('[PAYMENT POLLING SERVICE] Extracted status:', extractedStatus)
    console.log('[PAYMENT POLLING SERVICE] Full data.data:', JSON.stringify(data.data, null, 2))

    return {
      status: extractedStatus,
      data: data.data,
    }
  } catch (error) {
    console.error('[PAYMENT POLLING SERVICE] Error checking payment status:', error)
    return null
  }
}

/**
 * Confirm order after successful payment
 */
async function confirmOrder(order: any, paymentStatus: any): Promise<void> {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('💾 [PAYMENT POLLING SERVICE] STARTING ORDER CONFIRMATION')
    console.log('[PAYMENT POLLING SERVICE] Order Number:', order.orderNumber)
    console.log('[PAYMENT POLLING SERVICE] Order ID:', order.id)
    console.log('[PAYMENT POLLING SERVICE] Payment Reference:', order.paymentReference)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Double-check to prevent race condition with webhook
    const currentOrder = await prisma.farmOrder.findUnique({
      where: { id: order.id },
    })

    console.log('[PAYMENT POLLING SERVICE] Current DB state BEFORE update:')
    console.log('  - paymentStatus:', currentOrder?.paymentStatus)
    console.log('  - status:', currentOrder?.status)

    if (currentOrder?.paymentStatus === 'COMPLETED' && currentOrder?.status === 'CONFIRMED') {
      console.log('⚠️ [PAYMENT POLLING SERVICE] Order already confirmed (likely by webhook)')
      console.log('[PAYMENT POLLING SERVICE] Skipping duplicate confirmation')
      return
    }

    // Update order status
    console.log('[PAYMENT POLLING SERVICE] 📝 Updating order in database...')
    console.log('[PAYMENT POLLING SERVICE] Setting paymentStatus: COMPLETED')
    console.log('[PAYMENT POLLING SERVICE] Setting status: CONFIRMED')

    await prisma.farmOrder.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'COMPLETED',
        status: 'CONFIRMED',
        paidAt: new Date(),
        paymentDetails: paymentStatus.data,
      },
    })

    console.log('✅ [PAYMENT POLLING SERVICE] Order updated in database successfully!')

    // Add status history
    console.log('[PAYMENT POLLING SERVICE] 📝 Adding status history entry...')
    await prisma.farmOrderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'CONFIRMED',
        note: `Payment confirmed by backend polling service - RefillID: ${order.paymentReference}`,
      },
    })

    // Decrease stock ONLY if order wasn't already confirmed
    if (currentOrder?.status !== 'CONFIRMED') {
      console.log('[PAYMENT POLLING SERVICE] 📦 Decreasing stock for order:', order.orderNumber)
      console.log('[PAYMENT POLLING SERVICE] Number of items:', order.items.length)
      for (const item of order.items) {
        await prisma.farmProduct.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        })
        console.log(`  ✅ Product ${item.product.name} (ID: ${item.productId}): Decreased by ${item.quantity}`)
      }
      console.log('[PAYMENT POLLING SERVICE] ✅ Stock decremented for all items')
    } else {
      console.log('⚠️ [PAYMENT POLLING SERVICE] Stock already decremented, skipping')
    }

    // Handle referral commission if order has referral
    if (order.referredById && currentOrder?.status !== 'CONFIRMED') {
      console.log('[PAYMENT POLLING SERVICE] 💰 Processing referral commission...')
      console.log('[PAYMENT POLLING SERVICE] Referrer ID:', order.referredById)

      try {
        // Calculate commission (50% of profit)
        const orderTotal = Number(order.totalAmount)
        const orderCost = Number(order.totalCost || 0)
        const profitAmount = orderTotal - orderCost
        const commissionAmount = profitAmount * 0.5 // 50% of profit

        console.log('[PAYMENT POLLING SERVICE] Order Total:', orderTotal, 'XAF')
        console.log('[PAYMENT POLLING SERVICE] Order Cost:', orderCost, 'XAF')
        console.log('[PAYMENT POLLING SERVICE] Profit:', profitAmount, 'XAF')
        console.log('[PAYMENT POLLING SERVICE] Commission (50%):', commissionAmount, 'XAF')

        // Find referral relationship
        const referral = await prisma.referral.findFirst({
          where: {
            referralCodeId: order.referralCodeId,
            refereeId: order.userId || undefined,
            status: 'ACTIVE',
          },
          include: {
            referralCode: true,
          },
        })

        if (referral && commissionAmount > 0) {
          console.log('[PAYMENT POLLING SERVICE] Found active referral:', referral.id)

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
              paidAt: null,
            },
          })

          console.log('[PAYMENT POLLING SERVICE] ✅ Referral earning record created')

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

            console.log('[PAYMENT POLLING SERVICE] ✅ Referrer wallet credited:', commissionAmount, 'XAF')
            console.log('[PAYMENT POLLING SERVICE] New wallet balance:', Number(newBalance), 'XAF')

            // Send commission notification to referrer
            try {
              const referrerUser = await prisma.user.findUnique({
                where: { id: order.referredById },
              })

              if (referrerUser) {
                await sendReferralCommissionNotification({
                  referrerName: referrerUser.name || referrerUser.email || 'Referrer',
                  referrerEmail: referrerUser.email || undefined,
                  referrerPhone: referrerUser.phone || undefined,
                  orderNumber: order.orderNumber,
                  commissionAmount,
                  newWalletBalance: Number(newBalance),
                })
              }
            } catch (notificationError) {
              console.error('[PAYMENT POLLING SERVICE] ❌ Error sending commission notification:', notificationError)
              // Don't fail commission processing if notification fails
            }
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

            console.log('[PAYMENT POLLING SERVICE] ✅ New wallet created and credited:', commissionAmount, 'XAF')

            // Send commission notification to referrer
            try {
              const referrerUser = await prisma.user.findUnique({
                where: { id: order.referredById },
              })

              if (referrerUser) {
                await sendReferralCommissionNotification({
                  referrerName: referrerUser.name || referrerUser.email || 'Referrer',
                  referrerEmail: referrerUser.email || undefined,
                  referrerPhone: referrerUser.phone || undefined,
                  orderNumber: order.orderNumber,
                  commissionAmount,
                  newWalletBalance: commissionAmount,
                })
              }
            } catch (notificationError) {
              console.error('[PAYMENT POLLING SERVICE] ❌ Error sending commission notification:', notificationError)
              // Don't fail commission processing if notification fails
            }
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

          console.log('[PAYMENT POLLING SERVICE] ✅ Referral code stats updated')
        } else {
          if (!referral) {
            console.log('[PAYMENT POLLING SERVICE] ⚠️ No active referral found for this order')
          }
          if (commissionAmount <= 0) {
            console.log('[PAYMENT POLLING SERVICE] ⚠️ Commission amount is 0 or negative')
          }
        }
      } catch (referralError) {
        console.error('[PAYMENT POLLING SERVICE] ❌ Error processing referral commission:', referralError)
        // Don't fail the entire order confirmation if referral fails
      }
    } else {
      if (!order.referredById) {
        console.log('[PAYMENT POLLING SERVICE] No referral for this order')
      }
      if (currentOrder?.status === 'CONFIRMED') {
        console.log('[PAYMENT POLLING SERVICE] Order already confirmed, skipping referral commission')
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 [PAYMENT POLLING SERVICE] ✅✅✅ ORDER CONFIRMATION COMPLETE! ✅✅✅')
    console.log('[PAYMENT POLLING SERVICE] Order Number:', order.orderNumber)
    console.log('[PAYMENT POLLING SERVICE] Status: CONFIRMED')
    console.log('[PAYMENT POLLING SERVICE] Payment: COMPLETED')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Send order confirmation notification
    try {
      await sendOrderConfirmationNotification({
        customerName: order.guestName,
        customerEmail: order.guestEmail || undefined,
        customerPhone: order.guestPhone,
        orderNumber: order.orderNumber,
        orderTotal: Number(order.totalAmount),
        orderStatus: 'CONFIRMED',
        deliveryAddress: order.deliveryAddress || undefined,
        items: order.items.map((item: any) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: Number(item.price),
        })),
      })
    } catch (notificationError) {
      console.error('[PAYMENT POLLING SERVICE] ❌ Error sending order confirmation notification:', notificationError)
      // Don't fail order confirmation if notification fails
    }
  } catch (error) {
    console.error('[PAYMENT POLLING SERVICE] Error confirming order:', error)
    throw error
  }
}

/**
 * Get status of active polling jobs (for monitoring)
 */
export function getActivePollingJobs(): string[] {
  return Array.from(activePollingJobs.keys())
}

/**
 * Stop all polling jobs (for cleanup on server shutdown)
 */
export function stopAllPolling(): void {
  console.log('[PAYMENT POLLING SERVICE] Stopping all polling jobs')
  activePollingJobs.forEach((timeoutId, orderId) => {
    clearTimeout(timeoutId)
    console.log('[PAYMENT POLLING SERVICE] Stopped polling for order:', orderId)
  })
  activePollingJobs.clear()
}
