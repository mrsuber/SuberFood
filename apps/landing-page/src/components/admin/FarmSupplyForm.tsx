'use client'

import { useState } from 'react'
import { Field, inputClass, PrimaryButton, ErrorNote, useAdminFetch, sendJson } from '@/components/admin/ui'

/** Record produce/fish/livestock received from a farmer, optionally adding it to shop stock. */
export function FarmSupplyForm({ onSaved, farmerId }: { onSaved?: () => void; farmerId?: string }) {
  const { data: farmersData } = useAdminFetch<{ farmers: any[] }>('/api/admin/farmers')
  const { data: productsData } = useAdminFetch<{ data: any[] }>('/api/admin/farm-products/products?limit=500&sortBy=name&sortOrder=asc')
  const farmers = farmersData?.farmers || []
  const products = productsData?.data || []

  const empty = {
    farmerId: farmerId || '',
    productId: '',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
    harvestDate: '',
    deliveryDate: new Date().toISOString().slice(0, 10),
    batchNumber: '',
    qualityRating: '4',
    qualityNotes: '',
    paymentStatus: 'PENDING',
    paymentMethod: 'MOBILE_MONEY',
    addToStock: true,
  }
  const [v, setV] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const product = products.find((p) => p.id === v.productId)
  const total = (parseFloat(v.quantity) || 0) * (parseFloat(v.pricePerUnit) || 0)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const res = await sendJson('/api/admin/farm-supplies', 'POST', v)
      const farmer = farmers.find((f) => f.id === v.farmerId)
      if (v.addToStock) {
        await sendJson(`/api/admin/farm-products/products/${v.productId}/restock`, 'POST', {
          quantity: parseFloat(v.quantity),
          farmCostPerUnit: parseFloat(v.pricePerUnit) || undefined,
          supplier: farmer?.businessName || farmer?.name,
          notes: `Farm supply batch ${res.data?.batchNumber || ''}`.trim(),
        })
      }
      setMessage(`Recorded batch ${res.data?.batchNumber}${v.addToStock ? ' and added to stock' : ''}.`)
      setV({ ...empty, farmerId: v.farmerId })
      onSaved?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not record supply')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Farmer" required>
          <select required className={inputClass} value={v.farmerId} onChange={(e) => setV({ ...v, farmerId: e.target.value })}>
            <option value="">Select farmer</option>
            {farmers.map((f) => (
              <option key={f.id} value={f.id}>
                {f.businessName || f.name} — {f.village || f.region}
                {f.isVerified ? '' : ' (unverified)'}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Product" required>
          <select
            required
            className={inputClass}
            value={v.productId}
            onChange={(e) => {
              const p = products.find((x) => x.id === e.target.value)
              setV({ ...v, productId: e.target.value, unit: p?.stockUnit || v.unit })
            }}
          >
            <option value="">Select product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Quantity" required>
          <div className="flex gap-2">
            <input required type="number" min="0" step="any" className={inputClass} value={v.quantity} onChange={(e) => setV({ ...v, quantity: e.target.value })} />
            <input className={`${inputClass} w-24`} value={v.unit} onChange={(e) => setV({ ...v, unit: e.target.value })} aria-label="Unit" />
          </div>
        </Field>
        <Field label="Price paid per unit (XAF)" hint={total ? `Total ${Math.round(total).toLocaleString('fr-FR')} XAF` : undefined}>
          <input type="number" min="0" className={inputClass} value={v.pricePerUnit} onChange={(e) => setV({ ...v, pricePerUnit: e.target.value })} />
        </Field>
        <Field label="Harvest date">
          <input type="date" className={inputClass} value={v.harvestDate} onChange={(e) => setV({ ...v, harvestDate: e.target.value })} />
        </Field>
        <Field label="Received on">
          <input type="date" className={inputClass} value={v.deliveryDate} onChange={(e) => setV({ ...v, deliveryDate: e.target.value })} />
        </Field>
        <Field label="Batch number" hint="Leave empty to generate one from the SKU and date">
          <input className={inputClass} value={v.batchNumber} onChange={(e) => setV({ ...v, batchNumber: e.target.value })} />
        </Field>
        <Field label="Quality (1–5)" hint="2 or lower sends the batch to quality check">
          <select className={inputClass} value={v.qualityRating} onChange={(e) => setV({ ...v, qualityRating: e.target.value })}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {'★'.repeat(n)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Payment">
          <select className={inputClass} value={v.paymentStatus} onChange={(e) => setV({ ...v, paymentStatus: e.target.value })}>
            <option value="PENDING">Not yet paid</option>
            <option value="PAID">Paid in full</option>
          </select>
        </Field>
        <Field label="Payment method">
          <select className={inputClass} value={v.paymentMethod} onChange={(e) => setV({ ...v, paymentMethod: e.target.value })}>
            <option value="MOBILE_MONEY">Mobile money</option>
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank transfer</option>
          </select>
        </Field>
        <Field label="Quality notes" className="md:col-span-2">
          <input className={inputClass} value={v.qualityNotes} onChange={(e) => setV({ ...v, qualityNotes: e.target.value })} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={v.addToStock} onChange={(e) => setV({ ...v, addToStock: e.target.checked })} />
        Add to {product ? product.name : 'product'} stock (pre-orders are filled first)
      </label>
      {error && <ErrorNote message={error} />}
      {message && <p className="text-sm text-primary-700">{message}</p>}
      <PrimaryButton type="submit" loading={saving}>
        Record supply
      </PrimaryButton>
    </form>
  )
}
