import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // Map PayWithCamsol refill state to our payment status
    // PayWithCamsol returns status in data.status field
    const refillState = data.data?.status || data.data?.refillState || data.status
    let paymentStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' = 'PENDING'
    let orderStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' = order.status

    console.log('[PAYMENT STATUS] Refill state from PayWithCamsol:', refillState)
    console.log('[PAYMENT STATUS] Full data.data:', JSON.stringify(data.data, null, 2))

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
    } else {
      // Unknown status, keep as pending
      paymentStatus = 'PENDING'
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

      // If payment completed, decrease product stock
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
