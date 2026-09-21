import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/farm-products/payment/initialize - Initialize payment with PayWithCamsol
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, amount, customerEmail, customerPhone, customerName } = body

    // Validate required fields
    if (!orderId || !amount) {
      return NextResponse.json(
        { success: false, message: 'Order ID and amount are required' },
        { status: 400 }
      )
    }

    // Get order details
    const order = await prisma.farmOrder.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    // PayWithCamsol API configuration
    const PAYWITHCAMSOL_API_URL = process.env.PAYWITHCAMSOL_API_URL || 'https://api.paywithcamsol.com'
    const PAYWITHCAMSOL_API_KEY = process.env.PAYWITHCAMSOL_API_KEY
    const PAYWITHCAMSOL_SECRET_KEY = process.env.PAYWITHCAMSOL_SECRET_KEY

    if (!PAYWITHCAMSOL_API_KEY || !PAYWITHCAMSOL_SECRET_KEY) {
      console.error('PayWithCamsol API credentials not configured')
      return NextResponse.json(
        {
          success: false,
          message: 'Payment gateway not configured. Please contact support.',
        },
        { status: 500 }
      )
    }

    // Prepare callback URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const callbackUrl = `${baseUrl}/api/farm-products/payment/callback`
    const returnUrl = `${baseUrl}/distribution/farm-products/order-confirmation?orderNumber=${order.orderNumber}`
    const cancelUrl = `${baseUrl}/distribution/farm-products/checkout?failed=true`

    // Initialize payment with PayWithCamsol
    const paymentData = {
      api_key: PAYWITHCAMSOL_API_KEY,
      amount: Math.round(parseFloat(amount.toString())), // Ensure it's an integer
      currency: 'XAF',
      description: `Farm Products Order ${order.orderNumber}`,
      reference: order.orderNumber,
      customer: {
        name: customerName || order.guestName,
        email: customerEmail || order.guestEmail || undefined,
        phone: customerPhone || order.guestPhone,
      },
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        type: 'farm_products',
      },
      callback_url: callbackUrl,
      return_url: returnUrl,
      cancel_url: cancelUrl,
    }

    // Call PayWithCamsol API
    const response = await fetch(`${PAYWITHCAMSOL_API_URL}/v1/payment/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PAYWITHCAMSOL_SECRET_KEY}`,
      },
      body: JSON.stringify(paymentData),
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      console.error('PayWithCamsol initialization failed:', result)
      return NextResponse.json(
        {
          success: false,
          message: result.message || 'Failed to initialize payment',
        },
        { status: 500 }
      )
    }

    // Update order with payment reference
    await prisma.farmOrder.update({
      where: { id: orderId },
      data: {
        paymentReference: result.data.reference || result.data.transaction_id,
        paymentStatus: 'PROCESSING',
        paymentDetails: result.data,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Payment initialized successfully',
      data: {
        paymentUrl: result.data.payment_url || result.data.authorization_url,
        reference: result.data.reference || result.data.transaction_id,
      },
    })
  } catch (error) {
    console.error('Error initializing payment:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to initialize payment',
      },
      { status: 500 }
    )
  }
}
