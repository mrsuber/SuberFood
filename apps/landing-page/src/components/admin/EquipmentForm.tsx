'use client'

import { useState } from 'react'
import { Field, inputClass, PrimaryButton, ErrorNote, useAdminFetch, humanize } from '@/components/admin/ui'

export const EQUIPMENT_TYPES = ['COOKING_APPLIANCE', 'REFRIGERATION', 'FOOD_PREP', 'DISHWASHING', 'MEASUREMENT', 'OTHER']
export const EQUIPMENT_STATUSES = ['OPERATIONAL', 'MAINTENANCE_REQUIRED', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE', 'RETIRED']

const dateValue = (d?: string | null) => (d ? d.slice(0, 10) : '')

export interface EquipmentFormValues {
  restaurantId: string
  name: string
  type: string
  status?: string
  manufacturer?: string | null
  model?: string | null
  serialNumber?: string | null
  purchaseDate?: string | null
  purchasePrice?: number | string | null
  warrantyExpiry?: string | null
  nextMaintenanceDate?: string | null
  maintenanceCostBudget?: number | string | null
  notes?: string | null
}

export function useAdminRestaurants() {
  const { data } = useAdminFetch<{ restaurants: { id: string; name: string; city: string }[] }>('/api/admin/restaurants')
  return data?.restaurants || []
}

export function EquipmentForm({
  initial,
  submitLabel,
  onSubmit,
  isEdit = false,
}: {
  initial?: Partial<EquipmentFormValues>
  submitLabel: string
  onSubmit: (values: EquipmentFormValues) => Promise<void>
  isEdit?: boolean
}) {
  const restaurants = useAdminRestaurants()
  const [values, setValues] = useState<EquipmentFormValues>({
    restaurantId: '',
    name: '',
    type: 'COOKING_APPLIANCE',
    status: 'OPERATIONAL',
    ...initial,
    purchaseDate: dateValue(initial?.purchaseDate),
    warrantyExpiry: dateValue(initial?.warrantyExpiry),
    nextMaintenanceDate: dateValue(initial?.nextMaintenanceDate),
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const set = (k: keyof EquipmentFormValues, v: string) => setValues((s) => ({ ...s, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSubmit(values)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Name" required>
          <input className={inputClass} required value={values.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Walk-in freezer" />
        </Field>
        <Field label="Location" required>
          <select
            className={inputClass}
            required
            disabled={isEdit}
            value={values.restaurantId}
            onChange={(e) => set('restaurantId', e.target.value)}
          >
            <option value="">Select a restaurant</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.city})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Type" required>
          <select className={inputClass} value={values.type} onChange={(e) => set('type', e.target.value)}>
            {EQUIPMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {humanize(t)}
              </option>
            ))}
          </select>
        </Field>
        {isEdit && (
          <Field label="Status">
            <select className={inputClass} value={values.status} onChange={(e) => set('status', e.target.value)}>
              {EQUIPMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {humanize(s)}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Manufacturer">
          <input className={inputClass} value={values.manufacturer || ''} onChange={(e) => set('manufacturer', e.target.value)} />
        </Field>
        <Field label="Model">
          <input className={inputClass} value={values.model || ''} onChange={(e) => set('model', e.target.value)} />
        </Field>
        <Field label="Serial number">
          <input className={inputClass} value={values.serialNumber || ''} onChange={(e) => set('serialNumber', e.target.value)} />
        </Field>
        <Field label="Purchase price (XAF)">
          <input type="number" min="0" className={inputClass} value={values.purchasePrice ?? ''} onChange={(e) => set('purchasePrice', e.target.value)} />
        </Field>
        <Field label="Purchase date">
          <input type="date" className={inputClass} value={values.purchaseDate || ''} onChange={(e) => set('purchaseDate', e.target.value)} />
        </Field>
        <Field label="Warranty expiry">
          <input type="date" className={inputClass} value={values.warrantyExpiry || ''} onChange={(e) => set('warrantyExpiry', e.target.value)} />
        </Field>
        {isEdit && (
          <Field label="Next maintenance date">
            <input type="date" className={inputClass} value={values.nextMaintenanceDate || ''} onChange={(e) => set('nextMaintenanceDate', e.target.value)} />
          </Field>
        )}
        <Field label="Yearly maintenance budget (XAF)">
          <input
            type="number"
            min="0"
            className={inputClass}
            value={values.maintenanceCostBudget ?? ''}
            onChange={(e) => set('maintenanceCostBudget', e.target.value)}
          />
        </Field>
        <Field label="Notes" className="md:col-span-2">
          <textarea className={inputClass} rows={3} value={values.notes || ''} onChange={(e) => set('notes', e.target.value)} />
        </Field>
      </div>
      {error && <ErrorNote message={error} />}
      <PrimaryButton type="submit" loading={saving}>
        {submitLabel}
      </PrimaryButton>
    </form>
  )
}
