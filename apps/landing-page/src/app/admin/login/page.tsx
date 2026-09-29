'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to main login with callback URL to admin
    router.replace('/auth/signin?callbackUrl=/admin')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Redirecting to login...</p>
      </div>
    </div>
  )
}
