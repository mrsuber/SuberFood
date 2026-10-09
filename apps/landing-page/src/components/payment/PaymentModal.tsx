'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CreditCard, Smartphone, Loader2, CheckCircle, XCircle } from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  orderId: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail?: string
}

type PaymentStatus = 'idle' | 'processing' | 'pending' | 'success' | 'error'

export function PaymentModal({
  isOpen,
  onClose,
  amount,
  orderId,
  orderNumber,
  customerName,
  customerPhone,
  customerEmail,
}: PaymentModalProps) {
  const [phoneNumber, setPhoneNumber] = useState(customerPhone || '')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'MTN' | 'ORANGE'>('MTN')

  console.log('[PAYMENT MODAL] Rendered with:', { isOpen, orderId, orderNumber, amount, paymentStatus })

  const handlePayment = async () => {
    console.log('[PAYMENT MODAL] handlePayment called')
    setPaymentStatus('processing')
    setErrorMessage('')

    try {
      console.log('[PAYMENT MODAL] Initializing payment with:', { orderId, amount, phoneNumber, paymentMethod })
      // Initialize payment with PayWithCamsol
      const response = await fetch('/api/farm-products/payment/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          customerEmail,
          customerPhone: phoneNumber,
          customerName,
          paymentMethod, // MTN or ORANGE
        }),
      })

      const result = await response.json()
      console.log('[PAYMENT MODAL] Payment API response:', result)

      if (!result.success) {
        console.error('[PAYMENT MODAL] Payment initialization failed:', result)
        throw new Error(result.message || 'Failed to initialize payment')
      }

      // Payment initiated successfully - now wait for customer to confirm on phone
      console.log('[PAYMENT MODAL] Payment initiated successfully! Waiting for customer confirmation')
      setPaymentStatus('pending') // Set to 'pending' not 'success' - we're waiting for payment

      // Start polling for payment status
      const refillId = result.data?.refillId || result.data?.reference
      if (refillId) {
        console.log('[PAYMENT MODAL] Starting payment status polling for refillId:', refillId)
        pollPaymentStatus(refillId)
      } else {
        throw new Error('No refillId received from payment gateway')
      }
    } catch (error) {
      console.error('[PAYMENT MODAL] Payment error:', error)
      setPaymentStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process payment')
    }
  }

  // Poll for payment status
  const pollPaymentStatus = async (refillId: string) => {
    let attempts = 0
    const maxAttempts = 30 // Poll for up to 90 seconds (30 * 3 seconds)
    const pollInterval = 3000 // 3 seconds - more aggressive polling like camsol_management_system

    const checkStatus = async () => {
      try {
        console.log(`[PAYMENT MODAL] Checking payment status (attempt ${attempts + 1}/${maxAttempts})`)
        const response = await fetch(`/api/farm-products/payment/status/${refillId}`)
        const result = await response.json()

        console.log('[PAYMENT MODAL] Status check result:', result)
        console.log('[PAYMENT MODAL] Payment status:', result.paymentStatus, 'Order status:', result.orderStatus)
        console.log('[PAYMENT MODAL] Raw PayWithCamsol data:', result.data?.data)

        // CRITICAL: Only trust the backend's paymentStatus mapping
        // Backend only sets COMPLETED when customer actually confirms payment
        // paymentStatus = 'PROCESSING' means waiting for customer to dial code
        // paymentStatus = 'COMPLETED' means customer confirmed and money withdrawn
        if (result.success && result.paymentStatus === 'COMPLETED') {
          console.log('[PAYMENT MODAL] Payment COMPLETED by customer! Redirecting...')
          // Set success status first to show success UI
          setPaymentStatus('success')
          // Wait 2 seconds to let user see success message, then redirect
          setTimeout(() => {
            console.log('[PAYMENT MODAL] Redirecting to confirmation page')
            window.location.href = `/distribution/farm-products/order-confirmation?orderNumber=${orderNumber}`
          }, 2000)
          return true // Stop polling
        } else if (result.paymentStatus === 'FAILED' || result.paymentStatus === 'CANCELLED') {
          console.log('[PAYMENT MODAL] Payment failed or cancelled')
          setPaymentStatus('error')
          setErrorMessage('Payment was not completed. Please try again.')
          return true // Stop polling
        }

        // Continue polling if still pending
        attempts++
        if (attempts < maxAttempts) {
          console.log(`[PAYMENT MODAL] Still pending, continuing to poll (attempt ${attempts}/${maxAttempts})...`)
          setTimeout(checkStatus, pollInterval) // Check again in 3 seconds
        } else {
          console.log('[PAYMENT MODAL] Max polling attempts reached')
          setPaymentStatus('error')
          setErrorMessage('Payment is taking longer than expected. Please check your order status or contact support.')
        }
      } catch (error) {
        console.error('[PAYMENT MODAL] Error checking payment status:', error)
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, pollInterval) // Retry
        } else {
          setPaymentStatus('error')
          setErrorMessage('Unable to verify payment status. Please contact support with your order number.')
        }
      }
    }

    // Start polling after 3 seconds (give user time to see the success message)
    setTimeout(checkStatus, 3000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Don't allow closing the modal while payment is pending or processing
      if (!open && (paymentStatus === 'pending' || paymentStatus === 'processing')) {
        return // Prevent closing
      }
      onClose()
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#15803D]" />
            Complete Payment
          </DialogTitle>
          <DialogDescription>
            Enter your mobile money details to complete the payment
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
              <p className="text-sm text-green-700 mt-2">Your order has been confirmed.</p>
              <p className="text-xs text-green-600 mt-1">Redirecting to order confirmation...</p>
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
                <p className="text-sm opacity-90">Amount to Pay</p>
                <p className="text-3xl font-bold mt-1">{amount.toLocaleString()} XAF</p>
                <p className="text-xs opacity-75 mt-1">Order #{orderNumber}</p>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('MTN')}
                    className={`p-3 border-2 rounded-lg transition-all ${
                      paymentMethod === 'MTN'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="bg-yellow-500 text-white rounded px-2 py-1 text-xs font-bold mb-1">
                        MTN
                      </div>
                      <p className="text-xs text-gray-600">Mobile Money</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ORANGE')}
                    className={`p-3 border-2 rounded-lg transition-all ${
                      paymentMethod === 'ORANGE'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="bg-orange-500 text-white rounded px-2 py-1 text-xs font-bold mb-1">
                        ORANGE
                      </div>
                      <p className="text-xs text-gray-600">Money</p>
                    </div>
                  </button>
                </div>
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
                  placeholder="+237 6XX XXX XXX"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the {paymentMethod} Mobile Money number to receive payment prompt
                </p>
              </div>

              {/* Payment Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <p className="text-blue-900 font-semibold mb-1">How it works:</p>
                <ol className="text-blue-800 space-y-1 list-decimal list-inside text-xs">
                  <li>Click "Pay Now" below</li>
                  <li>You'll receive a payment prompt on your phone</li>
                  <li>Enter your Mobile Money PIN to confirm</li>
                  <li>Your order will be confirmed automatically</li>
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
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handlePayment}
                disabled={!phoneNumber.trim()}
                className="flex-1 bg-[#15803D] hover:bg-[#166534]"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Now
              </Button>
            </>
          )}
          {paymentStatus === 'error' && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
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
