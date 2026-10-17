'use client'

import Link from 'next/link'
import { AdminPage, Panel, Loading, ErrorNote, EmptyState, LinkButton, useAdminFetch } from '@/components/admin/ui'
import { useAdminRestaurants } from '@/components/admin/EquipmentForm'

export default function InventoryByLocationPage() {
  const { data, loading, error } = useAdminFetch<{ data: any[] }>('/api/inventory/items')
  const restaurants = useAdminRestaurants()
  const items = data?.data || []

  const groups = [
    ...restaurants.map((r) => ({ id: r.id, name: `${r.name} · ${r.city}`, items: items.filter((i) => i.restaurantId === r.id) })),
    { id: 'shared', name: 'Shared / central stock', items: items.filter((i) => !i.restaurantId) },
  ].filter((g) => g.items.length > 0)

  return (
    <AdminPage
      title="Inventory by Location"
      back={{ label: 'All ingredients', href: '/admin/inventory' }}
      actions={<LinkButton href="/admin/inventory/receive">Receive stock</LinkButton>}
    >
      {error && <ErrorNote message={error} />}
      {loading ? (
        <Loading />
      ) : groups.length === 0 ? (
        <Panel><EmptyState title="No ingredients yet" action={{ label: 'Add an ingredient', href: '/admin/inventory/new' }} /></Panel>
      ) : (
        groups.map((g) => {
          const low = g.items.filter((i) => Number(i.rawStock) <= Number(i.minimumStock))
          return (
            <Panel key={g.id} title={`${g.name} — ${g.items.length} ingredients${low.length ? `, ${low.length} low` : ''}`}>
              <div className="overflow-x-auto -m-6">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-6 py-3">Ingredient</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3 text-right">In stock</th>
                      <th className="px-6 py-3 text-right">Minimum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {g.items.map((i) => {
                      const isLow = Number(i.rawStock) <= Number(i.minimumStock)
                      return (
                        <tr key={i.id} className={isLow ? 'bg-amber-50/50' : ''}>
                          <td className="px-6 py-3">
                            <Link href={`/admin/inventory/${i.id}`} className="font-medium text-gray-900 hover:text-primary-700">{i.name}</Link>
                          </td>
                          <td className="px-6 py-3 text-gray-600">{i.category}</td>
                          <td className={`px-6 py-3 text-right ${isLow ? 'text-amber-700 font-semibold' : ''}`}>{Number(i.rawStock).toLocaleString('fr-FR')} {i.unit?.toLowerCase()}</td>
                          <td className="px-6 py-3 text-right text-gray-500">{Number(i.minimumStock).toLocaleString('fr-FR')}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>
          )
        })
      )}
    </AdminPage>
  )
}
