'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Sprout, Package, QrCode } from 'lucide-react'
import { AdminPage, Panel, Loading, ErrorNote, EmptyState, inputClass, useAdminFetch } from '@/components/admin/ui'

const xaf = (n: number) => `${Math.round(n).toLocaleString('fr-FR')} XAF`

export default function SupplyChainPage() {
  const [batch, setBatch] = useState('')
  const { data, loading, error } = useAdminFetch<{ data: any[] }>('/api/admin/farm-supplies')
  const supplies = data?.data || []

  // farmer -> product flows
  const flows = new Map<string, { farmer: any; product: any; qty: number; unit: string; cost: number; unpaid: number; batches: number; last: string }>()
  for (const s of supplies) {
    const key = `${s.farmerId}:${s.productId}`
    const f = flows.get(key) || { farmer: s.farmer, product: s.product, qty: 0, unit: s.unit, cost: 0, unpaid: 0, batches: 0, last: s.deliveryDate }
    f.qty += Number(s.quantity)
    f.cost += Number(s.totalCost)
    f.unpaid += Math.max(0, Number(s.totalCost) - Number(s.paidAmount))
    f.batches += 1
    if (s.deliveryDate > f.last) f.last = s.deliveryDate
    flows.set(key, f)
  }
  const rows = [...flows.values()].sort((a, b) => b.cost - a.cost)
  const found = batch.trim() ? supplies.find((s) => s.batchNumber?.toLowerCase() === batch.trim().toLowerCase()) : null

  return (
    <AdminPage
      title="Supply Chain"
      back={{ label: 'Harvest & Supply', href: '/admin/farming/supply' }}
      description="Which farmers supply which products, how much, and what we owe — plus batch lookup for traceability."
    >
      <Panel title="Trace a batch">
        <div className="flex flex-wrap gap-3">
          <input className={`${inputClass} flex-1 min-w-[240px] font-mono`} placeholder="Enter a batch number" value={batch} onChange={(e) => setBatch(e.target.value)} />
        </div>
        {batch.trim() && (
          <div className="mt-5">
            {found ? (
              <ol className="flex flex-wrap items-center gap-3 text-sm">
                <li className="rounded-lg bg-primary-50 px-4 py-3">
                  <Sprout className="w-4 h-4 text-primary-700 mb-1" />
                  <p className="font-semibold">{found.farmer?.businessName || found.farmer?.name}</p>
                  <p className="text-gray-500">{found.farmer?.village || found.farmer?.region}{found.farmer?.isVerified ? ' · verified' : ''}</p>
                </li>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <li className="rounded-lg bg-amber-50 px-4 py-3">
                  <QrCode className="w-4 h-4 text-amber-700 mb-1" />
                  <p className="font-semibold font-mono">{found.batchNumber}</p>
                  <p className="text-gray-500">
                    harvested {found.harvestDate ? new Date(found.harvestDate).toLocaleDateString('en-GB') : '—'} · received {new Date(found.deliveryDate).toLocaleDateString('en-GB')}
                  </p>
                </li>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <li className="rounded-lg bg-sky-50 px-4 py-3">
                  <Package className="w-4 h-4 text-sky-700 mb-1" />
                  <p className="font-semibold">{found.product?.name}</p>
                  <p className="text-gray-500">{Number(found.quantity)} {found.unit} · quality {found.qualityRating || '—'}/5</p>
                </li>
              </ol>
            ) : (
              <p className="text-sm text-gray-500">No batch with that number.</p>
            )}
          </div>
        )}
      </Panel>

      {error && <ErrorNote message={error} />}
      <Panel title="Farmer → product flows">
        {loading ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No supply recorded yet" action={{ label: 'Record a delivery', href: '/admin/farming/supply' }} />
        ) : (
          <div className="overflow-x-auto -m-6">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3">Farmer</th>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Supplied</th>
                  <th className="px-6 py-3">Batches</th>
                  <th className="px-6 py-3">Paid to farmer</th>
                  <th className="px-6 py-3">Owed</th>
                  <th className="px-6 py-3">Last delivery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr key={`${r.farmer?.id}-${r.product?.id}`}>
                    <td className="px-6 py-3">
                      <Link href={`/admin/farmers/${r.farmer?.id}`} className="font-medium text-gray-900 hover:text-primary-700">
                        {r.farmer?.businessName || r.farmer?.name}
                      </Link>
                      <p className="text-xs text-gray-500">{r.farmer?.region}</p>
                    </td>
                    <td className="px-6 py-3">{r.product?.name}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{r.qty.toLocaleString('fr-FR')} {r.unit}</td>
                    <td className="px-6 py-3">{r.batches}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{xaf(r.cost - r.unpaid)}</td>
                    <td className={`px-6 py-3 whitespace-nowrap ${r.unpaid > 0 ? 'text-amber-700 font-semibold' : 'text-gray-500'}`}>{xaf(r.unpaid)}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-gray-600">{new Date(r.last).toLocaleDateString('en-GB')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </AdminPage>
  )
}
