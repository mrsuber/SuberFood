'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, Search } from 'lucide-react'
import { AdminPage, Panel, Field, inputClass, PrimaryButton, ErrorNote, sendJson, humanize } from '@/components/admin/ui'
import { useAdminRestaurants } from '@/components/admin/EquipmentForm'
import { STAFF_ROLES } from '@/components/admin/staffOptions'

interface UserHit {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  role: string
}

export default function NewStaffPage() {
  const router = useRouter()
  const restaurants = useAdminRestaurants()
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<UserHit[]>([])
  const [user, setUser] = useState<UserHit | null>(null)
  const [values, setValues] = useState({
    restaurantId: '',
    role: 'WAITER',
    employeeId: '',
    hireDate: new Date().toISOString().slice(0, 10),
    hourlyRate: '',
    salary: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (query.trim().length < 2) {
      setHits([])
      return
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(query.trim())}`)
      const json = await res.json().catch(() => ({}))
      setHits(json.data || [])
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('Select the person’s user account first.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await sendJson('/api/admin/staff', 'POST', { ...values, userId: user.id })
      router.push(res.staff?.id ? `/admin/staff/${res.staff.id}` : '/admin/staff')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add staff member')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminPage
      title="Add Staff Member"
      back={{ label: 'All staff', href: '/admin/staff' }}
      description="Staff records are linked to a user account so the person can sign in (e.g. drivers using delivery tracking)."
    >
      <form onSubmit={submit} className="grid lg:grid-cols-3 gap-6">
        <Panel title="1. Account" className="lg:col-span-1">
          {user ? (
            <div className="rounded-lg border border-primary-200 bg-primary-50 p-4 text-sm">
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                <Check className="w-4 h-4 text-primary-600" /> {user.name || 'Unnamed user'}
              </p>
              <p className="text-gray-600">{user.email || user.phone}</p>
              <button type="button" onClick={() => setUser(null)} className="mt-2 text-primary-700 font-semibold hover:underline">
                Change
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  className={`${inputClass} pl-9`}
                  placeholder="Search by name, email or phone"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <ul className="mt-3 divide-y divide-gray-100">
                {hits.map((h) => (
                  <li key={h.id}>
                    <button type="button" onClick={() => setUser(h)} className="w-full text-left py-2 text-sm hover:text-primary-700">
                      <span className="font-medium">{h.name || 'Unnamed'}</span>
                      <span className="text-gray-500"> · {h.email || h.phone}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-gray-500">
                No account yet?{' '}
                <Link href="/admin/settings/users/new" className="text-primary-700 font-semibold hover:underline">
                  Create a team account
                </Link>{' '}
                first.
              </p>
            </>
          )}
        </Panel>

        <Panel title="2. Employment" className="lg:col-span-2">
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Location" required>
              <select required className={inputClass} value={values.restaurantId} onChange={(e) => setValues({ ...values, restaurantId: e.target.value })}>
                <option value="">Select a restaurant</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.city})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Role" required>
              <select className={inputClass} value={values.role} onChange={(e) => setValues({ ...values, role: e.target.value })}>
                {STAFF_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {humanize(r)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Employee ID" required hint="Must be unique, e.g. DLA-012">
              <input required className={inputClass} value={values.employeeId} onChange={(e) => setValues({ ...values, employeeId: e.target.value })} />
            </Field>
            <Field label="Hire date" required>
              <input type="date" required className={inputClass} value={values.hireDate} onChange={(e) => setValues({ ...values, hireDate: e.target.value })} />
            </Field>
            <Field label="Hourly rate (XAF)">
              <input type="number" min="0" className={inputClass} value={values.hourlyRate} onChange={(e) => setValues({ ...values, hourlyRate: e.target.value })} />
            </Field>
            <Field label="Monthly salary (XAF)">
              <input type="number" min="0" className={inputClass} value={values.salary} onChange={(e) => setValues({ ...values, salary: e.target.value })} />
            </Field>
          </div>
          {error && <div className="mt-5"><ErrorNote message={error} /></div>}
          <PrimaryButton type="submit" loading={saving} className="mt-6">
            Add staff member
          </PrimaryButton>
        </Panel>
      </form>
    </AdminPage>
  )
}
