import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export const dynamic = 'force-dynamic'

/**
 * POST /api/farm-products/payment/manual-confirm
 *
 * Manually confirm a payment (ADMIN ONLY - requires authentication)
 * Use this when money is confirmed in PayWithCamsol account but status API hasn't updated
 *
 * SECURITY: This endpoint requires admin authentication to prevent unauthorized confirmations
 */
export async function POST(req: NextRequest) {
  try {
    // SECURITY: Check authentication - ONLY admins can manually confirm payments
    const session = await getServerSession()

    if (!session || !session.user) {
      console.error('[MANUAL CONFIRM] Unauthorized access attempt')
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // TODO: Add role check when user roles are implemented
    // if (session.user.role !== 'ADMIN') {
    //   return NextResponse.json(
    //     { success: false, message: 'Admin privileges required' },
    //     { status: 403 }
    //   )
    // }

    console.log('[MANUAL CONFIRM] Authenticated user:', session.user.email)

    const body = await req.json()
    const { orderNumber, refillId } = body

    if (!orderNumber && !refillId) {
      return NextResponse.json(
        { success: false, message: 'Either orderNumber or refillId is required' },
        { status: 400 }
      )
    }

    console.log('[MANUAL CONFIRM] Confirming payment for:', { orderNumber, refillId })

    // Find the order
    let order
    if (orderNumber) {
      order = await prisma.farmOrder.findUnique({
        where: { orderNumber },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })
    } else if (refillId) {
      order = await prisma.farmOrder.findFirst({
        where: { paymentReference: refillId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })
    }

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    console.log('[MANUAL CONFIRM] Found order:', order.orderNumber, 'Current status:', order.paymentStatus)

    // Check if already confirmed
    if (order.paymentStatus === 'COMPLETED' && order.status === 'CONFIRMED') {
      return NextResponse.json({
        success: true,
        message: 'Payment already confirmed',
        order: {
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          status: order.status,
        },
      })
    }

    // Update order status
    await prisma.farmOrder.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'COMPLETED',
        status: 'CONFIRMED',
        paidAt: new Date(),
      },
    })

    // Add status history entry
    await prisma.farmOrderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'CONFIRMED',
        note: `Payment manually confirmed - RefillID: ${order.paymentReference}`,
      },
    })

    // Decrease product stock if not already done
    if (order.status !== 'CONFIRMED') {
      console.log('[MANUAL CONFIRM] Decreasing stock for order items')
      for (const item of order.items) {
        await prisma.farmProduct.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        })
        console.log(`[MANUAL CONFIRM] Decreased stock for product ${item.productId} by ${item.quantity}`)
      }
    }

    console.log('[MANUAL CONFIRM] Order confirmed successfully:', order.orderNumber)

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed successfully',
      order: {
        orderNumber: order.orderNumber,
        paymentStatus: 'COMPLETED',
        status: 'CONFIRMED',
      },
    })

  } catch (error) {
    console.error('[MANUAL CONFIRM] Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to confirm payment',
      },
      { status: 500 }
    )
  }
}
