'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthCard } from '../AuthCard'

// NextAuth error codes: https://next-auth.js.org/configuration/pages#error-page
const messages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: 'Sign-in is temporarily unavailable',
    description: 'There is a problem with our sign-in setup. Please try again in a few minutes.',
  },
  AccessDenied: {
    title: 'Access denied',
    description: 'Your account does not have permission to sign in here. If you think this is a mistake, contact us.',
  },
  Verification: {
    title: 'Link expired',
    description: 'This sign-in link has expired or was already used. Please request a new one.',
  },
  OAuthAccountNotLinked: {
    title: 'Use your original sign-in method',
    description: 'This email is already registered with a different sign-in method. Sign in the way you did before.',
  },
}

const fallback = {
  title: 'Something went wrong',
  description: 'We could not sign you in. Please try again.',
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const code = searchParams.get('error') || ''
  const { title, description } = messages[code] || fallback

  return (
    <AuthCard icon={AlertTriangle} iconClass="bg-red-100 text-red-600" title={title} description={description}>
      <div className="flex flex-col gap-3">
        <Link href="/auth/signin">
          <Button className="w-full">Back to sign in</Button>
        </Link>
        <Link href="/contact">
          <Button variant="outline" className="w-full">Contact support</Button>
        </Link>
      </div>
      {code && <p className="text-center text-xs text-gray-400">Error code: {code}</p>}
    </AuthCard>
  )
}
