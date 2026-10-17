import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  Sprout,
  Factory,
  Truck,
  UtensilsCrossed,
  QrCode,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
} from 'lucide-react'
import { Navbar } from '@/components/navigation/Navbar'
import { Footer } from '@/components/navigation/Footer'
import { cn } from '@/lib/utils'
import { site, whatsappLink } from '@/lib/site'

// Tailwind only generates classes it can see as full strings, so colour
// variants are spelled out here instead of being built with template literals.
export const tones = {
  green: {
    hero: 'from-primary-700 to-primary-900',
    soft: 'bg-primary-50',
    icon: 'bg-primary-100 text-primary-700',
    text: 'text-primary-700',
    dot: 'bg-primary-500',
    heroText: 'text-primary-100',
  },
  blue: {
    hero: 'from-sky-700 to-blue-900',
    soft: 'bg-sky-50',
    icon: 'bg-sky-100 text-sky-700',
    text: 'text-sky-700',
    dot: 'bg-sky-500',
    heroText: 'text-sky-100',
  },
  amber: {
    hero: 'from-amber-600 to-orange-800',
    soft: 'bg-amber-50',
    icon: 'bg-amber-100 text-amber-700',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    heroText: 'text-amber-100',
  },
  red: {
    hero: 'from-rose-700 to-red-900',
    soft: 'bg-rose-50',
    icon: 'bg-rose-100 text-rose-700',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
    heroText: 'text-rose-100',
  },
  indigo: {
    hero: 'from-indigo-700 to-indigo-900',
    soft: 'bg-indigo-50',
    icon: 'bg-indigo-100 text-indigo-700',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500',
    heroText: 'text-indigo-100',
  },
  purple: {
    hero: 'from-violet-700 to-purple-900',
    soft: 'bg-violet-50',
    icon: 'bg-violet-100 text-violet-700',
    text: 'text-violet-700',
    dot: 'bg-violet-500',
    heroText: 'text-violet-100',
  },
  slate: {
    hero: 'from-gray-800 to-gray-950',
    soft: 'bg-gray-50',
    icon: 'bg-gray-100 text-gray-700',
    text: 'text-gray-700',
    dot: 'bg-gray-500',
    heroText: 'text-gray-300',
  },
} as const

export type Tone = keyof typeof tones

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white">{children}</main>
      <Footer />
    </>
  )
}

export function PageHero({
  eyebrow,
  title,
  description,
  tone = 'green',
  children,
  breadcrumbs,
}: {
  eyebrow?: string
  title: string
  description?: string
  tone?: Tone
  children?: React.ReactNode
  breadcrumbs?: { name: string; href: string }[]
}) {
  const t = tones[tone]
  return (
    <section className={cn('bg-gradient-to-br text-white', t.hero)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className={cn('text-sm mb-6 flex flex-wrap items-center gap-2', t.heroText)}>
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden>/</span>}
                <Link href={crumb.href} className="hover:text-white transition-colors">
                  {crumb.name}
                </Link>
              </span>
            ))}
          </nav>
        )}
        {eyebrow && (
          <p className={cn('text-sm font-semibold uppercase tracking-wider mb-4', t.heroText)}>{eyebrow}</p>
        )}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6 max-w-4xl text-balance">
          {title}
        </h1>
        {description && <p className={cn('text-lg sm:text-xl max-w-3xl', t.heroText)}>{description}</p>}
        {children && <div className="mt-8 flex flex-col sm:flex-row gap-4">{children}</div>}
      </div>
    </section>
  )
}

