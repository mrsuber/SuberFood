import type { Metadata } from 'next'
import Link from 'next/link'
import { ShoppingBag, Building2, Handshake, ArrowRight, Truck, Smartphone, MapPin, Wallet, PackageCheck, CalendarClock } from 'lucide-react'
import { PageShell, PageHero, Section, FeatureGrid, CtaBand, tones, type Tone } from '@/components/marketing'
import { cn } from '@/lib/utils'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Distribution | SuberFood',
  description: 'How SuberFood food reaches you: the online farm shop, our restaurants and wholesale supply for businesses.',
}

const channels: {
  icon: typeof ShoppingBag
  tone: Tone
  title: string
  description: string
  href: string
  features: string[]
  cta: string
}[] = [
  {
    icon: ShoppingBag,
    tone: 'green',
    title: 'Farm Shop',
    description: 'Order fresh produce, fish, meat, eggs and dairy online — retail or bulk — delivered or ready for pickup.',
    href: '/distribution/farm-products',
    features: ['Retail & bulk prices', 'Pre-order upcoming harvests', 'Mobile money & wallet', 'Live delivery tracking'],
    cta: 'Shop now',
  },
  {
    icon: Building2,
    tone: 'amber',
    title: 'Restaurants',
    description: 'Dishes cooked with ingredients from our own farms. Dine in, take away or order delivery.',
    href: '/distribution/restaurants',
    features: ['Farm-to-table menus', 'Dine-in, takeaway, delivery', 'Table reservations', 'Private events'],
    cta: 'See restaurants',
  },
  {
    icon: Handshake,
    tone: 'purple',
    title: 'B2B Partners',
    description: 'Wholesale supply for restaurants, hotels, schools, supermarkets and caterers — and a market for farmers.',
    href: '/distribution/partners',
    features: ['Wholesale pricing', 'Scheduled deliveries', 'Consistent quality', 'Farmer supply program'],
    cta: 'Partner with us',
  },
]

const strengths = [
  { icon: Truck, title: 'Our own deliveries', description: 'Our drivers deliver within set delivery zones with clear, fixed fees.' },
  { icon: PackageCheck, title: 'Track every order', description: 'A tracking code shows status, driver and live location.' },
  { icon: Smartphone, title: 'Mobile money', description: 'Pay with MTN Mobile Money or Orange Money in a few taps.' },
  { icon: Wallet, title: 'SuberFood wallet', description: 'Keep a balance, receive refunds and referral rewards instantly.' },
  { icon: CalendarClock, title: 'Pre-orders', description: 'Book out-of-stock items; we confirm the price before you commit.' },
  { icon: MapPin, title: 'Pickup option', description: `Collect from our distribution center in ${site.contact.city}.` },
]

export default function DistributionPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Distribution"
        title="Three ways our food reaches you"
        description="The last step of our chain is the one you see. Whether you shop online, eat at our restaurants or buy for your business, it is the same traceable food from the same farms."
      />

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {channels.map((c) => {
            const t = tones[c.tone]
            return (
              <Link
                key={c.title}
                href={c.href}
                className="group rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-premium-lg transition-all overflow-hidden"
              >
                <div className={cn('p-8 h-full bg-gradient-to-br to-white', t.soft)}>
                  <div className={cn('w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform', t.icon)}>
                    <c.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">{c.title}</h3>
                  <p className="text-gray-600 mb-6">{c.description}</p>
                  <ul className="space-y-2 mb-6">
                    {c.features.map((f) => (
                      <li key={f} className="flex items-center text-sm text-gray-700">
                        <span className={cn('w-1.5 h-1.5 rounded-full mr-2', t.dot)} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <span className={cn('inline-flex items-center font-semibold gap-1 group-hover:gap-2 transition-all', t.text)}>
                    {c.cta} <ArrowRight className="w-5 h-5" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </Section>

      <Section muted eyebrow="Built for Cameroon" title="Ordering that fits how you live">
        <FeatureGrid features={strengths} />
      </Section>

      <CtaBand
        title="Fresh food, delivered the SuberFood way"
        primary={{ label: 'Shop the farm', href: '/distribution/farm-products' }}
        secondary={{ label: 'Visit our restaurants', href: '/distribution/restaurants' }}
      />
    </PageShell>
  )
}
