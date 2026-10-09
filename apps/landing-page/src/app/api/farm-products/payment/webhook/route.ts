import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface WebhookPayload {
  event: string
  data: {
    refillId: string
    reference?: string
    status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
    amount: number
    currency: string
    accountNumber: string
    customer_phone?: string
    customer_email?: string
    customer_name?: string
    payment_method?: string
    description?: string
    metadata?: Record<string, any>
    created_at: string
    completed_at?: string
  }
}

/**
 * POST /api/farm-products/payment/webhook
 *
 * Webhook endpoint for PayWithCamsol payment notifications
 * This endpoint is called by PayWithCamsol when payment status changes
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text()
    const payload: WebhookPayload = JSON.parse(rawBody)

    console.log('[PAYMENT WEBHOOK] Received webhook:', {
      event: payload.event,
      refillId: payload.data.refillId,
      status: payload.data.status,
      amount: payload.data.amount,
      timestamp: new Date().toISOString(),
    })

    // Verify webhook signature (if secret is configured)
    const signature = request.headers.get('X-PayWithCamsol-Signature') || request.headers.get('X-SuberPay-Signature')
    // TODO: Implement signature verification when secret is available

    // Find the order with this refillId
    const order = await prisma.farmOrder.findFirst({
      where: { paymentReference: payload.data.refillId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      console.error('[PAYMENT WEBHOOK] Order not found for refillId:', payload.data.refillId)
      return NextResponse.json({
        success: false,
        message: 'Order not found',
      }, { status: 404 })
    }

    console.log('[PAYMENT WEBHOOK] Found order:', order.orderNumber, 'Current status:', order.paymentStatus)

    // Process based on event type or status
    const status = payload.data.status.toUpperCase()

    if (payload.event === 'payment.success' || status === 'SUCCESS' || status === 'COMPLETED') {
      await handleSuccessfulPayment(order, payload.data)
    } else if (payload.event === 'payment.failed' || status === 'FAILED') {
      await handleFailedPayment(order, payload.data)
    } else if (payload.event === 'payment.cancelled' || status === 'CANCELLED') {
      await handleCancelledPayment(order, payload.data)
    } else if (status === 'PROCESSING') {
      await handleProcessingPayment(order, payload.data)
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
    })

  } catch (error) {
    console.error('[PAYMENT WEBHOOK] Error:', error)
    return NextResponse.json(
      { success: false, message: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle successful payment
 */
async function handleSuccessfulPayment(order: any, data: WebhookPayload['data']) {
  try {
    console.log('[PAYMENT WEBHOOK] Processing successful payment for order:', order.orderNumber)

    // Update order status
    await prisma.farmOrder.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'COMPLETED',
        status: 'CONFIRMED',
        paidAt: new Date(),
        paymentDetails: data,
      },
    })

    // Add status history entry
    await prisma.farmOrderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'CONFIRMED',
        note: `Payment completed successfully via webhook - RefillID: ${data.refillId}`,
      },
    })

    // Decrease product stock
    console.log('[PAYMENT WEBHOOK] Decreasing stock for order items')
    for (const item of order.items) {
      await prisma.farmProduct.update({
        where: { id: item.productId },
        data: {
          stockQuantity: {
            decrement: item.quantity,
          },
        },
      })
      console.log(`[PAYMENT WEBHOOK] Decreased stock for product ${item.productId} by ${item.quantity}`)
    }

    console.log('[PAYMENT WEBHOOK] Order confirmed successfully:', order.orderNumber)

    // TODO: Send order confirmation email/SMS to customer
    // TODO: Notify admin of new confirmed order

  } catch (error) {
    console.error('[PAYMENT WEBHOOK] Error handling successful payment:', error)
  }
}

/**
 * Handle failed payment
 */
async function handleFailedPayment(order: any, data: WebhookPayload['data']) {
  try {
    console.log('[PAYMENT WEBHOOK] Processing failed payment for order:', order.orderNumber)

    // Update order status
    await prisma.farmOrder.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'FAILED',
        status: 'CANCELLED',
        paymentDetails: data,
      },
    })

    // Add status history entry
    await prisma.farmOrderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'CANCELLED',
        note: `Payment failed - RefillID: ${data.refillId}`,
      },
    })

    console.log('[PAYMENT WEBHOOK] Order cancelled due to payment failure:', order.orderNumber)

    // TODO: Notify customer of payment failure

  } catch (error) {
    console.error('[PAYMENT WEBHOOK] Error handling failed payment:', error)
  }
}

/**
 * Handle cancelled payment
 */
async function handleCancelledPayment(order: any, data: WebhookPayload['data']) {
  try {
    console.log('[PAYMENT WEBHOOK] Processing cancelled payment for order:', order.orderNumber)

    // Update order status
    await prisma.farmOrder.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'CANCELLED',
        status: 'CANCELLED',
        paymentDetails: data,
      },
    })

    // Add status history entry
    await prisma.farmOrderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'CANCELLED',
        note: `Payment cancelled - RefillID: ${data.refillId}`,
      },
    })

    console.log('[PAYMENT WEBHOOK] Order cancelled:', order.orderNumber)

  } catch (error) {
    console.error('[PAYMENT WEBHOOK] Error handling cancelled payment:', error)
  }
}

/**
 * Handle processing payment
 */
async function handleProcessingPayment(order: any, data: WebhookPayload['data']) {
  try {
    console.log('[PAYMENT WEBHOOK] Processing payment status update for order:', order.orderNumber)

    // Update order status
    await prisma.farmOrder.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PROCESSING',
        paymentDetails: data,
      },
    })

    console.log('[PAYMENT WEBHOOK] Order payment status updated to PROCESSING:', order.orderNumber)

  } catch (error) {
    console.error('[PAYMENT WEBHOOK] Error handling processing payment:', error)
  }
}
