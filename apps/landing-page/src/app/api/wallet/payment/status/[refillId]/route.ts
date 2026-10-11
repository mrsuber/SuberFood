import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export const dynamic = 'force-dynamic'

const PAYWITHCAMSOL_API_URL = process.env.PAYWITHCAMSOL_API_URL || 'https://paywithcamsol.com'
const PAYWITHCAMSOL_SECRET_KEY = process.env.PAYWITHCAMSOL_SECRET_KEY || ''

/**
 * GET /api/wallet/payment/status/[refillId]
 *
 * Check wallet refill payment status with PayWithCamsol and credit wallet when completed
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

    console.log('[WALLET PAYMENT STATUS] Checking status for refillId:', refillId)

    // Check payment status with PayWithCamsol
    const response = await fetch(`${PAYWITHCAMSOL_API_URL}/api/v1/balance/refill/${refillId}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': PAYWITHCAMSOL_SECRET_KEY,
      },
    })

    const data = await response.json()
    console.log('[WALLET PAYMENT STATUS] PayWithCamsol response:', JSON.stringify(data, null, 2))

    if (!response.ok) {
      console.error('[WALLET PAYMENT STATUS] Status check failed:', data)
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Payment status check failed',
          details: data
        },
        { status: response.status }
      )
    }

    // Find the wallet refill record with this refill ID
    const refillRecord = await prisma.walletRefill.findUnique({
      where: { refillId },
      include: {
        wallet: {
          include: {
            user: true
          }
        }
      }
    })

    if (!refillRecord) {
      console.error('[WALLET PAYMENT STATUS] Refill record not found for refillId:', refillId)
      return NextResponse.json({
        success: true,
        paymentStatus: data.data?.refillState || data.status,
        message: 'Payment status retrieved (no refill record found)',
        data,
      })
    }

    // CRITICAL FIX: If refill is already COMPLETED, don't revert it!
    // The backend polling service may have already processed this refill
    if (refillRecord.status === 'COMPLETED') {
      console.log('[WALLET PAYMENT STATUS] Refill already completed by backend polling, keeping status')
      return NextResponse.json({
        success: true,
        paymentStatus: 'COMPLETED',
        refillStatus: 'COMPLETED',
        message: 'Payment already confirmed',
        data,
      })
    }

    // Map PayWithCamsol refill state to our payment status
    const refillState = data.data?.status || data.data?.refillState || data.status
    let paymentStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' = 'PENDING'

    console.log('[WALLET PAYMENT STATUS] Refill state from PayWithCamsol:', refillState)
    console.log('[WALLET PAYMENT STATUS] Full data.data:', JSON.stringify(data.data, null, 2))
    console.log('[WALLET PAYMENT STATUS] Current refill status:', refillRecord.status)

    // CRITICAL: Only treat as COMPLETED when PayWithCamsol confirms payment
    // 'Pending' (capital P) = waiting for customer to confirm on phone
    // 'Processing' (capital P) or 'Completed' = customer confirmed, money withdrawn
    if (refillState === 'Completed' ||
        refillState === 'PROCESSING' ||
        refillState === 'Processing') {
      // Payment confirmed by customer!
      paymentStatus = 'COMPLETED'
    } else if (refillState === 'Failed' || refillState === 'FAILED' || refillState === 'failed') {
      paymentStatus = 'FAILED'
    } else if (refillState === 'Cancelled' || refillState === 'CANCELED' || refillState === 'Canceled') {
      paymentStatus = 'CANCELLED'
    } else if (refillState === 'Pending' || refillState === 'pending' || refillState === 'PENDING') {
      // Still waiting for customer to dial code and confirm
      paymentStatus = 'PROCESSING'
    } else {
      // Unknown status, keep current status
      paymentStatus = refillRecord.status || 'PENDING'
    }

    console.log('[WALLET PAYMENT STATUS] Mapped status:', paymentStatus)

    // Only update if status has changed
    if (refillRecord.status !== paymentStatus) {
      console.log('[WALLET PAYMENT STATUS] Updating refill:', refillRecord.id, 'to', paymentStatus)

      // If payment completed, credit the wallet
      if (paymentStatus === 'COMPLETED') {
        console.log('[WALLET PAYMENT STATUS] 💰 Payment completed! Crediting wallet:', refillRecord.walletId)

        const wallet = refillRecord.wallet
        const newBalance = wallet.balance.add(refillRecord.amount)
        const newTotalDeposits = wallet.totalDeposits.add(refillRecord.amount)

        // Create wallet transaction
        await prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'DEPOSIT',
            amount: refillRecord.amount,
            balanceBefore: wallet.balance,
            balanceAfter: newBalance,
            description: `Wallet deposit via Mobile Money - ${refillRecord.phoneNumber}`,
            referenceType: 'WALLET_REFILL',
            referenceId: refillRecord.id,
          },
        })

        // Update wallet balance
        await prisma.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: newBalance,
            totalDeposits: newTotalDeposits,
          },
        })

        console.log(`[WALLET PAYMENT STATUS] ✅ Wallet credited: ${refillRecord.amount} XAF (New balance: ${newBalance} XAF)`)
      }

      // Update refill record
      await prisma.walletRefill.update({
        where: { id: refillRecord.id },
        data: {
          status: paymentStatus,
          metadata: data,
          completedAt: paymentStatus === 'COMPLETED' ? new Date() : refillRecord.completedAt,
          failedAt: paymentStatus === 'FAILED' ? new Date() : refillRecord.failedAt,
          failureReason: paymentStatus === 'FAILED' ? (data.message || 'Payment failed') : refillRecord.failureReason,
        },
      })
    } else {
      console.log('[WALLET PAYMENT STATUS] No status change, skipping update')
    }

    return NextResponse.json({
      success: true,
      paymentStatus,
      refillStatus: paymentStatus,
      message: 'Payment status checked successfully',
      data,
    })

  } catch (error) {
    console.error('[WALLET PAYMENT STATUS] Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to check payment status',
      },
      { status: 500 }
    )
  }
}
