'use client'

import Link from 'next/link'
import { AdminPage, Panel, StatusPill, Loading, ErrorNote, EmptyState, LinkButton, useAdminFetch, groupByRestaurant, humanize } from '@/components/admin/ui'

export default function StaffByLocationPage() {
  const { data, loading, error } = useAdminFetch<{ staff: any[] }>('/api/admin/staff?status=ACTIVE')
  const groups = groupByRestaurant(data?.staff || [])

  return (
    <AdminPage
      title="Staff by Location"
      back={{ label: 'All staff', href: '/admin/staff' }}
      description="Active team members at each restaurant."
      actions={<LinkButton href="/admin/staff/new">Add staff member</LinkButton>}
    >
      {error && <ErrorNote message={error} />}
      {loading ? (
        <Loading />
      ) : groups.length === 0 ? (
        <Panel><EmptyState title="No active staff yet" action={{ label: 'Add a staff member', href: '/admin/staff/new' }} /></Panel>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {groups.map((g) => {
            const roles = g.items.reduce<Record<string, number>>((acc, s) => ({ ...acc, [s.role]: (acc[s.role] || 0) + 1 }), {})
            return (
              <Panel key={g.name} title={`${g.name}${g.city ? ` · ${g.city}` : ''} — ${g.items.length} people`}>
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.entries(roles).map(([role, n]) => (
                    <span key={role} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      {humanize(role)} × {n}
                    </span>
                  ))}
                </div>
                <ul className="divide-y divide-gray-100 text-sm">
                  {g.items.map((s) => (
                    <li key={s.id}>
                      <Link href={`/admin/staff/${s.id}`} className="flex items-center justify-between py-2 hover:text-primary-700">
                        <span>
                          <span className="font-medium">{s.user?.name || s.employeeId}</span>
                          <span className="text-gray-500"> · {humanize(s.role)}</span>
                        </span>
                        <StatusPill value={s.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Panel>
            )
          })}
        </div>
      )}
    </AdminPage>
  )
}
