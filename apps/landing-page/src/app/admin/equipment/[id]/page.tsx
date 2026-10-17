'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Wrench, Clock, Banknote, AlertTriangle } from 'lucide-react'
import {
  AdminPage,
  Panel,
  StatCard,
  StatusPill,
  Loading,
  ErrorNote,
  EmptyState,
  Field,
  inputClass,
  PrimaryButton,
  useAdminFetch,
  sendJson,
  humanize,
} from '@/components/admin/ui'
import { EquipmentForm } from '@/components/admin/EquipmentForm'

const xaf = (n: number | null | undefined) => `${Math.round(n || 0).toLocaleString('fr-FR')} XAF`
const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : '—')

export default function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: eq, loading, error, reload } = useAdminFetch<any>(`/api/admin/equipment/${id}`)
  const [editing, setEditing] = useState(false)
  const [log, setLog] = useState({ maintenanceType: 'ROUTINE', description: '', cost: '', performedBy: '', startDate: '', completedDate: '' })
  const [savingLog, setSavingLog] = useState(false)
  const [logError, setLogError] = useState<string | null>(null)

  if (loading && !eq) return <AdminPage title="Equipment"><Loading /></AdminPage>
  if (error || !eq)
    return (
      <AdminPage title="Equipment" back={{ label: 'All equipment', href: '/admin/equipment' }}>
        <ErrorNote message={error || 'Equipment not found'} />
      </AdminPage>
    )

  const addLog = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingLog(true)
    setLogError(null)
    try {
      await sendJson(`/api/admin/equipment/${id}/maintenance`, 'POST', {
        ...log,
        cost: parseFloat(log.cost || '0'),
        startDate: log.startDate || new Date().toISOString(),
        completedDate: log.completedDate || null,
      })
      setLog({ maintenanceType: 'ROUTINE', description: '', cost: '', performedBy: '', startDate: '', completedDate: '' })
      reload()
    } catch (err) {
      setLogError(err instanceof Error ? err.message : 'Could not save maintenance')
    } finally {
      setSavingLog(false)
    }
  }

  const completeLog = async (logId: string) => {
    await sendJson(`/api/admin/equipment/${id}/maintenance`, 'PUT', { logId, completedDate: new Date().toISOString() })
    reload()
  }

  const retire = async () => {
    if (!confirm(`Delete ${eq.name}? This cannot be undone.`)) return
    await sendJson(`/api/admin/equipment/${id}`, 'DELETE')
    router.push('/admin/equipment')
  }

  return (
    <AdminPage
      title={eq.name}
      back={{ label: 'All equipment', href: '/admin/equipment' }}
      description={`${humanize(eq.type)} · ${eq.restaurant?.name || ''}${eq.restaurant?.city ? `, ${eq.restaurant.city}` : ''}`}
      actions={
        <>
          <button onClick={() => setEditing((v) => !v)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            {editing ? 'Cancel edit' : 'Edit'}
          </button>
          <button onClick={retire} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
            Delete
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Status" value={<StatusPill value={eq.status} />} icon={Wrench} tone="gray" />
        <StatCard label="Maintenance spend" value={xaf(eq.metrics?.totalMaintenanceCost)} icon={Banknote} />
        <StatCard label="Open maintenance" value={eq.metrics?.pendingMaintenance ?? 0} icon={AlertTriangle} tone="amber" />
        <StatCard label="Usage hours" value={Math.round(eq.totalUsageHours || 0)} icon={Clock} tone="blue" />
      </div>

      {editing ? (
        <Panel title="Edit equipment">
          <EquipmentForm
            isEdit
            initial={{ ...eq, restaurantId: eq.restaurantId }}
            submitLabel="Save changes"
            onSubmit={async (values) => {
              await sendJson(`/api/admin/equipment/${id}`, 'PUT', values)
              setEditing(false)
              reload()
            }}
          />
        </Panel>
      ) : (
        <Panel title="Details">
          <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            {[
              ['Manufacturer', eq.manufacturer],
              ['Model', eq.model],
              ['Serial number', eq.serialNumber],
              ['Purchase price', eq.purchasePrice ? xaf(eq.purchasePrice) : null],
              ['Purchased', fmt(eq.purchaseDate)],
              ['Warranty until', fmt(eq.warrantyExpiry)],
              ['Last maintenance', fmt(eq.lastMaintenanceDate)],
              ['Next maintenance', fmt(eq.nextMaintenanceDate)],
            ].map(([k, v]) => (
              <div key={k as string}>
                <dt className="text-gray-500">{k}</dt>
                <dd className="font-medium text-gray-900">{v || '—'}</dd>
              </div>
            ))}
          </dl>
          {eq.notes && <p className="mt-4 text-sm text-gray-700 whitespace-pre-line">{eq.notes}</p>}
        </Panel>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <Panel title="Maintenance history" className="lg:col-span-2">
          {eq.maintenanceLogs?.length ? (
            <ul className="-m-6 divide-y divide-gray-100">
              {eq.maintenanceLogs.map((m: any) => (
                <li key={m.id} className="px-6 py-4 flex flex-wrap items-start justify-between gap-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">
                      {humanize(m.maintenanceType)} — {m.description}
                    </p>
                    <p className="text-gray-500">
                      {fmt(m.startDate)}
                      {m.performedBy ? ` · ${m.performedBy}` : ''} · {xaf(m.cost)}
                    </p>
                  </div>
                  {m.completedDate ? (
                    <StatusPill value="COMPLETED" />
                  ) : (
                    <button onClick={() => completeLog(m.id)} className="text-sm font-semibold text-primary-700 hover:underline">
                      Mark complete
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No maintenance recorded yet" />
          )}
        </Panel>

        <Panel title="Log maintenance">
          <form onSubmit={addLog} className="space-y-4">
            <Field label="Type">
              <select className={inputClass} value={log.maintenanceType} onChange={(e) => setLog({ ...log, maintenanceType: e.target.value })}>
                {['ROUTINE', 'REPAIR', 'EMERGENCY', 'INSPECTION'].map((t) => (
                  <option key={t} value={t}>
                    {humanize(t)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="What was done" required>
              <input required className={inputClass} value={log.description} onChange={(e) => setLog({ ...log, description: e.target.value })} />
            </Field>
            <Field label="Cost (XAF)">
              <input type="number" min="0" className={inputClass} value={log.cost} onChange={(e) => setLog({ ...log, cost: e.target.value })} />
            </Field>
            <Field label="Performed by">
              <input className={inputClass} value={log.performedBy} onChange={(e) => setLog({ ...log, performedBy: e.target.value })} />
            </Field>
            <Field label="Started">
              <input type="date" className={inputClass} value={log.startDate} onChange={(e) => setLog({ ...log, startDate: e.target.value })} />
            </Field>
            <Field label="Completed" hint="Leave empty if still in progress">
              <input type="date" className={inputClass} value={log.completedDate} onChange={(e) => setLog({ ...log, completedDate: e.target.value })} />
            </Field>
            {logError && <ErrorNote message={logError} />}
            <PrimaryButton type="submit" loading={savingLog} className="w-full">
              Save maintenance
            </PrimaryButton>
          </form>
        </Panel>
      </div>
    </AdminPage>
  )
}
