import Link from 'next/link'
import { MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthCard } from '../AuthCard'

export default function VerifyRequestPage() {
  return (
    <AuthCard
      icon={MailCheck}
      title="Check your email"
      description="We sent you a sign-in link. Open it on this device to continue."
    >
      <p className="text-sm text-gray-600 text-center">
        Can&apos;t find it? Check your spam folder, or wait a minute and try again.
      </p>
      <Link href="/auth/signin">
        <Button variant="outline" className="w-full">Back to sign in</Button>
      </Link>
    </AuthCard>
  )
}
