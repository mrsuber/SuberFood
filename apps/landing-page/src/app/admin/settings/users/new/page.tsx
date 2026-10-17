'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { AdminPage, Panel, Field, inputClass, PrimaryButton, ErrorNote, sendJson, humanize } from '@/components/admin/ui'

const ROLE_GROUPS: { label: string; roles: string[] }[] = [
  { label: 'Administration', roles: ['ADMIN', 'SUPER_ADMIN'] },
  { label: 'Restaurants & retail', roles: ['RESTAURANT_MANAGER', 'RESTAURANT_STAFF', 'DISTRIBUTION_MANAGER', 'RETAIL_MANAGER', 'PARTNER_MANAGER'] },
  { label: 'Processing', roles: ['PROCESSING_MANAGER', 'QUALITY_CONTROL'] },
  { label: 'Farming', roles: ['FARM_MANAGER', 'FARM_WORKER'] },
  { label: 'External', roles: ['B2B_PARTNER'] },
]

export default function NewTeamUserPage() {
  const { data: session } = useSession()
  const isSuper = session?.user?.role === 'SUPER_ADMIN'
  const [v, setV] = useState({ name: '', email: '', phone: '', password: '', role: 'RESTAURANT_STAFF' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<{ name: string; email: string } | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await sendJson('/api/admin/users', 'POST', v)
      setCreated(res.data)
      setV({ name: '', email: '', phone: '', password: '', role: v.role })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create user')
    } finally {
      setSaving(false)
    }
  }

  const generate = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    const pwd = Array.from(crypto.getRandomValues(new Uint32Array(12)), (n) => chars[n % chars.length]).join('')
    setV({ ...v, password: pwd })
  }

  return (
    <AdminPage
      title="Add Team Member Account"
      back={{ label: 'Settings', href: '/admin/settings' }}
      description="Create a sign-in for a team member. To give them a restaurant role (chef, waiter, driver), add them under Staff afterwards."
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <Panel className="lg:col-span-2">
          <form onSubmit={submit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Full name" required>
                <input required className={inputClass} value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
              </Field>
              <Field label="Email" required>
                <input required type="email" className={inputClass} value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
              </Field>
              <Field label="Phone">
                <input className={inputClass} placeholder="+237 6XX XXX XXX" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} />
              </Field>
              <Field label="Role" required>
                <select className={inputClass} value={v.role} onChange={(e) => setV({ ...v, role: e.target.value })}>
                  {ROLE_GROUPS.map((g) => (
                    <optgroup key={g.label} label={g.label}>
                      {g.roles.map((r) => (
                        <option key={r} value={r} disabled={!isSuper && (r === 'ADMIN' || r === 'SUPER_ADMIN')}>
                          {humanize(r)}
                          {!isSuper && (r === 'ADMIN' || r === 'SUPER_ADMIN') ? ' (super admin only)' : ''}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </Field>
              <Field label="Temporary password" required hint="At least 8 characters. Share it privately and ask them to change it.">
                <div className="flex gap-2">
                  <input required minLength={8} className={`${inputClass} font-mono`} value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} />
                  <button type="button" onClick={generate} className="rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Generate
                  </button>
                </div>
              </Field>
            </div>
            {error && <ErrorNote message={error} />}
            {created && (
              <p className="rounded-lg bg-primary-50 border border-primary-100 px-4 py-3 text-sm text-primary-900">
                Account created for {created.name} ({created.email}).
              </p>
            )}
            <PrimaryButton type="submit" loading={saving}>Create account</PrimaryButton>
          </form>
        </Panel>
        <Panel title="About roles">
          <ul className="space-y-3 text-sm text-gray-600">
            <li><strong className="text-gray-900">Admin</strong> — full access to this dashboard.</li>
            <li><strong className="text-gray-900">Managers</strong> — reserved for upcoming role-based dashboards; today the admin dashboard is limited to admins.</li>
            <li><strong className="text-gray-900">B2B partner</strong> — for the upcoming partner portal.</li>
          </ul>
        </Panel>
      </div>
    </AdminPage>
  )
}
