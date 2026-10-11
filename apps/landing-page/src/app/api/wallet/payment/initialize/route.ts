import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import { startPaymentPolling } from '@/services/paymentPollingService'

export const dynamic = 'force-dynamic'

// POST /api/wallet/payment/initialize - Initialize wallet deposit payment
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { amount, phoneNumber, method } = body

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid amount' },
        { status: 400 }
      )
    }

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    })

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId: session.user.id },
      })
    }

    // PayWithCamsol API configuration
    const PAYWITHCAMSOL_API_URL = process.env.PAYWITHCAMSOL_API_URL || 'https://paywithcamsol.com'
    const PAYWITHCAMSOL_SECRET_KEY = process.env.PAYWITHCAMSOL_SECRET_KEY

    if (!PAYWITHCAMSOL_SECRET_KEY) {
      console.error('PayWithCamsol API credentials not configured')
      return NextResponse.json(
        {
          success: false,
          message: 'Payment gateway not configured. Please contact support.',
        },
        { status: 500 }
      )
    }

    // Format phone number for Cameroon - add country code if not present
    let formattedPhone = phoneNumber.replace(/[\s\-()]/g, '')
    if (!formattedPhone.startsWith('237') && !formattedPhone.startsWith('+237')) {
      formattedPhone = '237' + formattedPhone
    }
    formattedPhone = formattedPhone.replace(/^\+/, '')

    const paymentData = {
      amount: Math.round(parseFloat(amount.toString())),
      accountNumber: formattedPhone,
    }

    console.log('[WALLET PAYMENT INIT] Payment data:', JSON.stringify(paymentData, null, 2))

    // Call PayWithCamsol API using balance/refill endpoint
    const endpoint = `${PAYWITHCAMSOL_API_URL}/api/v1/balance/refill`
    console.log(`Initiating wallet payment with PayWithCamsol at: ${endpoint}`)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': PAYWITHCAMSOL_SECRET_KEY,
      },
      body: JSON.stringify(paymentData),
    })

    const result = await response.json()
    console.log('[WALLET PAYMENT INIT] PayWithCamsol response status:', response.status)
    console.log('[WALLET PAYMENT INIT] PayWithCamsol response body:', JSON.stringify(result, null, 2))

    if (!response.ok) {
      console.error('[WALLET PAYMENT INIT] Payment initialization failed:', result)
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
    // Try multiple possible field names for the refill ID
    const responseData = result.data || result
    const refillId = responseData.refillId || responseData.id || responseData.reference

    console.log('[WALLET PAYMENT INIT] Extracted refillId:', refillId)
    console.log('[WALLET PAYMENT INIT] Response data:', JSON.stringify(responseData, null, 2))

    if (!refillId) {
      console.error('[WALLET PAYMENT INIT] No refill ID found in response')
      console.error('[WALLET PAYMENT INIT] Tried: refillId, id, reference')
      console.error('[WALLET PAYMENT INIT] Full response:', JSON.stringify(result, null, 2))
      return NextResponse.json(
        {
          success: false,
          message: 'Payment initialization failed - no transaction ID',
          details: result
        },
        { status: 500 }
      )
    }

    // Create a pending wallet refill record
    const refillRecord = await prisma.walletRefill.create({
      data: {
        walletId: wallet.id,
        refillId,
        amount: new Decimal(amount),
        phoneNumber: formattedPhone,
        status: 'PENDING',
        method: method || 'MTN_MOMO',
        metadata: result.data || {},
      },
    })

    console.log('[WALLET PAYMENT INIT] Created refill record:', refillRecord.id)

    // Start polling for payment status
    startPaymentPolling(refillId, 'WALLET_REFILL', refillRecord.id)

    return NextResponse.json({
      success: true,
      refillId,
      message: 'Payment request sent. Please check your phone to complete the payment.',
    })
  } catch (error) {
    console.error('[WALLET PAYMENT INIT] Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to initialize payment',
      },
      { status: 500 }
    )
  }
}