export function Section({
  title,
  subtitle,
  eyebrow,
  children,
  muted = false,
  className,
  center = true,
}: {
  title?: string
  subtitle?: string
  eyebrow?: string
  children: React.ReactNode
  muted?: boolean
  className?: string
  center?: boolean
}) {
  return (
    <section className={cn('py-16 sm:py-20', muted ? 'bg-gray-50' : 'bg-white', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className={cn('mb-12', center && 'text-center')}>
            {eyebrow && (
              <p className="text-sm font-semibold uppercase tracking-wider text-primary-600 mb-3">{eyebrow}</p>
            )}
            {title && (
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4 text-balance">{title}</h2>
            )}
            {subtitle && (
              <p className={cn('text-lg text-gray-600 max-w-3xl', center && 'mx-auto')}>{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}

export interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

export function FeatureGrid({
  features,
  tone = 'green',
  columns = 3,
}: {
  features: Feature[]
  tone?: Tone
  columns?: 2 | 3 | 4
}) {
  const t = tones[tone]
  const cols = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-2 lg:grid-cols-3', 4: 'md:grid-cols-2 lg:grid-cols-4' }[columns]
  return (
    <div className={cn('grid grid-cols-1 gap-6', cols)}>
      {features.map((f) => (
        <div key={f.title} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center mb-4', t.icon)}>
            <f.icon className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-lg text-gray-900 mb-2">{f.title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{f.description}</p>
        </div>
      ))}
    </div>
  )
}

export function StatBand({ stats, tone = 'green' }: { stats: { value: string; label: string }[]; tone?: Tone }) {
  const t = tones[tone]
  return (
    <div className="bg-white border-y border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <div className={cn('text-3xl sm:text-4xl font-display font-bold mb-1', t.text)}>{s.value}</div>
            <div className="text-gray-600 text-sm">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CtaBand({
  title,
  description,
  primary,
  secondary,
}: {
  title: string
  description?: string
  primary: { label: string; href: string }
  secondary?: { label: string; href: string }
}) {
  return (
    <section className="bg-gradient-to-r from-primary-600 to-primary-800 py-16 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4 text-balance">{title}</h2>
        {description && <p className="text-lg text-primary-100 mb-8">{description}</p>}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={primary.href}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-3 font-semibold text-primary-700 hover:bg-primary-50 transition-colors"
          >
            {primary.label}
            <ArrowRight className="w-4 h-4" />
          </Link>
          {secondary && (
            <Link
              href={secondary.href}
              className="inline-flex items-center justify-center rounded-lg border-2 border-white px-8 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
            >
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}

const chainSteps = [
  { icon: Sprout, title: 'Farm', description: 'Fish ponds, poultry, livestock and crop fields — ours and partner farmers.', href: '/farming' },
  { icon: Factory, title: 'Process', description: 'Sardine, milk, meat and vegetable lines with batch-level records.', href: '/processing' },
  { icon: Truck, title: 'Deliver', description: 'Tracked deliveries and pickup points across our delivery zones.', href: '/track-order' },
  { icon: UtensilsCrossed, title: 'Serve', description: 'Our restaurants, the online farm shop, and B2B supply.', href: '/distribution' },
  { icon: QrCode, title: 'Trace', description: 'Every order carries a tracking code back through its journey.', href: '/sustainability' },
]

// The core story of the business: one connected chain we own end to end.
export function ValueChain() {
  return (
    <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {chainSteps.map((step, i) => (
        <li key={step.title} className="relative">
          <Link
            href={step.href}
            className="group block h-full rounded-xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-premium hover:-translate-y-1 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                <step.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-gray-400">0{i + 1}</span>
            </div>
            <h3 className="font-display font-semibold text-lg text-gray-900 mb-2 group-hover:text-primary-700">
              {step.title}
            </h3>
            <p className="text-sm text-gray-600">{step.description}</p>
          </Link>
          {i < chainSteps.length - 1 && (
            <ArrowRight
              aria-hidden
              className="hidden lg:block absolute top-1/2 -right-3.5 -translate-y-1/2 w-5 h-5 text-primary-300 z-10"
            />
          )}
        </li>
      ))}
    </ol>
  )
}

export function Prose({ children, updated }: { children: React.ReactNode; updated?: string }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {updated && <p className="text-sm text-gray-500 mb-8">Last updated: {updated}</p>}
      <div className="space-y-6 text-gray-700 leading-relaxed [&_h2]:text-2xl [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-10 [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mt-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_a]:text-primary-700 [&_a]:underline">
        {children}
      </div>
    </div>
  )
}

export function FaqList({ items }: { items: { q: string; a: React.ReactNode }[] }) {
  return (
    <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
      {items.map((item) => (
        <details key={item.q} className="group p-6 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-gray-900">
            {item.q}
            <span className="text-primary-600 text-xl transition-transform group-open:rotate-45" aria-hidden>
              +
            </span>
          </summary>
          <div className="mt-4 text-gray-600 leading-relaxed">{item.a}</div>
        </details>
      ))}
    </div>
  )
}

export function ContactDetails({ email, note }: { email?: string; note?: string }) {
  const wa = whatsappLink()
  const items = [
    { icon: Phone, label: 'Phone', value: site.contact.phone, href: `tel:${site.contact.phone.replace(/\s/g, '')}` },
    ...(wa ? [{ icon: MessageCircle, label: 'WhatsApp', value: 'Chat with us', href: wa }] : []),
    { icon: Mail, label: 'Email', value: email || site.contact.email, href: `mailto:${email || site.contact.email}` },
    { icon: MapPin, label: 'Address', value: `${site.contact.address}, ${site.contact.city}, ${site.country}` },
    { icon: Clock, label: 'Hours', value: site.contact.hours },
  ]
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-200 p-6 space-y-5">
      {items.map((item) => (
        <div key={item.label} className="flex gap-4">
          <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 text-primary-700 flex items-center justify-center flex-shrink-0">
            <item.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{item.label}</p>
            {item.href ? (
              <a href={item.href} className="font-medium text-gray-900 hover:text-primary-700">
                {item.value}
              </a>
            ) : (
              <p className="font-medium text-gray-900">{item.value}</p>
            )}
          </div>
        </div>
      ))}
      {note && <p className="text-sm text-gray-500 border-t border-gray-200 pt-4">{note}</p>}
    </div>
  )
}
