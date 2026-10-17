'use client'

import Link from 'next/link'
import { AdminPage, Panel, Loading, ErrorNote, EmptyState, LinkButton, useAdminFetch } from '@/components/admin/ui'

export default function MenusByLocationPage() {
  const { data, loading, error } = useAdminFetch<{ menuItems: any[] }>('/api/admin/menu')
  const items = data?.menuItems || []

  const byRestaurant = new Map<string, { name: string; categories: Map<string, { name: string; items: any[] }> }>()
  for (const item of items) {
    const r = item.category?.restaurant
    const rKey = r?.id || 'none'
    if (!byRestaurant.has(rKey)) byRestaurant.set(rKey, { name: r ? `${r.name} · ${r.city}` : 'Unassigned', categories: new Map() })
    const cats = byRestaurant.get(rKey)!.categories
    const cKey = item.category?.id || 'none'
    if (!cats.has(cKey)) cats.set(cKey, { name: item.category?.name || 'Uncategorised', items: [] })
    cats.get(cKey)!.items.push(item)
  }

  return (
    <AdminPage
      title="Menus by Location"
      back={{ label: 'All menu items', href: '/admin/menus' }}
      actions={<LinkButton href="/admin/menus/new">Add menu item</LinkButton>}
    >
      {error && <ErrorNote message={error} />}
      {loading ? (
        <Loading />
      ) : byRestaurant.size === 0 ? (
        <Panel><EmptyState title="No menu items yet" action={{ label: 'Add a menu item', href: '/admin/menus/new' }} /></Panel>
      ) : (
        [...byRestaurant.entries()].map(([id, r]) => {
          const total = [...r.categories.values()].reduce((s, c) => s + c.items.length, 0)
          const unavailable = [...r.categories.values()].reduce((s, c) => s + c.items.filter((i) => !i.isAvailable).length, 0)
          return (
            <Panel key={id} title={`${r.name} — ${total} dishes${unavailable ? `, ${unavailable} unavailable` : ''}`}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...r.categories.entries()].map(([cid, c]) => (
                  <div key={cid}>
                    <Link href={`/admin/menus/categories/${cid}`} className="font-semibold text-gray-900 hover:text-primary-700">{c.name}</Link>
                    <ul className="mt-2 space-y-1 text-sm">
                      {c.items.map((i) => (
                        <li key={i.id} className="flex justify-between gap-3">
                          <Link href={`/admin/menus/${i.id}`} className={`hover:text-primary-700 ${i.isAvailable ? 'text-gray-700' : 'text-gray-400 line-through'}`}>{i.name}</Link>
                          <span className="text-gray-500 whitespace-nowrap">{Math.round(i.price).toLocaleString('fr-FR')} XAF</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Panel>
          )
        })
      )}
    </AdminPage>
  )
}
