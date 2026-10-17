'use client'

import { useState } from 'react'
import { Panel, StatCard, StatusPill, Loading, ErrorNote, EmptyState, Field, inputClass, PrimaryButton, useAdminFetch, sendJson, humanize } from '@/components/admin/ui'
import type { LucideIcon } from 'lucide-react'

export interface SiteRegistryConfig {
  endpoint: string
  noun: string
  types: string[]
  statuses: string[]
  sizeField: 'size' | 'capacity'
  sizeLabel: string
  sizeUnit: string
  icon: LucideIcon
}

/** List + create UI for simple site records (farms, processing facilities). */
export function SiteRegistry({ config, showForm = true }: { config: SiteRegistryConfig; showForm?: boolean }) {
  const { data, loading, error, reload } = useAdminFetch<{ data: any[] }>(config.endpoint)
  const [values, setValues] = useState({ name: '', type: config.types[0], location: '', size: '' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const items = data?.data || []
  const byType = config.types.map((t) => ({ type: t, count: items.filter((i) => i.type === t).length }))
  const totalSize = items.reduce((sum, i) => sum + (i[config.sizeField] || 0), 0)

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      await sendJson(config.endpoint, 'POST', {
        name: values.name,
        type: values.type,
        location: values.location,
        [config.sizeField]: values.size,
      })
      setValues({ ...values, name: '', location: '', size: '' })
      reload()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  const setStatus = async (id: string, status: string) => {
    await sendJson(`${config.endpoint}/${id}`, 'PATCH', { status })
    reload()
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={`Total ${config.noun}s`} value={items.length} icon={config.icon} />
        <StatCard label={config.sizeLabel} value={`${totalSize.toLocaleString('fr-FR')} ${config.sizeUnit}`} tone="blue" />
        {byType
          .filter((t) => t.count > 0)
          .slice(0, 2)
          .map((t) => (
            <StatCard key={t.type} label={humanize(t.type)} value={t.count} tone="gray" />
          ))}
      </div>

      <div className={showForm ? 'grid lg:grid-cols-3 gap-6' : ''}>
        <Panel title={`All ${config.noun}s`} className={showForm ? 'lg:col-span-2' : ''}>
          {error && <ErrorNote message={error} />}
          {loading ? (
            <Loading />
          ) : items.length === 0 ? (
            <EmptyState title={`No ${config.noun}s registered yet`} description={`Add your first ${config.noun} to start tracking it.`} />
          ) : (
            <ul className="-m-6 divide-y divide-gray-100">
              {items.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{i.name}</p>
                    <p className="text-gray-500">
                      {humanize(i.type)} · {i.location} · {i[config.sizeField]} {config.sizeUnit}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusPill value={i.status} map={{ OPERATIONAL: 'bg-green-100 text-green-800', MAINTENANCE: 'bg-amber-100 text-amber-800', CLOSED: 'bg-gray-100 text-gray-700' }} />
                    <select className={`${inputClass} w-auto py-1`} value={i.status} onChange={(e) => setStatus(i.id, e.target.value)} aria-label="Change status">
                      {config.statuses.map((s) => (
                        <option key={s} value={s}>
                          {humanize(s)}
                        </option>
                      ))}
                    </select>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {showForm && (
          <Panel title={`Add ${config.noun}`}>
            <form onSubmit={create} className="space-y-4">
              <Field label="Name" required>
                <input required className={inputClass} value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
              </Field>
              <Field label="Type" required>
                <select className={inputClass} value={values.type} onChange={(e) => setValues({ ...values, type: e.target.value })}>
                  {config.types.map((t) => (
                    <option key={t} value={t}>
                      {humanize(t)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Location" required>
                <input required className={inputClass} placeholder="e.g. Muea, Buea" value={values.location} onChange={(e) => setValues({ ...values, location: e.target.value })} />
              </Field>
              <Field label={`${config.sizeLabel} (${config.sizeUnit})`} required>
                <input required type="number" min="0" step="any" className={inputClass} value={values.size} onChange={(e) => setValues({ ...values, size: e.target.value })} />
              </Field>
              {formError && <ErrorNote message={formError} />}
              <PrimaryButton type="submit" loading={saving} className="w-full">
                Add {config.noun}
              </PrimaryButton>
            </form>
          </Panel>
        )}
      </div>
    </div>
  )
}
