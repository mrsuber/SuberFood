import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/farm-products/payment/callback - Handle payment callback from PayWithCamsol
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // PayWithCamsol sends payment status updates
    const {
      reference,
      status,
      transaction_id,
      amount,
      currency,
      payment_method,
      metadata,
    } = body

    // Verify the callback is from PayWithCamsol (you should implement signature verification)
    // For now, we'll proceed with updating the order

    if (!reference && !metadata?.orderNumber) {
      return NextResponse.json(
        { success: false, message: 'Invalid callback: missing reference' },
        { status: 400 }
      )
    }

    // Find the order
    const orderNumber = reference || metadata?.orderNumber
    const order = await prisma.farmOrder.findUnique({
      where: { orderNumber },
    })

    if (!order) {
      console.error(`Order not found for reference: ${orderNumber}`)
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    // Map PayWithCamsol status to our payment status
    let paymentStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' = 'PENDING'
    let orderStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' = 'PENDING'

    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
      case 'successful':
        paymentStatus = 'COMPLETED'
        orderStatus = 'CONFIRMED'
        break
      case 'failed':
      case 'error':
        paymentStatus = 'FAILED'
        break
      case 'cancelled':
      case 'canceled':
        paymentStatus = 'CANCELLED'
        orderStatus = 'CANCELLED'
        break
      case 'pending':
      case 'processing':
        paymentStatus = 'PROCESSING'
        break
      default:
        paymentStatus = 'PENDING'
    }

    // Update order with payment information
    const updatedOrder = await prisma.farmOrder.update({
      where: { id: order.id },
      data: {
        paymentStatus,
        paymentReference: transaction_id || reference,
        paymentMethod: payment_method ? mapPaymentMethod(payment_method) : order.paymentMethod,
        paymentDetails: body, // Store the full callback data
        paidAt: paymentStatus === 'COMPLETED' ? new Date() : null,
        status: orderStatus,
      },
    })

    // Add status history entry
    if (paymentStatus === 'COMPLETED') {
      await prisma.farmOrderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'CONFIRMED',
          note: 'Payment received successfully',
        },
      })

      // TODO: Send order confirmation email/SMS to customer
      // TODO: Notify admin of new order
    } else if (paymentStatus === 'FAILED') {
      await prisma.farmOrderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'CANCELLED',
          note: 'Payment failed',
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Payment callback processed successfully',
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentStatus: updatedOrder.paymentStatus,
      },
    })
  } catch (error) {
    console.error('Error processing payment callback:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process payment callback',
      },
      { status: 500 }
    )
  }
}

// GET /api/farm-products/payment/callback - Handle return from payment gateway
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const reference = searchParams.get('reference')
    const status = searchParams.get('status')

    if (!reference) {
      return NextResponse.redirect(new URL('/distribution/farm-products?error=invalid_reference', req.url))
    }

    // Find the order
    const order = await prisma.farmOrder.findUnique({
      where: { orderNumber: reference },
    })

    if (!order) {
      return NextResponse.redirect(new URL('/distribution/farm-products?error=order_not_found', req.url))
    }

    // Redirect to order confirmation page
    if (status === 'success' || order.paymentStatus === 'COMPLETED') {
      return NextResponse.redirect(
        new URL(`/distribution/farm-products/order-confirmation?orderNumber=${reference}`, req.url)
      )
    } else {
      return NextResponse.redirect(
        new URL(`/distribution/farm-products/checkout?failed=true&orderNumber=${reference}`, req.url)
      )
    }
  } catch (error) {
    console.error('Error handling payment return:', error)
    return NextResponse.redirect(new URL('/distribution/farm-products?error=payment_error', req.url))
  }
}

// Helper function to map payment method from PayWithCamsol to our enum
function mapPaymentMethod(method: string): 'MOBILE_MONEY' | 'BANK_CARD' | 'BANK_TRANSFER' | 'CASH_ON_PICKUP' | 'CASH_ON_DELIVERY' {
  const lowerMethod = method.toLowerCase()

  if (lowerMethod.includes('mobile') || lowerMethod.includes('momo') || lowerMethod.includes('mtn') || lowerMethod.includes('orange')) {
    return 'MOBILE_MONEY'
  } else if (lowerMethod.includes('card') || lowerMethod.includes('visa') || lowerMethod.includes('mastercard')) {
    return 'BANK_CARD'
  } else if (lowerMethod.includes('transfer') || lowerMethod.includes('bank')) {
    return 'BANK_TRANSFER'
  }

  return 'MOBILE_MONEY' // Default
}
