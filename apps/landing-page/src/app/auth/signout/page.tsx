'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { CheckCircle, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SignOutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [countdown, setCountdown] = useState(3)
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Determine redirect URL based on user role
  const getRedirectUrl = () => {
    // Check if there's a callbackUrl in the search params
    const callbackUrl = searchParams.get('callbackUrl')
    if (callbackUrl) {
      return callbackUrl
    }

    // If user is still authenticated (hasn't been signed out yet), check their role
    if (session?.user?.role) {
      const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'
      return isAdmin ? '/auth/signin' : '/'
    }

    // Default to homepage
    return '/'
  }

  useEffect(() => {
    // If user is still authenticated, sign them out
    if (status === 'authenticated' && !isSigningOut) {
      setIsSigningOut(true)
      signOut({ redirect: false }).then(() => {
        // Start countdown after sign out
        startCountdown()
      })
    } else if (status === 'unauthenticated') {
      // Already signed out, start countdown
      startCountdown()
    }
  }, [status, isSigningOut])

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push(getRedirectUrl())
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }

  const handleManualRedirect = () => {
    router.push(getRedirectUrl())
  }

  const getMessage = () => {
    if (session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN') {
      return {
        title: 'Signed Out Successfully',
        subtitle: 'You have been securely signed out of the admin dashboard.',
        action: 'Sign back in to continue managing your operations.'
      }
    }
    return {
      title: 'Signed Out Successfully',
      subtitle: 'You have been securely signed out of your account.',
      action: 'Come back soon! We look forward to serving you again.'
    }
  }

  const message = getMessage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {message.title}
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 mb-2">
            {message.subtitle}
          </p>

          {/* Action Message */}
          <p className="text-sm text-gray-500 mb-8">
            {message.action}
          </p>

          {/* Countdown or Loading */}
          {status === 'loading' || isSigningOut ? (
            <div className="flex items-center justify-center space-x-2 mb-6">
              <LogOut className="w-5 h-5 text-primary-600 animate-pulse" />
              <p className="text-sm text-gray-600">Signing you out...</p>
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Redirecting in <span className="font-bold text-primary-600">{countdown}</span> {countdown === 1 ? 'second' : 'seconds'}...
              </p>
            </div>
          )}

          {/* Manual Redirect Button */}
          <Button
            onClick={handleManualRedirect}
            className="w-full"
            disabled={status === 'loading' || isSigningOut}
          >
            Continue Now
          </Button>

          {/* Branding */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Thank you for using <span className="font-semibold text-primary-600">SuberFood</span>
            </p>
          </div>
        </div>

        {/* Additional Links */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Changed your mind?{' '}
            <a
              href="/auth/signin"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign back in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
