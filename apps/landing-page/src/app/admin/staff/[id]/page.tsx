'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ClipboardCheck, Star, Truck, CalendarDays } from 'lucide-react'
import {
  AdminPage,
  Panel,
  StatCard,
  StatusPill,
  Loading,
  ErrorNote,
  Field,
  inputClass,
  PrimaryButton,
  useAdminFetch,
  sendJson,
  humanize,
} from '@/components/admin/ui'
import { useAdminRestaurants } from '@/components/admin/EquipmentForm'
import { STAFF_ROLES, STAFF_STATUSES, WEEK_DAYS, type WorkSchedule } from '@/components/admin/staffOptions'

export default function StaffDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const restaurants = useAdminRestaurants()
  const { data: staff, loading, error, reload } = useAdminFetch<any>(`/api/admin/staff/${id}`)
  const [form, setForm] = useState<any>(null)
  const [schedule, setSchedule] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!staff) return
    setForm({
      role: staff.role,
      status: staff.status,
      restaurantId: staff.restaurantId,
      hourlyRate: staff.hourlyRate ?? '',
      salary: staff.salary ?? '',
    })
    const ws: WorkSchedule = staff.workSchedule || {}
    setSchedule(Object.fromEntries(WEEK_DAYS.map((d) => [d, (ws[d] || []).join(', ')])))
  }, [staff])

  if (loading && !staff) return <AdminPage title="Staff member"><Loading /></AdminPage>
  if (error || !staff)
    return (
      <AdminPage title="Staff member" back={{ label: 'All staff', href: '/admin/staff' }}>
        <ErrorNote message={error || 'Staff member not found'} />
      </AdminPage>
    )

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    setSaved(false)
    try {
      const workSchedule = Object.fromEntries(
        Object.entries(schedule)
          .map(([day, value]) => [day, value.split(',').map((s) => s.trim()).filter(Boolean)])
          .filter(([, shifts]) => (shifts as string[]).length > 0)
      )
      await sendJson(`/api/admin/staff/${id}`, 'PUT', { ...form, workSchedule })
      setSaved(true)
      reload()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!confirm(`Remove ${staff.user?.name || 'this staff member'}?`)) return
    await sendJson(`/api/admin/staff/${id}`, 'DELETE')
    router.push('/admin/staff')
  }

  const m = staff.performanceMetrics || {}

  return (
    <AdminPage
      title={staff.user?.name || 'Staff member'}
      back={{ label: 'All staff', href: '/admin/staff' }}
      description={`${humanize(staff.role)} · ${staff.restaurant?.name || ''} · Employee ${staff.employeeId}`}
      actions={
        <button onClick={remove} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
          Remove
        </button>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Status" value={<StatusPill value={staff.status} />} icon={CalendarDays} tone="gray" />
        <StatCard label="Orders completed" value={staff.ordersCompleted ?? 0} icon={ClipboardCheck} />
        <StatCard label="Deliveries" value={staff.deliveriesCompleted ?? 0} icon={Truck} tone="blue" />
        <StatCard label="Rating" value={staff.averageRating ? staff.averageRating.toFixed(1) : '—'} icon={Star} tone="amber" />
      </div>

      {form && (
        <form onSubmit={save} className="grid lg:grid-cols-2 gap-6">
          <Panel title="Employment">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Role">
                <select className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {STAFF_ROLES.map((r) => <option key={r} value={r}>{humanize(r)}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STAFF_STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
                </select>
              </Field>
              <Field label="Location" className="sm:col-span-2">
                <select className={inputClass} value={form.restaurantId} onChange={(e) => setForm({ ...form, restaurantId: e.target.value })}>
                  {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.city})</option>)}
                </select>
              </Field>
              <Field label="Hourly rate (XAF)">
                <input type="number" min="0" className={inputClass} value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} />
              </Field>
              <Field label="Monthly salary (XAF)">
                <input type="number" min="0" className={inputClass} value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
              </Field>
            </div>
            <dl className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
              <div><dt className="text-gray-500">Email</dt><dd className="font-medium">{staff.user?.email || '—'}</dd></div>
              <div><dt className="text-gray-500">Phone</dt><dd className="font-medium">{staff.user?.phone || '—'}</dd></div>
              <div><dt className="text-gray-500">Hired</dt><dd className="font-medium">{new Date(staff.hireDate).toLocaleDateString('en-GB', { dateStyle: 'medium' })}</dd></div>
              {m.totalHoursWorked != null && <div><dt className="text-gray-500">Hours worked</dt><dd className="font-medium">{m.totalHoursWorked}</dd></div>}
            </dl>
          </Panel>

          <Panel title="Weekly schedule">
            <p className="text-sm text-gray-500 mb-4">Shifts as HH:MM-HH:MM, separate several with commas. Leave empty for a day off.</p>
            <div className="space-y-3">
              {WEEK_DAYS.map((day) => (
                <div key={day} className="grid grid-cols-3 items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 capitalize">{day}</span>
                  <input
                    className={`${inputClass} col-span-2`}
                    placeholder="e.g. 09:00-17:00"
                    value={schedule[day] || ''}
                    onChange={(e) => setSchedule({ ...schedule, [day]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </Panel>

          <div className="lg:col-span-2 flex items-center gap-4">
            <PrimaryButton type="submit" loading={saving}>Save changes</PrimaryButton>
            {saved && <span className="text-sm text-primary-700">Saved</span>}
            {saveError && <ErrorNote message={saveError} />}
          </div>
        </form>
      )}
    </AdminPage>
  )
}
