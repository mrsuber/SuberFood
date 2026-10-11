'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react'

type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

export default function WalletPaymentStatusPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const refillId = searchParams.get('refillId')

  const [status, setStatus] = useState<PaymentStatus>('PENDING')
  const [message, setMessage] = useState('Checking payment status...')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!refillId) {
      setError('No refill ID provided')
      setLoading(false)
      return
    }

    // Poll payment status every 3 seconds
    const pollInterval = setInterval(() => {
      checkPaymentStatus()
    }, 3000)

    // Check immediately on mount
    checkPaymentStatus()

    // Cleanup on unmount
    return () => clearInterval(pollInterval)
  }, [refillId])

  const checkPaymentStatus = async () => {
    if (!refillId) return

    try {
      const res = await fetch(`/api/wallet/payment/status/${refillId}`)
      const data = await res.json()

      if (data.success) {
        const paymentStatus = data.paymentStatus as PaymentStatus

        setStatus(paymentStatus)
        setLoading(false)

        // Update message based on status
        if (paymentStatus === 'PROCESSING') {
          setMessage('Waiting for you to confirm payment on your phone...')
        } else if (paymentStatus === 'COMPLETED') {
          setMessage('Payment successful! Your wallet has been credited.')
          // Redirect to wallet page after 3 seconds
          setTimeout(() => {
            router.push('/wallet')
          }, 3000)
        } else if (paymentStatus === 'FAILED') {
          setMessage('Payment failed. Please try again.')
        } else if (paymentStatus === 'CANCELLED') {
          setMessage('Payment was cancelled.')
        } else {
          setMessage('Payment is being processed...')
        }
      } else {
        setError(data.message || 'Failed to check payment status')
        setLoading(false)
      }
    } catch (err) {
      console.error('Error checking payment status:', err)
      setError('Failed to check payment status')
      setLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-16 w-16 text-green-500" />
      case 'FAILED':
      case 'CANCELLED':
        return <XCircle className="h-16 w-16 text-red-500" />
      case 'PROCESSING':
        return <Clock className="h-16 w-16 text-blue-500 animate-pulse" />
      default:
        return <Loader2 className="h-16 w-16 text-gray-400 animate-spin" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600'
      case 'FAILED':
      case 'CANCELLED':
        return 'text-red-600'
      case 'PROCESSING':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  if (!refillId) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Invalid Payment</CardTitle>
            <CardDescription>No payment information found</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/wallet')}>
              Go to Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
          <CardDescription>
            Please complete the payment on your phone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Icon */}
          <div className="flex justify-center">
            {getStatusIcon()}
          </div>

          {/* Status Message */}
          <div className="text-center space-y-2">
            <p className={`text-lg font-semibold ${getStatusColor()}`}>
              {status.replace('_', ' ')}
            </p>
            <p className="text-sm text-gray-600">{message}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Instructions */}
          {status === 'PROCESSING' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                To complete payment:
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Check your phone for a USSD prompt</li>
                <li>Enter your MTN Mobile Money PIN</li>
                <li>Confirm the payment</li>
                <li>Wait for the confirmation message</li>
              </ol>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {(status === 'FAILED' || status === 'CANCELLED') && (
              <>
                <Button
                  onClick={() => router.push('/wallet')}
                  className="w-full"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => router.push('/wallet')}
                  variant="outline"
                  className="w-full"
                >
                  Back to Wallet
                </Button>
              </>
            )}

            {status === 'COMPLETED' && (
              <Button
                onClick={() => router.push('/wallet')}
                className="w-full"
              >
                Go to Wallet
              </Button>
            )}

            {status === 'PROCESSING' && (
              <Button
                onClick={() => router.push('/wallet')}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            )}
          </div>

          {/* Reference */}
          <div className="text-xs text-gray-500 text-center">
            Reference: {refillId}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
