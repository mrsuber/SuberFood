'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { CheckCircle, Loader2, Send } from 'lucide-react'
import { site } from '@/lib/site'

export type InquiryType =
  | 'GENERAL'
  | 'SUPPORT'
  | 'WHOLESALE'
  | 'PARTNERSHIP'
  | 'FARMER_SUPPLY'
  | 'RESTAURANT'
  | 'EVENTS'
  | 'CAREERS'
  | 'PRESS'

export interface ExtraField {
  name: string
  label: string
  type?: 'text' | 'select' | 'number'
  options?: string[]
  placeholder?: string
  required?: boolean
}

interface InquiryFormProps {
  /** Fixed inquiry type, or a list of choices shown as a "Topic" select */
  type?: InquiryType
  typeOptions?: { value: InquiryType; label: string }[]
  showCompany?: boolean
  showCity?: boolean
  showSubject?: boolean
  extraFields?: ExtraField[]
  messageLabel?: string
  messagePlaceholder?: string
  submitLabel?: string
  successTitle?: string
  successMessage?: string
}

const inputClass =
  'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30'

export function InquiryForm({
  type,
  typeOptions,
  showCompany = false,
  showCity = true,
  showSubject = false,
  extraFields = [],
  messageLabel = 'Message',
  messagePlaceholder = 'How can we help?',
  submitLabel = 'Send message',
  successTitle = 'Message received',
  successMessage = 'Thank you — our team will get back to you within one business day.',
}: InquiryFormProps) {
  const pathname = usePathname()
  const [values, setValues] = useState<Record<string, string>>({
    type: type ?? typeOptions?.[0]?.value ?? 'GENERAL',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const set = (name: string, value: string) => setValues((v) => ({ ...v, [name]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!values.email && !values.phone) {
      setError('Please give us an email address or phone number so we can reply.')
      return
    }

    setSubmitting(true)
    try {
      const details = Object.fromEntries(
        extraFields.filter((f) => values[f.name]).map((f) => [f.label, values[f.name]])
      )
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: values.type,
          name: values.name,
          email: values.email,
          phone: values.phone,
          company: values.company,
          city: values.city,
          subject: values.subject,
          message: values.message,
          website: values.website,
          details: Object.keys(details).length ? details : undefined,
          sourcePage: pathname,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Something went wrong. Please try again.')
      }
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-primary-200 bg-primary-50 p-8 text-center">
        <CheckCircle className="w-12 h-12 text-primary-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{successTitle}</h3>
        <p className="text-gray-600">{successMessage}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Honeypot field, hidden from people */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
        value={values.website || ''}
        onChange={(e) => set('website', e.target.value)}
      />

      {typeOptions && !type && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Topic</label>
          <select className={inputClass} value={values.type} onChange={(e) => set('type', e.target.value)}>
            {typeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name *</label>
          <input required className={inputClass} value={values.name || ''} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone / WhatsApp</label>
          <input
            type="tel"
            className={inputClass}
            placeholder="+237 6XX XXX XXX"
            value={values.phone || ''}
            onChange={(e) => set('phone', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            type="email"
            className={inputClass}
            value={values.email || ''}
            onChange={(e) => set('email', e.target.value)}
          />
        </div>
        {showCompany && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Business name</label>
            <input className={inputClass} value={values.company || ''} onChange={(e) => set('company', e.target.value)} />
          </div>
        )}
        {showCity && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
            <select className={inputClass} value={values.city || ''} onChange={(e) => set('city', e.target.value)}>
              <option value="">Select a city</option>
              {site.serviceCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
          </div>
        )}
        {extraFields.map((f) => (
          <div key={f.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {f.label}
              {f.required && ' *'}
            </label>
            {f.type === 'select' ? (
              <select
                required={f.required}
                className={inputClass}
                value={values[f.name] || ''}
                onChange={(e) => set(f.name, e.target.value)}
              >
                <option value="">Select…</option>
                {f.options?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={f.type || 'text'}
                required={f.required}
                placeholder={f.placeholder}
                className={inputClass}
                value={values[f.name] || ''}
                onChange={(e) => set(f.name, e.target.value)}
              />
            )}
          </div>
        ))}
        {showSubject && (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
            <input className={inputClass} value={values.subject || ''} onChange={(e) => set('subject', e.target.value)} />
          </div>
        )}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{messageLabel} *</label>
          <textarea
            required
            rows={5}
            className={inputClass}
            placeholder={messagePlaceholder}
            value={values.message || ''}
            onChange={(e) => set('message', e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-primary-600 px-8 py-3 font-semibold text-white shadow-md hover:bg-primary-700 disabled:opacity-60 transition-colors"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {submitting ? 'Sending…' : submitLabel}
      </button>
    </form>
  )
}
