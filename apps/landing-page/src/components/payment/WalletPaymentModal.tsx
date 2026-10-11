'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CreditCard, Smartphone, Loader2, CheckCircle, XCircle } from 'lucide-react'

interface WalletPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  amount: number
}

type PaymentStatus = 'idle' | 'processing' | 'pending' | 'success' | 'error'

export function WalletPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  amount,
}: WalletPaymentModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  console.log('[WALLET PAYMENT MODAL] Rendered with:', { isOpen, amount, paymentStatus })

  const handlePayment = async () => {
    console.log('[WALLET PAYMENT MODAL] handlePayment called')
    setPaymentStatus('processing')
    setErrorMessage('')

    try {
      console.log('[WALLET PAYMENT MODAL] Initializing wallet deposit with:', { amount, phoneNumber })
      // Initialize payment with PayWithCamsol
      const response = await fetch('/api/wallet/payment/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          phoneNumber,
          method: 'MTN_MOMO',
        }),
      })

      const result = await response.json()
      console.log('[WALLET PAYMENT MODAL] Payment API response:', result)

      if (!result.success) {
        console.error('[WALLET PAYMENT MODAL] Payment initialization failed:', result)
        throw new Error(result.message || 'Failed to initialize payment')
      }

      // Payment initiated successfully - now wait for customer to confirm on phone
      console.log('[WALLET PAYMENT MODAL] Payment initiated successfully! Waiting for customer confirmation')
      setPaymentStatus('pending')

      // Start polling for payment status
      const refillId = result.refillId
      if (refillId) {
        console.log('[WALLET PAYMENT MODAL] Starting payment status polling for refillId:', refillId)
        pollPaymentStatus(refillId)
      } else {
        throw new Error('No refillId received from payment gateway')
      }
    } catch (error) {
      console.error('[WALLET PAYMENT MODAL] Payment error:', error)
      setPaymentStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process payment')
    }
  }

  // Poll for payment status
  const pollPaymentStatus = async (refillId: string) => {
    let attempts = 0
    const maxAttempts = 30 // Poll for up to 90 seconds (30 * 3 seconds)
    const pollInterval = 3000 // 3 seconds

    const checkStatus = async () => {
      try {
        console.log(`[WALLET PAYMENT MODAL] Checking payment status (attempt ${attempts + 1}/${maxAttempts})`)
        const response = await fetch(`/api/wallet/payment/status/${refillId}`)
        const result = await response.json()

        console.log('[WALLET PAYMENT MODAL] Status check result:', result)
        console.log('[WALLET PAYMENT MODAL] Payment status:', result.paymentStatus)

        // Check if payment is completed
        if (result.success && result.paymentStatus === 'COMPLETED') {
          console.log('[WALLET PAYMENT MODAL] Payment COMPLETED!')
          // Set success status first to show success UI
          setPaymentStatus('success')
          // Wait 2 seconds to let user see success message, then close and refresh
          setTimeout(() => {
            console.log('[WALLET PAYMENT MODAL] Closing modal and triggering success callback')
            onSuccess()
            onClose()
          }, 2000)
          return true // Stop polling
        } else if (result.paymentStatus === 'FAILED' || result.paymentStatus === 'CANCELLED') {
          console.log('[WALLET PAYMENT MODAL] Payment failed or cancelled')
          setPaymentStatus('error')
          setErrorMessage('Payment was not completed. Please try again.')
          return true // Stop polling
        }

        // Continue polling if still pending
        attempts++
        if (attempts < maxAttempts) {
          console.log(`[WALLET PAYMENT MODAL] Still pending, continuing to poll (attempt ${attempts}/${maxAttempts})...`)
          setTimeout(checkStatus, pollInterval) // Check again in 3 seconds
        } else {
          console.log('[WALLET PAYMENT MODAL] Frontend polling timeout - backend polling will handle completion')
          // Don't show error - backend is still polling
          setPaymentStatus('pending')
          setErrorMessage('Payment is being processed. You can safely close this window. Check your wallet for updates.')
        }
      } catch (error) {
        console.error('[WALLET PAYMENT MODAL] Error checking payment status:', error)
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, pollInterval) // Retry
        } else {
          setPaymentStatus('error')
          setErrorMessage('Unable to verify payment status. Please check your wallet balance.')
        }
      }
    }

    // Start polling after 3 seconds
    setTimeout(checkStatus, 3000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Don't allow closing the modal while payment is pending or processing
      if (!open && (paymentStatus === 'pending' || paymentStatus === 'processing')) {
        return // Prevent closing
      }
      if (!open) {
        // Reset state when closing
        setPaymentStatus('idle')
        setErrorMessage('')
        setPhoneNumber('')
        onClose()
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#15803D]" />
            Wallet Deposit
          </DialogTitle>
          <DialogDescription>
            Add funds to your wallet via MTN Mobile Money
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Payment Status */}
          {paymentStatus === 'processing' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
              <p className="text-blue-900 font-semibold">Processing Payment...</p>
              <p className="text-sm text-blue-700 mt-1">Please wait while we initialize your payment</p>
            </div>
          )}

          {paymentStatus === 'pending' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-3" />
              <p className="text-blue-900 font-bold text-lg mb-2">Waiting for Payment Confirmation</p>
              <div className="bg-white rounded-lg p-4 mb-4 text-left">
                <p className="text-sm text-blue-800 mb-2 font-semibold">📱 Check your phone now:</p>
                <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                  <li>You should receive a payment prompt on your phone</li>
                  <li>Enter your Mobile Money PIN to confirm the payment</li>
                  <li>We'll automatically detect when payment is complete</li>
                </ol>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-blue-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking payment status...</span>
              </div>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-3" />
              <p className="text-green-900 font-bold text-lg mb-2">Payment Successful!</p>
              <p className="text-sm text-green-700 mt-2">Your wallet has been credited.</p>
              <p className="text-xs text-green-600 mt-1">Refreshing wallet balance...</p>
            </div>
          )}

          {paymentStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <XCircle className="h-8 w-8 mx-auto text-red-600 mb-2" />
              <p className="text-red-900 font-semibold">Payment Failed</p>
              <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
            </div>
          )}

          {paymentStatus === 'idle' && (
            <>
              {/* Amount Display */}
              <div className="bg-gradient-to-r from-[#15803D] to-[#166534] text-white rounded-lg p-4 text-center">
                <p className="text-sm opacity-90">Amount to Deposit</p>
                <p className="text-3xl font-bold mt-1">{amount.toLocaleString()} XAF</p>
              </div>

              {/* Payment Method Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border-2 border-yellow-500 bg-yellow-50 rounded-lg">
                    <div className="text-center">
                      <div className="bg-yellow-500 text-white rounded px-2 py-1 text-xs font-bold mb-1 inline-block">
                        MTN
                      </div>
                      <p className="text-xs text-gray-600">Mobile Money</p>
                    </div>
                  </div>
                  <div className="p-3 border-2 border-orange-500 bg-orange-50 rounded-lg">
                    <div className="text-center">
                      <div className="bg-orange-500 text-white rounded px-2 py-1 text-xs font-bold mb-1 inline-block">
                        ORANGE
                      </div>
                      <p className="text-xs text-gray-600">Money</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Both MTN and Orange Mobile Money supported
                </p>
              </div>

              {/* Phone Number Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Smartphone className="h-4 w-4 inline mr-1" />
                  Mobile Money Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D] text-lg"
                  placeholder="6XX XXX XXX"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your MTN or Orange Mobile Money number
                </p>
              </div>

              {/* Payment Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <p className="text-blue-900 font-semibold mb-1">How it works:</p>
                <ol className="text-blue-800 space-y-1 list-decimal list-inside text-xs">
                  <li>Click "Deposit Now" below</li>
                  <li>You'll receive a payment prompt on your phone</li>
                  <li>Enter your Mobile Money PIN to confirm</li>
                  <li>Your wallet will be credited automatically</li>
                </ol>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {paymentStatus === 'idle' && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPhoneNumber('')
                  onClose()
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handlePayment}
                disabled={!phoneNumber.trim() || amount <= 0}
                className="flex-1 bg-[#15803D] hover:bg-[#166534]"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Deposit Now
              </Button>
            </>
          )}
          {paymentStatus === 'error' && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPaymentStatus('idle')
                  setErrorMessage('')
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handlePayment}
                className="flex-1 bg-[#15803D] hover:bg-[#166534]"
              >
                Try Again
              </Button>
            </>
          )}
        </div>

        {/* Powered by */}
        <div className="text-center pt-2 border-t">
          <p className="text-xs text-gray-500">
            Secure payment powered by <span className="font-semibold">PayWithCamsol</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
