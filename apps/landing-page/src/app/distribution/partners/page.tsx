import type { Metadata } from 'next'
import Link from 'next/link'
import { Hotel, School, Store, UtensilsCrossed, Sprout, ArrowRight, Truck, BadgePercent, FileCheck2, PhoneCall, CalendarClock, ShieldCheck } from 'lucide-react'
import { PageShell, PageHero, Section, FeatureGrid, CtaBand } from '@/components/marketing'

export const metadata: Metadata = {
  title: 'B2B Partners | SuberFood',
  description: 'Wholesale food supply for restaurants, hotels, schools and retailers — and a reliable market for Cameroonian farmers.',
}

const buyers = [
  { icon: UtensilsCrossed, title: 'Restaurants & caterers' },
  { icon: Hotel, title: 'Hotels & guest houses' },
  { icon: School, title: 'Schools, hospitals & canteens' },
  { icon: Store, title: 'Supermarkets & shops' },
]

const benefits = [
  { icon: BadgePercent, title: 'Wholesale pricing', description: 'Bulk prices per basket, crate, bag or carton — cheaper per unit as volumes grow.' },
  { icon: CalendarClock, title: 'Scheduled supply', description: 'Weekly or daily standing orders so your kitchen or shelves are never empty.' },
  { icon: Truck, title: 'Delivered by us', description: 'Our own delivery team, with cold handling for fish, meat and dairy.' },
  { icon: ShieldCheck, title: 'Consistent quality', description: 'Graded produce and processed products from farms we control or verify.' },
  { icon: FileCheck2, title: 'Invoices & records', description: 'Clear invoices and a full record of what you received and where it came from.' },
  { icon: PhoneCall, title: 'A named contact', description: 'One account manager who knows your business.' },
]

const paths = [
  {
    icon: Store,
    title: 'Buy wholesale',
    description: 'Supply for your restaurant, hotel, school or shop at bulk prices.',
    href: '/distribution/partners/wholesale',
    cta: 'Request a quote',
  },
  {
    icon: Sprout,
    title: 'Supply as a farmer',
    description: 'Sell your harvest or livestock to SuberFood — collected and paid on time.',
    href: '/distribution/partners/partnerships',
    cta: 'Apply as supplier',
  },
]

export default function PartnersPage() {
  return (
    <PageShell>
      <PageHero
        tone="purple"
        eyebrow="B2B Partners"
        title="A reliable food partner for your business"
        description="Whether you buy food in volume or grow it, SuberFood connects you to a traceable supply chain that runs from farm to delivery."
      >
        <Link
          href="/distribution/partners/wholesale"
          className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 font-semibold text-violet-800 hover:bg-violet-50"
        >
          Request a wholesale quote
        </Link>
        <Link
          href="/distribution/partners/partnerships"
          className="inline-flex items-center justify-center rounded-lg border-2 border-white px-8 py-3 font-semibold text-white hover:bg-white/10"
        >
          I am a farmer
        </Link>
      </PageHero>

      <Section>
        <div className="grid md:grid-cols-2 gap-6">
          {paths.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group flex gap-6 rounded-xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-premium-lg transition-all"
            >
              <div className="w-14 h-14 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center flex-shrink-0">
                <p.icon className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">{p.title}</h2>
                <p className="text-gray-600 mb-4">{p.description}</p>
                <span className="inline-flex items-center gap-1 font-semibold text-violet-700 group-hover:gap-2 transition-all">
                  {p.cta} <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section muted eyebrow="Who we supply" title="Built for businesses that feed people">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {buyers.map((b) => (
            <div key={b.title} className="rounded-xl bg-white border border-gray-100 p-6 text-center shadow-sm">
              <b.icon className="w-8 h-8 text-violet-700 mx-auto mb-3" />
              <p className="font-semibold text-gray-900">{b.title}</p>
            </div>
          ))}
        </div>
        <FeatureGrid features={benefits} tone="purple" />
      </Section>

      <CtaBand
        title="Let us quote your weekly supply"
        description="Tell us what you buy today — we will come back with prices and a delivery schedule."
        primary={{ label: 'Get a quote', href: '/distribution/partners/wholesale' }}
        secondary={{ label: 'Talk to our team', href: '/distribution/partners/contact' }}
      />
    </PageShell>
  )
}
