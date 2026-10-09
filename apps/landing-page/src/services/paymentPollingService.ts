/**
 * Backend Payment Polling Service
 *
 * CRITICAL: This runs on the server and continues even if user closes browser
 * Ensures payments are confirmed even if frontend polling stops
 */

import { prisma } from '@/lib/prisma'

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

      console.log('[PAYMENT POLLING SERVICE] Payment status:', paymentStatus.status, 'for refillId:', refillId)

      // Check if payment is completed
      if (
        paymentStatus.status === 'Completed' ||
        paymentStatus.status === 'PROCESSING' ||
        paymentStatus.status === 'Processing'
      ) {
        console.log('[PAYMENT POLLING SERVICE] Payment COMPLETED! Confirming order:', orderId)

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
        console.log('[PAYMENT POLLING SERVICE] Payment FAILED for order:', orderId)

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
    const response = await fetch(
      `${PAYWITHCAMSOL_API_URL}/balance/refill/${refillId}/status`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': PAYWITHCAMSOL_SECRET_KEY,
        },
      }
    )

    if (!response.ok) {
      console.error('[PAYMENT POLLING SERVICE] PayWithCamsol API error:', response.status)
      return null
    }

    const data = await response.json()
    return {
      status: data.data?.status || data.data?.refillState || data.status,
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
    console.log('[PAYMENT POLLING SERVICE] Confirming order:', order.orderNumber)

    // Double-check to prevent race condition with webhook
    const currentOrder = await prisma.farmOrder.findUnique({
      where: { id: order.id },
    })

    if (currentOrder?.paymentStatus === 'COMPLETED' && currentOrder?.status === 'CONFIRMED') {
      console.log('[PAYMENT POLLING SERVICE] Order already confirmed (likely by webhook)')
      return
    }

    // Update order status
    await prisma.farmOrder.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'COMPLETED',
        status: 'CONFIRMED',
        paidAt: new Date(),
        paymentDetails: paymentStatus.data,
      },
    })

    // Add status history
    await prisma.farmOrderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'CONFIRMED',
        note: `Payment confirmed by backend polling service - RefillID: ${order.paymentReference}`,
      },
    })

    // Decrease stock ONLY if order wasn't already confirmed
    if (currentOrder?.status !== 'CONFIRMED') {
      console.log('[PAYMENT POLLING SERVICE] Decreasing stock for order:', order.orderNumber)
      for (const item of order.items) {
        await prisma.farmProduct.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        })
        console.log(`[PAYMENT POLLING SERVICE] Decreased stock for product ${item.productId} by ${item.quantity}`)
      }
    } else {
      console.log('[PAYMENT POLLING SERVICE] Stock already decremented, skipping')
    }

    console.log('[PAYMENT POLLING SERVICE] Order confirmed successfully:', order.orderNumber)

    // TODO: Send order confirmation email/SMS
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
