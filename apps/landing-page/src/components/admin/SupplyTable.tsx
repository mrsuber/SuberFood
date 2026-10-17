'use client'

import { useState } from 'react'
import { StatusPill, sendJson } from '@/components/admin/ui'

const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')
const xaf = (n: any) => `${Math.round(Number(n) || 0).toLocaleString('fr-FR')} XAF`

/** Table of FarmSupply rows with inline "mark paid" and quality actions. */
export function SupplyTable({ supplies, onChange, showQualityActions = false }: { supplies: any[]; onChange: () => void; showQualityActions?: boolean }) {
  const [busy, setBusy] = useState<string | null>(null)

  const patch = async (id: string, body: object) => {
    setBusy(id)
    try {
      await sendJson(`/api/admin/farm-supplies/${id}`, 'PATCH', body)
      onChange()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="overflow-x-auto -m-6">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
          <tr>
            <th className="px-6 py-3">Batch</th>
            <th className="px-6 py-3">Product</th>
            <th className="px-6 py-3">Farmer</th>
            <th className="px-6 py-3">Qty</th>
            <th className="px-6 py-3">Harvested / received</th>
            <th className="px-6 py-3">Quality</th>
            <th className="px-6 py-3">Payment</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {supplies.map((s) => (
            <tr key={s.id} className="align-top">
              <td className="px-6 py-3 font-mono text-xs text-gray-700">{s.batchNumber || '—'}</td>
              <td className="px-6 py-3 font-medium text-gray-900">{s.product?.name}</td>
              <td className="px-6 py-3">
                {s.farmer?.businessName || s.farmer?.name}
                <p className="text-xs text-gray-500">{s.farmer?.village || s.farmer?.region}</p>
              </td>
              <td className="px-6 py-3 whitespace-nowrap">
                {Number(s.quantity)} {s.unit}
              </td>
              <td className="px-6 py-3 whitespace-nowrap text-gray-600">
                {fmt(s.harvestDate)}
                <p className="text-xs text-gray-400">{fmt(s.deliveryDate)}</p>
              </td>
              <td className="px-6 py-3">
                <span className="text-amber-500">{s.qualityRating ? '★'.repeat(s.qualityRating) : '—'}</span>
                <div className="mt-1"><StatusPill value={s.status} map={{ APPROVED: 'bg-green-100 text-green-800', QUALITY_CHECK: 'bg-amber-100 text-amber-800', REJECTED: 'bg-red-100 text-red-800' }} /></div>
              </td>
              <td className="px-6 py-3 whitespace-nowrap">
                {xaf(s.totalCost)}
                <div className="mt-1"><StatusPill value={s.paymentStatus} map={{ PAID: 'bg-green-100 text-green-800', PARTIAL: 'bg-amber-100 text-amber-800', PENDING: 'bg-yellow-100 text-yellow-800' }} /></div>
              </td>
              <td className="px-6 py-3 text-right whitespace-nowrap space-x-2">
                {showQualityActions && s.status === 'QUALITY_CHECK' && (
                  <>
                    <button disabled={busy === s.id} onClick={() => patch(s.id, { status: 'APPROVED' })} className="rounded-md bg-primary-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
                      Approve
                    </button>
                    <button disabled={busy === s.id} onClick={() => patch(s.id, { status: 'REJECTED' })} className="rounded-md px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">
                      Reject
                    </button>
                  </>
                )}
                {s.paymentStatus !== 'PAID' && (
                  <button disabled={busy === s.id} onClick={() => patch(s.id, { markPaid: true })} className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                    Mark paid
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
