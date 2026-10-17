'use client'

import Link from 'next/link'
import { AdminPage, Panel, StatusPill, Loading, ErrorNote, EmptyState, LinkButton, useAdminFetch, groupByRestaurant, humanize } from '@/components/admin/ui'

export default function EquipmentByLocationPage() {
  const { data, loading, error } = useAdminFetch<{ equipment: any[] }>('/api/admin/equipment')
  const groups = groupByRestaurant(data?.equipment || [])

  return (
    <AdminPage
      title="Equipment by Location"
      back={{ label: 'All equipment', href: '/admin/equipment' }}
      actions={<LinkButton href="/admin/equipment/new">Add equipment</LinkButton>}
    >
      {error && <ErrorNote message={error} />}
      {loading ? (
        <Loading />
      ) : groups.length === 0 ? (
        <Panel><EmptyState title="No equipment yet" action={{ label: 'Add equipment', href: '/admin/equipment/new' }} /></Panel>
      ) : (
        groups.map((g) => {
          const attention = g.items.filter((e) => e.status !== 'OPERATIONAL' && e.status !== 'RETIRED').length
          return (
            <Panel key={g.name} title={`${g.name}${g.city ? ` · ${g.city}` : ''} — ${g.items.length} items${attention ? `, ${attention} need attention` : ''}`}>
              <ul className="-m-6 divide-y divide-gray-100">
                {g.items.map((e) => (
                  <li key={e.id}>
                    <Link href={`/admin/equipment/${e.id}`} className="flex items-center justify-between gap-4 px-6 py-3 hover:bg-gray-50 text-sm">
                      <span>
                        <span className="font-medium text-gray-900">{e.name}</span>
                        <span className="text-gray-500"> · {humanize(e.type)}</span>
                      </span>
                      <StatusPill value={e.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          )
        })
      )}
    </AdminPage>
  )
}
