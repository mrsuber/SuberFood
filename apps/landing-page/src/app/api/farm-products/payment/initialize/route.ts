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

    // Initialize payment with PayWithCamsol using balance/refill endpoint
    // This endpoint triggers mobile money prompt directly

    // Format phone number for Cameroon - add country code if not present
    let phoneNumber = customerPhone || order.guestPhone
    // Remove any spaces, dashes, or parentheses
    phoneNumber = phoneNumber.replace(/[\s\-()]/g, '')
    // Add 237 country code if not present
    if (!phoneNumber.startsWith('237') && !phoneNumber.startsWith('+237')) {
      phoneNumber = '237' + phoneNumber
    }
    // Remove + if present
    phoneNumber = phoneNumber.replace(/^\+/, '')

    const paymentData = {
      amount: Math.round(parseFloat(amount.toString())), // Ensure it's an integer
      accountNumber: phoneNumber, // Phone number for mobile money with country code
    }

    console.log('[PAYMENT INIT] Payment data:', JSON.stringify(paymentData, null, 2))
    console.log('[PAYMENT INIT] Order metadata:', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: customerName || order.guestName,
      paymentMethod: paymentMethod || 'MTN',
    })

    // Call PayWithCamsol API using balance/refill endpoint
    // This is the correct endpoint that triggers mobile money prompt
    const endpoint = `${PAYWITHCAMSOL_API_URL}/api/v1/balance/refill`
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

    // Handle balance/refill response structure
    // Response format: { success: true, data: { refillId: "...", ... } }
    const responseData = result.data || result
    const refillId = responseData.refillId || responseData.id || responseData.reference

    console.log('[PAYMENT INIT] Extracted refillId:', refillId)
    console.log('[PAYMENT INIT] Payment sent to phone:', customerPhone || order.guestPhone)

    // Update order with payment reference
    await prisma.farmOrder.update({
      where: { id: orderId },
      data: {
        paymentReference: refillId,
        paymentStatus: 'PROCESSING',
        paymentDetails: responseData,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Payment initialized successfully',
      data: {
        refillId,
        reference: refillId,
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
