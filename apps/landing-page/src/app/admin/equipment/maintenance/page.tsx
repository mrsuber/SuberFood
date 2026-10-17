'use client'

import Link from 'next/link'
import { AlertTriangle, CalendarClock, Wrench } from 'lucide-react'
import { AdminPage, Panel, StatCard, StatusPill, Loading, ErrorNote, EmptyState, useAdminFetch, humanize } from '@/components/admin/ui'

const DAY = 24 * 60 * 60 * 1000

export default function EquipmentMaintenancePage() {
  const { data, loading, error } = useAdminFetch<{ equipment: any[] }>('/api/admin/equipment')
  const all = data?.equipment || []
  const now = Date.now()

  const needsWork = all.filter((e) => ['MAINTENANCE_REQUIRED', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE'].includes(e.status))
  const overdue = all.filter((e) => e.nextMaintenanceDate && new Date(e.nextMaintenanceDate).getTime() < now && e.status !== 'RETIRED')
  const dueSoon = all.filter((e) => {
    if (!e.nextMaintenanceDate || e.status === 'RETIRED') return false
    const t = new Date(e.nextMaintenanceDate).getTime()
    return t >= now && t < now + 30 * DAY
  })

  const list = (items: any[], empty: string) =>
    items.length === 0 ? (
      <EmptyState title={empty} />
    ) : (
      <ul className="-m-6 divide-y divide-gray-100">
        {items.map((e) => (
          <li key={e.id}>
            <Link href={`/admin/equipment/${e.id}`} className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 hover:bg-gray-50 text-sm">
              <span>
                <span className="font-medium text-gray-900">{e.name}</span>
                <span className="text-gray-500"> · {humanize(e.type)} · {e.restaurant?.name}</span>
              </span>
              <span className="flex items-center gap-3">
                {e.nextMaintenanceDate && (
                  <span className="text-gray-500">due {new Date(e.nextMaintenanceDate).toLocaleDateString('en-GB', { dateStyle: 'medium' })}</span>
                )}
                <StatusPill value={e.status} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    )

  return (
    <AdminPage title="Maintenance" back={{ label: 'All equipment', href: '/admin/equipment' }} description="Equipment that needs work now, is overdue for service, or is due in the next 30 days.">
      {error && <ErrorNote message={error} />}
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Needs work now" value={needsWork.length} icon={AlertTriangle} tone="red" />
            <StatCard label="Service overdue" value={overdue.length} icon={Wrench} tone="amber" />
            <StatCard label="Due in 30 days" value={dueSoon.length} icon={CalendarClock} tone="blue" />
          </div>
          <Panel title="Needs work now">{list(needsWork, 'All equipment is operational')}</Panel>
          <Panel title="Service overdue">{list(overdue, 'Nothing overdue')}</Panel>
          <Panel title="Due in the next 30 days">{list(dueSoon, 'Nothing scheduled in the next 30 days')}</Panel>
        </>
      )}
    </AdminPage>
  )
}
