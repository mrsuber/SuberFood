'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PackageX, PackageMinus, PackageCheck, CalendarClock } from 'lucide-react'
import { AdminPage, Panel, StatCard, Loading, ErrorNote, EmptyState, inputClass, LinkButton, useAdminFetch } from '@/components/admin/ui'
import { categoryLabels } from '@/lib/content/operations'

type Level = 'out' | 'low' | 'ok'

export default function FarmProductInventoryPage() {
  const { data, loading, error } = useAdminFetch<{ data: any[] }>('/api/admin/farm-products/products?limit=1000&sortBy=name&sortOrder=asc')
  const [filter, setFilter] = useState<'all' | Level | 'preorders'>('all')
  const [search, setSearch] = useState('')

  const rows = (data?.data || []).map((p) => {
    const stock = Number(p.stockQuantity) || 0
    const pre = Number(p.preOrderedQuantity) || 0
    const available = stock - pre
    const threshold = Number(p.lowStockThreshold) || 0
    const level: Level = available <= 0 ? 'out' : threshold && available <= threshold ? 'low' : 'ok'
    return { ...p, stock, pre, available, level }
  })

  const visible = rows
    .filter((r) => (filter === 'all' ? true : filter === 'preorders' ? r.pre > 0 : r.level === filter))
    .filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.sku?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => ({ out: 0, low: 1, ok: 2 }[a.level as Level] - { out: 0, low: 1, ok: 2 }[b.level as Level]))

  const count = (l: Level) => rows.filter((r) => r.level === l).length

  return (
    <AdminPage
      title="Farm Product Inventory"
      back={{ label: 'All products', href: '/admin/farm-products/products' }}
      description="Stock levels across the shop. Available = in stock minus quantities already promised to pre-orders."
      actions={<LinkButton href="/admin/farming/supply">Record farm delivery</LinkButton>}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Out of stock" value={count('out')} icon={PackageX} tone="red" />
        <StatCard label="Low stock" value={count('low')} icon={PackageMinus} tone="amber" />
        <StatCard label="Healthy" value={count('ok')} icon={PackageCheck} />
        <StatCard label="With pre-orders" value={rows.filter((r) => r.pre > 0).length} icon={CalendarClock} tone="blue" />
      </div>
      <Panel>
        <div className="flex flex-wrap gap-3">
          <select className={`${inputClass} w-auto`} value={filter} onChange={(e) => setFilter(e.target.value as any)}>
            <option value="all">All products</option>
            <option value="out">Out of stock</option>
            <option value="low">Low stock</option>
            <option value="ok">Healthy</option>
            <option value="preorders">Has pre-orders</option>
          </select>
          <input className={`${inputClass} flex-1 min-w-[200px]`} placeholder="Search name or SKU" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </Panel>
      {error && <ErrorNote message={error} />}
      <Panel>
        {loading ? (
          <Loading />
        ) : visible.length === 0 ? (
          <EmptyState title="No products match" />
        ) : (
          <div className="overflow-x-auto -m-6">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3 text-right">In stock</th>
                  <th className="px-6 py-3 text-right">Pre-ordered</th>
                  <th className="px-6 py-3 text-right">Available</th>
                  <th className="px-6 py-3 text-right">Low at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visible.map((r) => (
                  <tr key={r.id} className={r.level === 'out' ? 'bg-red-50/40' : r.level === 'low' ? 'bg-amber-50/40' : ''}>
                    <td className="px-6 py-3">
                      <Link href={`/admin/farm-products/products/${r.id}`} className="font-medium text-gray-900 hover:text-primary-700">
                        {r.name}
                      </Link>
                      <p className="text-xs font-mono text-gray-400">{r.sku}</p>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{categoryLabels[r.category] || r.category}</td>
                    <td className="px-6 py-3 text-right">{r.stock} {r.stockUnit}</td>
                    <td className="px-6 py-3 text-right">{r.pre || '—'}</td>
                    <td className={`px-6 py-3 text-right font-semibold ${r.level === 'out' ? 'text-red-700' : r.level === 'low' ? 'text-amber-700' : 'text-gray-900'}`}>
                      {r.available} {r.stockUnit}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-500">{r.lowStockThreshold ?? '—'}</td>
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
