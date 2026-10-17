'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PackageSearch, Truck, MapPin, Bell } from 'lucide-react'
import { PageShell, PageHero, Section } from '@/components/marketing'

export default function TrackOrderPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const value = code.trim().toUpperCase()
    if (!value) {
      setError('Please enter your tracking code.')
      return
    }
    if (value.startsWith('FPO-')) {
      setError(
        'That looks like an order number. Use the tracking code (it starts with FD-) from your delivery message, or sign in to see your orders.'
      )
      return
    }
    router.push(`/track/${encodeURIComponent(value)}`)
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Track order"
        title="Where is my order?"
        description="Enter the tracking code from your delivery message to see your order status, your driver and their live location."
      />
      <Section>
        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Tracking code
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value)
                  setError(null)
                }}
                placeholder="FD-1234567890-ABC123XYZ"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-mono uppercase focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700"
              >
                <PackageSearch className="w-5 h-5" /> Track
              </button>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <p className="mt-4 text-sm text-gray-500">
              Have an account?{' '}
              <Link href="/orders" className="text-primary-700 font-medium hover:underline">
                See all your orders
              </Link>
              .
            </p>
          </form>

          <div className="mt-10 grid sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: Bell, title: 'Get your code', text: 'Sent when your order is dispatched.' },
              { icon: Truck, title: 'Follow your driver', text: 'Status updates and driver contact.' },
              { icon: MapPin, title: 'Live location', text: 'See the delivery approach in real time.' },
            ].map((s) => (
              <div key={s.title}>
                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mx-auto mb-3">
                  <s.icon className="w-5 h-5" />
                </div>
                <p className="font-semibold text-gray-900">{s.title}</p>
                <p className="text-sm text-gray-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </PageShell>
  )
}
