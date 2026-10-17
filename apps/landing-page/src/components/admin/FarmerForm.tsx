'use client'

import { useState } from 'react'
import { Field, inputClass, PrimaryButton, ErrorNote, humanize } from '@/components/admin/ui'

export const FARMER_TYPES = ['INDIVIDUAL', 'COOPERATIVE', 'COMMERCIAL_FARM', 'ORGANIC_FARM']
export const FARMER_STATUSES = ['PENDING_VERIFICATION', 'ACTIVE', 'INACTIVE', 'SUSPENDED']
// Cameroon's ten regions
export const REGIONS = ['Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 'North', 'North-West', 'South', 'South-West', 'West']

const listToText = (v: unknown) => (Array.isArray(v) ? v.join(', ') : '')
const textToList = (v: string) => v.split(',').map((s) => s.trim()).filter(Boolean)

export function FarmerForm({
  initial,
  submitLabel,
  onSubmit,
  isEdit = false,
}: {
  initial?: any
  submitLabel: string
  onSubmit: (values: any) => Promise<void>
  isEdit?: boolean
}) {
  const [v, setV] = useState<any>({
    name: '',
    businessName: '',
    farmerType: 'INDIVIDUAL',
    phone: '',
    alternatePhone: '',
    email: '',
    address: '',
    region: 'South-West',
    district: '',
    village: '',
    isOrganic: false,
    isCertified: false,
    mobileMoneyNumber: '',
    mobileMoneyProvider: 'MTN',
    bankName: '',
    bankAccountNumber: '',
    specialties: '',
    notes: '',
    status: 'PENDING_VERIFICATION',
    ...initial,
    farmSize: initial?.farmSize != null ? String(initial.farmSize) : '',
    mainCropsText: listToText(initial?.mainCrops),
    certificationsText: listToText(initial?.certifications),
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const set = (k: string, value: unknown) => setV((s: any) => ({ ...s, [k]: value }))
  const text = (k: string, label: string, opts: { required?: boolean; placeholder?: string; type?: string; className?: string } = {}) => (
    <Field label={label} required={opts.required} className={opts.className}>
      <input
        type={opts.type || 'text'}
        required={opts.required}
        placeholder={opts.placeholder}
        className={inputClass}
        value={v[k] ?? ''}
        onChange={(e) => set(k, e.target.value)}
      />
    </Field>
  )

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const { mainCropsText, certificationsText, ...rest } = v
      await onSubmit({
        ...rest,
        farmSize: v.farmSize ? parseFloat(v.farmSize) : null,
        mainCrops: textToList(mainCropsText),
        certifications: textToList(certificationsText),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <section>
        <h3 className="font-semibold text-gray-900 mb-4">Identity</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {text('name', 'Full name', { required: true })}
          {text('businessName', 'Farm / cooperative name')}
          <Field label="Type">
            <select className={inputClass} value={v.farmerType} onChange={(e) => set('farmerType', e.target.value)}>
              {FARMER_TYPES.map((t) => <option key={t} value={t}>{humanize(t)}</option>)}
            </select>
          </Field>
          {text('phone', 'Phone', { required: true, placeholder: '+237 6XX XXX XXX' })}
          {text('alternatePhone', 'Alternate phone')}
          {text('email', 'Email', { type: 'email' })}
          {isEdit && (
            <Field label="Status">
              <select className={inputClass} value={v.status} onChange={(e) => set('status', e.target.value)}>
                {FARMER_STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
              </select>
            </Field>
          )}
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 mb-4">Location</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Region" required>
            <select className={inputClass} value={v.region} onChange={(e) => set('region', e.target.value)}>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              {v.region && !REGIONS.includes(v.region) && <option value={v.region}>{v.region}</option>}
            </select>
          </Field>
          {text('district', 'Division / district')}
          {text('village', 'Village / locality')}
          {text('address', 'Address or directions', { required: true, className: 'md:col-span-3' })}
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 mb-4">Farm</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {text('farmSize', 'Farm size (hectares)', { type: 'number' })}
          {text('mainCropsText', 'Main products', { placeholder: 'Tomatoes, plantain, tilapia', className: 'md:col-span-2' })}
          {text('specialties', 'Specialties', { className: 'md:col-span-2' })}
          {text('certificationsText', 'Certifications', { placeholder: 'Comma separated' })}
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={!!v.isOrganic} onChange={(e) => set('isOrganic', e.target.checked)} /> Organic practices
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={!!v.isCertified} onChange={(e) => set('isCertified', e.target.checked)} /> Certified
          </label>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 mb-4">Payment details</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {text('mobileMoneyNumber', 'Mobile money number')}
          <Field label="Provider">
            <select className={inputClass} value={v.mobileMoneyProvider || ''} onChange={(e) => set('mobileMoneyProvider', e.target.value)}>
              <option value="MTN">MTN Mobile Money</option>
              <option value="ORANGE">Orange Money</option>
            </select>
          </Field>
          {text('bankName', 'Bank')}
          {text('bankAccountNumber', 'Account number')}
        </div>
      </section>

      <Field label="Internal notes">
        <textarea className={inputClass} rows={3} value={v.notes || ''} onChange={(e) => set('notes', e.target.value)} />
      </Field>

      {error && <ErrorNote message={error} />}
      <PrimaryButton type="submit" loading={saving}>{submitLabel}</PrimaryButton>
    </form>
  )
}
