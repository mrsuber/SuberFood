'use client'

import { useState } from 'react'
import { Mail, Phone, Building2, MapPin, MessageCircle, Inbox, Clock, CheckCircle } from 'lucide-react'
import {
  Panel,
  StatCard,
  StatusPill,
  Loading,
  EmptyState,
  ErrorNote,
  inputClass,
  useAdminFetch,
  sendJson,
  humanize,
} from '@/components/admin/ui'

export const INQUIRY_TYPES = [
  'GENERAL',
  'SUPPORT',
  'WHOLESALE',
  'PARTNERSHIP',
  'FARMER_SUPPLY',
  'RESTAURANT',
  'EVENTS',
  'CAREERS',
  'PRESS',
]
const STATUSES = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'ARCHIVED']

interface Inquiry {
  id: string
  type: string
  status: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  city: string | null
  subject: string | null
  message: string
  details: Record<string, string> | null
  sourcePage: string | null
  adminNotes: string | null
  createdAt: string
}

/** Inbox for leads captured by public forms. `types` limits it to a subset (e.g. B2B). */
export function InquiryInbox({ types }: { types?: string[] }) {
  const [type, setType] = useState(types?.length === 1 ? types[0] : 'all')
  const [status, setStatus] = useState('NEW')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState('')

  const params = new URLSearchParams({ status, ...(type !== 'all' ? { type } : {}), ...(search ? { search } : {}) })
  const { data, loading, error, reload } = useAdminFetch<{ data: Inquiry[]; stats: { byStatus: Record<string, number>; byType: Record<string, number> } }>(
    `/api/admin/inquiries?${params}`
  )

  const visible = (data?.data || []).filter((i) => !types || types.includes(i.type))
  const selected = visible.find((i) => i.id === selectedId) || null
  const typeOptions = types || INQUIRY_TYPES

  const update = async (id: string, body: { status?: string; adminNotes?: string }) => {
    setSaving(true)
    try {
      await sendJson(`/api/admin/inquiries/${id}`, 'PATCH', body)
      reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const select = (inq: Inquiry) => {
    setSelectedId(inq.id)
    setNotes(inq.adminNotes || '')
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="New" value={data?.stats.byStatus.NEW ?? '—'} icon={Inbox} tone="blue" />
        <StatCard label="In progress" value={data?.stats.byStatus.IN_PROGRESS ?? '—'} icon={Clock} tone="amber" />
        <StatCard label="Resolved" value={data?.stats.byStatus.RESOLVED ?? '—'} icon={CheckCircle} />
        <StatCard
          label="B2B & farmer leads"
          value={
            data ? (data.stats.byType.WHOLESALE || 0) + (data.stats.byType.PARTNERSHIP || 0) + (data.stats.byType.FARMER_SUPPLY || 0) : '—'
          }
          icon={Building2}
          tone="gray"
        />
      </div>

      <Panel>
        <div className="flex flex-wrap gap-3">
          <select className={`${inputClass} w-auto`} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {humanize(s)}
              </option>
            ))}
          </select>
          {typeOptions.length > 1 && (
            <select className={`${inputClass} w-auto`} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">All types</option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {humanize(t)}
                </option>
              ))}
            </select>
          )}
          <input
            className={`${inputClass} flex-1 min-w-[200px]`}
            placeholder="Search name, email, phone, company or message"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Panel>

      {error && <ErrorNote message={error} />}

      <div className="grid lg:grid-cols-5 gap-6">
        <Panel className="lg:col-span-2" title={`${visible.length} inquiries`}>
          {loading ? (
            <Loading />
          ) : visible.length === 0 ? (
            <EmptyState title="Nothing here" description="New messages from the website's forms appear here." />
          ) : (
            <ul className="-m-6 divide-y divide-gray-100">
              {visible.map((inq) => (
                <li key={inq.id}>
                  <button
                    onClick={() => select(inq)}
                    className={`w-full text-left px-6 py-4 hover:bg-gray-50 ${selectedId === inq.id ? 'bg-primary-50/60' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-medium text-gray-900 truncate">{inq.company || inq.name}</span>
                      <StatusPill value={inq.status} />
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      {humanize(inq.type)} · {new Date(inq.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2">{inq.subject || inq.message}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel className="lg:col-span-3" title={selected ? selected.subject || humanize(selected.type) : 'Details'}>
          {!selected ? (
            <p className="text-sm text-gray-500">Select an inquiry to see the full message and reply.</p>
          ) : (
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <p className="font-semibold text-gray-900 sm:col-span-2">{selected.name}</p>
                {selected.company && <p className="flex gap-2 text-gray-700"><Building2 className="w-4 h-4" /> {selected.company}</p>}
                {selected.city && <p className="flex gap-2 text-gray-700"><MapPin className="w-4 h-4" /> {selected.city}</p>}
                {selected.phone && (
                  <a href={`tel:${selected.phone.replace(/\s/g, '')}`} className="flex gap-2 text-primary-700 hover:underline">
                    <Phone className="w-4 h-4" /> {selected.phone}
                  </a>
                )}
                {selected.phone && (
                  <a
                    href={`https://wa.me/${selected.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-2 text-primary-700 hover:underline"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                )}
                {selected.email && (
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject || 'Your message to SuberFood'}`)}`}
                    className="flex gap-2 text-primary-700 hover:underline"
                  >
                    <Mail className="w-4 h-4" /> {selected.email}
                  </a>
                )}
              </div>

              {selected.details && Object.keys(selected.details).length > 0 && (
                <dl className="grid sm:grid-cols-2 gap-3 rounded-lg bg-gray-50 p-4 text-sm">
                  {Object.entries(selected.details).map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs text-gray-500">{k}</dt>
                      <dd className="font-medium text-gray-900">{String(v)}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <p className="whitespace-pre-line text-gray-800 leading-relaxed">{selected.message}</p>
              {selected.sourcePage && <p className="text-xs text-gray-400">Sent from {selected.sourcePage}</p>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Internal notes</label>
                <textarea className={inputClass} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
                <button
                  onClick={() => update(selected.id, { adminNotes: notes })}
                  disabled={saving}
                  className="mt-2 text-sm font-semibold text-primary-700 hover:underline disabled:opacity-50"
                >
                  Save notes
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                {STATUSES.filter((s) => s !== selected.status).map((s) => (
                  <button
                    key={s}
                    onClick={() => update(selected.id, { status: s })}
                    disabled={saving}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Mark {humanize(s).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
