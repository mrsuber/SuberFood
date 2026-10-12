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

    // Check if PayWithCamsol returned an error response
    if (!response.ok) {
      console.error('[WALLET PAYMENT INIT] Payment initialization failed with HTTP error:', result)
      // Extract error message from PayWithCamsol response
      const errorMessage = result?.data?.failureReason || result?.message || result?.error || 'Failed to initialize payment'
      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
        },
        { status: response.status }
      )
    }

    // PayWithCamsol can return 200 OK but with success: false
    if (result.success === false) {
      console.error('[WALLET PAYMENT INIT] PayWithCamsol returned success: false:', result)
      const errorMessage = result?.data?.failureReason || result?.message || 'Failed to initialize payment'
      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
        },
        { status: 400 }
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
          message: 'Payment initialization failed - no transaction ID received from payment gateway',
          details: result
        },
        { status: 500 }
      )
    }

    // Create a pending wallet refill record
    let refillRecord
    try {
      refillRecord = await prisma.walletRefill.create({
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
    } catch (dbError) {
      console.error('[WALLET PAYMENT INIT] Database error creating refill record:', dbError)
      // Check if it's a unique constraint violation (refillId already exists)
      if (dbError instanceof Error && dbError.message.includes('Unique constraint')) {
        console.error('[WALLET PAYMENT INIT] Refill ID already exists:', refillId)
        return NextResponse.json(
          {
            success: false,
            message: 'This payment request has already been processed. Please try again.',
          },
          { status: 409 }
        )
      }
      throw dbError // Re-throw to be caught by outer catch
    }

    // Start polling for payment status
    try {
      startPaymentPolling(refillId, 'WALLET_REFILL', refillRecord.id)
    } catch (pollingError) {
      console.error('[WALLET PAYMENT INIT] Error starting polling service:', pollingError)
      // Don't fail the request - the frontend can still poll manually
    }

    return NextResponse.json({
      success: true,
      refillId,
      message: 'Payment request sent. Please check your phone to complete the payment.',
    })
  } catch (error) {
    console.error('[WALLET PAYMENT INIT] Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('[WALLET PAYMENT INIT] Error details:', errorMessage)

    // Return detailed error message to help users understand what went wrong
    return NextResponse.json(
      {
        success: false,
        message: errorMessage || 'Failed to initialize payment. Please try again.',
      },
      { status: 500 }
    )
  }
}
