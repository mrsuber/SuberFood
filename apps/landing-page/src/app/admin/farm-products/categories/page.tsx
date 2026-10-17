'use client'

import Link from 'next/link'
import { AdminPage, Panel, Loading, ErrorNote, LinkButton, useAdminFetch } from '@/components/admin/ui'
import { categoryLabels } from '@/lib/content/operations'

export default function FarmProductCategoriesPage() {
  // Admin product list gives counts for every product, including inactive ones
  const { data, loading, error } = useAdminFetch<{ data: any[] }>('/api/admin/farm-products/products?limit=1000')
  const products = data?.data || []

  const rows = Object.entries(categoryLabels).map(([value, label]) => {
    const items = products.filter((p) => p.category === value)
    return {
      value,
      label,
      total: items.length,
      active: items.filter((p) => p.status === 'ACTIVE').length,
      outOfStock: items.filter((p) => Number(p.stockQuantity) - Number(p.preOrderedQuantity || 0) <= 0).length,
    }
  })

  return (
    <AdminPage
      title="Product Categories"
      back={{ label: 'All products', href: '/admin/farm-products/products' }}
      description="Categories are fixed so the shop's filters and farm pages stay consistent. Assign them when adding or editing products."
      actions={<LinkButton href="/admin/farm-products/products/new">Add product</LinkButton>}
    >
      {error && <ErrorNote message={error} />}
      <Panel>
        {loading ? (
          <Loading />
        ) : (
          <div className="overflow-x-auto -m-6">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Products</th>
                  <th className="px-6 py-3">Active</th>
                  <th className="px-6 py-3">Out of stock</th>
                  <th className="px-6 py-3 text-right">Shop</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr key={r.value}>
                    <td className="px-6 py-3">
                      <p className="font-medium text-gray-900">{r.label}</p>
                      <p className="text-xs font-mono text-gray-400">{r.value}</p>
                    </td>
                    <td className="px-6 py-3">{r.total}</td>
                    <td className="px-6 py-3">{r.active}</td>
                    <td className={`px-6 py-3 ${r.outOfStock ? 'text-amber-700 font-semibold' : ''}`}>{r.outOfStock}</td>
                    <td className="px-6 py-3 text-right">
                      <Link href={`/distribution/farm-products?category=${r.value}`} target="_blank" className="text-primary-700 font-semibold hover:underline">
                        View in shop ↗
                      </Link>
                    </td>
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
