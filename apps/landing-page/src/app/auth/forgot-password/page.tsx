'use client'

import Link from 'next/link'
import { KeyRound } from 'lucide-react'
import { AuthCard } from '../AuthCard'
import { InquiryForm } from '@/components/marketing/InquiryForm'
import { site } from '@/lib/site'

// Self-service email resets need an email provider; until one is configured,
// reset requests go to the support inbox (/admin/inquiries) and staff verify
// the account holder before resetting.
export default function ForgotPasswordPage() {
  return (
    <AuthCard
      icon={KeyRound}
      title="Forgot your password?"
      description="Tell us how to reach you and our team will help you get back into your account."
    >
      <div className="rounded-lg bg-green-50 border border-green-100 p-4 text-sm text-green-900">
        Signed up with Google? Just use <strong>Continue with Google</strong> on the{' '}
        <Link href="/auth/signin" className="underline">sign-in page</Link> — no password needed.
      </div>
      <InquiryForm
        type="SUPPORT"
        showCity={false}
        messageLabel="Account details"
        messagePlaceholder="The email or phone number on your account, and anything that helps us confirm it is you"
        submitLabel="Request password reset"
        successTitle="Request received"
        successMessage={`We will contact you to verify your identity and reset your password. For urgent help call ${site.contact.phone}.`}
      />
      <p className="text-center text-sm text-gray-600">
        Remembered it? <Link href="/auth/signin" className="text-green-700 font-medium hover:underline">Sign in</Link>
      </p>
    </AuthCard>
  )
}
