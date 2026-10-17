'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AdminPage, Panel, Loading, ErrorNote, EmptyState, inputClass, useAdminFetch, humanize } from '@/components/admin/ui'
import { WEEK_DAYS, type WorkSchedule } from '@/components/admin/staffOptions'

export default function StaffSchedulesPage() {
  const { data, loading, error } = useAdminFetch<{ staff: any[] }>('/api/admin/staff?status=ACTIVE')
  const [restaurantId, setRestaurantId] = useState('all')

  const staff = data?.staff || []
  const restaurants = Array.from(new Map(staff.map((s) => [s.restaurant?.id, s.restaurant])).values()).filter(Boolean)
  const visible = staff.filter((s) => restaurantId === 'all' || s.restaurant?.id === restaurantId)
  const unscheduled = visible.filter((s) => !s.workSchedule || Object.keys(s.workSchedule).length === 0).length

  return (
    <AdminPage
      title="Staff Schedules"
      back={{ label: 'All staff', href: '/admin/staff' }}
      description="Weekly shift plan for active staff. Click a name to edit their schedule."
    >
      <Panel>
        <div className="flex flex-wrap items-center gap-4">
          <select className={`${inputClass} w-auto`} value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)}>
            <option value="all">All locations</option>
            {restaurants.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          {unscheduled > 0 && <span className="text-sm text-amber-700">{unscheduled} staff without a schedule</span>}
        </div>
      </Panel>
      {error && <ErrorNote message={error} />}
      {loading ? (
        <Loading />
      ) : visible.length === 0 ? (
        <Panel><EmptyState title="No active staff" action={{ label: 'Add a staff member', href: '/admin/staff/new' }} /></Panel>
      ) : (
        <Panel>
          <div className="overflow-x-auto -m-6">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Staff</th>
                  {WEEK_DAYS.map((d) => <th key={d} className="px-3 py-3 text-left">{d.slice(0, 3)}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visible.map((s) => {
                  const ws: WorkSchedule = s.workSchedule || {}
                  return (
                    <tr key={s.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link href={`/admin/staff/${s.id}`} className="font-medium text-gray-900 hover:text-primary-700">
                          {s.user?.name || s.employeeId}
                        </Link>
                        <p className="text-xs text-gray-500">{humanize(s.role)} · {s.restaurant?.name}</p>
                      </td>
                      {WEEK_DAYS.map((d) => (
                        <td key={d} className="px-3 py-3 align-top">
                          {(ws[d] || []).length ? (
                            ws[d]!.map((shift) => (
                              <span key={shift} className="block rounded bg-primary-50 px-2 py-0.5 mb-1 text-xs text-primary-800 whitespace-nowrap">{shift}</span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-300">off</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </AdminPage>
  )
}
