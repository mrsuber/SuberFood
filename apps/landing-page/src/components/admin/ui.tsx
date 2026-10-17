'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowLeft, ArrowRight, Construction, Inbox, Loader2 } from 'lucide-react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { cn } from '@/lib/utils'

export function AdminPage({
  title,
  description,
  back,
  actions,
  children,
}: {
  title: string
  description?: string
  back?: { label: string; href: string }
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <AdminHeader title={title} />
      <div className="p-8 space-y-6">
        {(back || description || actions) && (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              {back && (
                <Link href={back.href} className="inline-flex items-center gap-1 text-sm text-primary-700 hover:underline mb-2">
                  <ArrowLeft className="w-4 h-4" /> {back.label}
                </Link>
              )}
              {description && <p className="text-gray-600 max-w-3xl">{description}</p>}
            </div>
            {actions && <div className="flex gap-3">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export function Panel({ title, children, className, actions }: { title?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 shadow-sm', className)}>
      {title && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          {actions}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}

export function StatCard({ label, value, icon: Icon, tone = 'green' }: { label: string; value: React.ReactNode; icon?: LucideIcon; tone?: 'green' | 'amber' | 'red' | 'blue' | 'gray' }) {
  const toneClass = {
    green: 'bg-primary-50 text-primary-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    blue: 'bg-sky-50 text-sky-700',
    gray: 'bg-gray-100 text-gray-700',
  }[tone]
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
      {Icon && (
        <div className={cn('w-11 h-11 rounded-lg flex items-center justify-center', toneClass)}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

export function StatusPill({ value, map }: { value: string; map?: Record<string, string> }) {
  const defaults: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    OPERATIONAL: 'bg-green-100 text-green-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    RESOLVED: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    NEW: 'bg-sky-100 text-sky-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-amber-100 text-amber-800',
    SEATED: 'bg-blue-100 text-blue-800',
    ON_LEAVE: 'bg-amber-100 text-amber-800',
    MAINTENANCE_REQUIRED: 'bg-amber-100 text-amber-800',
    UNDER_MAINTENANCE: 'bg-orange-100 text-orange-800',
    INACTIVE: 'bg-gray-100 text-gray-700',
    ARCHIVED: 'bg-gray-100 text-gray-700',
    RETIRED: 'bg-gray-100 text-gray-700',
    CANCELLED: 'bg-red-100 text-red-800',
    NO_SHOW: 'bg-red-100 text-red-800',
    SUSPENDED: 'bg-red-100 text-red-800',
    TERMINATED: 'bg-red-100 text-red-800',
    OUT_OF_SERVICE: 'bg-red-100 text-red-800',
  }
  const cls = map?.[value] || defaults[value] || 'bg-gray-100 text-gray-700'
  return <span className={cn('inline-block px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap', cls)}>{humanize(value)}</span>
}

export const humanize = (value: string) =>
  value ? value.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : ''

export function Loading() {
  return (
    <div className="flex justify-center py-16">
      <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
    </div>
  )
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: { label: string; href: string } }) {
  return (
    <div className="text-center py-12">
      <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p className="font-semibold text-gray-900">{title}</p>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      {action && (
        <Link href={action.href} className="inline-block mt-4 text-sm font-semibold text-primary-700 hover:underline">
          {action.label} →
        </Link>
      )}
    </div>
  )
}

export function ErrorNote({ message }: { message: string }) {
  return <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
}

export const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30'

export function Field({ label, required, hint, children, className }: { label: string; required?: boolean; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {hint && <span className="block text-xs text-gray-500 mt-1">{hint}</span>}
    </label>
  )
}

export function PrimaryButton({ children, loading, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60',
        className
      )}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}

export function LinkButton({ href, children, variant = 'primary' }: { href: string; children: React.ReactNode; variant?: 'primary' | 'outline' }) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors',
        variant === 'primary' ? 'bg-primary-600 text-white hover:bg-primary-700' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
      )}
    >
      {children}
    </Link>
  )
}

/** Small JSON fetch hook for admin pages. `url` null skips the request. */
export function useAdminFetch<T = any>(url: string | null, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(!!url)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!url) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(url)
      .then(async (res) => {
        const json = await res.json().catch(() => ({}))
        if (!res.ok || json.success === false) throw new Error(json.error || json.message || `Request failed (${res.status})`)
        return json
      })
      .then((json) => !cancelled && setData(json))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, tick, ...deps])

  return { data, loading, error, reload: () => setTick((t) => t + 1) }
}

export async function sendJson(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.success === false) throw new Error(json.error || json.message || `Request failed (${res.status})`)
  return json
}

/** Group a list by restaurant for the "By Location" views. */
export function groupByRestaurant<T extends { restaurant?: { id: string; name: string; city?: string } | null }>(items: T[]) {
  const groups = new Map<string, { name: string; city?: string; items: T[] }>()
  for (const item of items) {
    const key = item.restaurant?.id || 'none'
    if (!groups.has(key)) groups.set(key, { name: item.restaurant?.name || 'Unassigned', city: item.restaurant?.city, items: [] })
    groups.get(key)!.items.push(item)
  }
  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Placeholder for admin modules on the roadmap that have no data model yet.
 * Explains what is planned and links to what already works today.
 */
export function PlannedModule({
  title,
  phase,
  summary,
  planned,
  today,
}: {
  title: string
  phase: string
  summary: string
  planned: string[]
  today?: { label: string; href: string; description: string }[]
}) {
  return (
    <AdminPage title={title}>
      <div className="grid lg:grid-cols-3 gap-6">
        <Panel className="lg:col-span-2">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <Construction className="w-6 h-6" />
            </div>
            <div>
              <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 mb-2">{phase}</span>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">This module is on the roadmap</h2>
              <p className="text-gray-600 mb-6">{summary}</p>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">What it will do</h3>
              <ul className="grid sm:grid-cols-2 gap-2">
                {planned.map((p) => (
                  <li key={p} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-primary-600">•</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Panel>
        {today && today.length > 0 && (
          <Panel title="Available today">
            <ul className="space-y-3">
              {today.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="group block rounded-lg border border-gray-100 p-3 hover:border-primary-300 hover:bg-primary-50/40">
                    <span className="flex items-center justify-between font-medium text-gray-900">
                      {t.label} <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
                    </span>
                    <span className="text-xs text-gray-500">{t.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>
    </AdminPage>
  )
}
