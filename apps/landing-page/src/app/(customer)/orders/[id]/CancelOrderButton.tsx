'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, XCircle } from 'lucide-react'

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cancel = async () => {
    if (!confirm('Cancel this order?')) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not cancel this order')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not cancel this order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={cancel}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
        Cancel order
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
