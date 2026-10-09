import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/farm-products/payment/initialize - Initialize payment with PayWithCamsol
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, amount, customerEmail, customerPhone, customerName, paymentMethod } = body

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
    const PAYWITHCAMSOL_API_URL = process.env.PAYWITHCAMSOL_API_URL || 'https://paywithcamsol.com'
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
    // PayWithCamsol expects snake_case parameters
    const paymentData = {
      amount: Math.round(parseFloat(amount.toString())), // Ensure it's an integer
      currency: 'XAF',
      description: `Farm Products Order ${order.orderNumber}`,
      reference: order.orderNumber,
      customer_name: customerName || order.guestName,
      customer_email: customerEmail || order.guestEmail || undefined,
      customer_phone: customerPhone || order.guestPhone,
      payment_method: paymentMethod || 'MTN', // MTN or ORANGE
      callback_url: callbackUrl,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        type: 'farm_products',
      },
    }

    console.log('[PAYMENT INIT] Payment data:', JSON.stringify(paymentData, null, 2))

    // Call PayWithCamsol API
    // Correct endpoint: /api/v1/payments/initiate
    const endpoint = `${PAYWITHCAMSOL_API_URL}/api/v1/payments/initiate`
    console.log(`Initiating payment with PayWithCamsol at: ${endpoint}`)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': PAYWITHCAMSOL_SECRET_KEY, // Use secret key for backend operations
      },
      body: JSON.stringify(paymentData),
    })

    const result = await response.json()
    console.log('[PAYMENT INIT] PayWithCamsol response status:', response.status)
    console.log('[PAYMENT INIT] PayWithCamsol response body:', JSON.stringify(result, null, 2))

    if (!response.ok) {
      console.error('PayWithCamsol initialization failed:', result)
      return NextResponse.json(
        {
          success: false,
          message: result?.message || result?.error || 'Failed to initialize payment',
          details: result
        },
        { status: response.status }
      )
    }

    // Handle different response structures from PayWithCamsol
    // The actual data might be in result.data or directly in result
    const responseData = result.data || result
    const reference = responseData.reference || responseData.transaction_id || responseData.id
    const paymentUrl = responseData.payment_url || responseData.authorization_url || responseData.url

    console.log('[PAYMENT INIT] Extracted reference:', reference)
    console.log('[PAYMENT INIT] Extracted payment URL:', paymentUrl)

    // Update order with payment reference
    await prisma.farmOrder.update({
      where: { id: orderId },
      data: {
        paymentReference: reference,
        paymentStatus: 'PROCESSING',
        paymentDetails: responseData,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Payment initialized successfully',
      data: {
        paymentUrl,
        reference,
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
