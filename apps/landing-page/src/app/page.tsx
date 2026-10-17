import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle,
  Leaf,
  ShieldCheck,
  Users,
  Smartphone,
  ShoppingBasket,
  Truck,
  PackageCheck,
  Building2,
  Handshake,
  Sprout,
  CalendarCheck,
} from 'lucide-react'
import { Navbar } from '@/components/navigation/Navbar'
import { Footer } from '@/components/navigation/Footer'
import { Button } from '@/components/ui/button'
import { Section, ValueChain, CtaBand } from '@/components/marketing'
import { FeaturedProducts } from '@/components/marketing/FeaturedProducts'
import { site } from '@/lib/site'

const reasons = [
  {
    icon: CheckCircle,
    title: 'Traceable by design',
    description: 'Every order gets a tracking code. Our systems record which farm, which batch and which driver.',
  },
  {
    icon: Leaf,
    title: 'Fresher, because it is ours',
    description: 'We grow, process and deliver ourselves — fewer middlemen means less time between harvest and your kitchen.',
  },
  {
    icon: ShieldCheck,
    title: 'Fair, verified pricing',
    description: 'Clear prices in XAF, bulk discounts for families and businesses, and pre-orders confirmed before you pay.',
  },
  {
    icon: Users,
    title: 'Built with local farmers',
    description: 'We buy from verified smallholder farmers across Cameroon and pay them on time, every time.',
  },
]

const howItWorks = [
  { icon: ShoppingBasket, title: 'Choose', description: 'Shop retail or bulk quantities, or pre-order items that are about to be harvested.' },
  { icon: Smartphone, title: 'Pay your way', description: 'MTN Mobile Money, Orange Money, your SuberFood wallet or cash on delivery.' },
  { icon: Truck, title: 'Get it delivered', description: `Home delivery across our zones in ${site.serviceCities.slice(0, 3).join(', ')} and beyond — or pick up.` },
  { icon: PackageCheck, title: 'Track it', description: 'Follow your order from our warehouse to your door with live delivery tracking.' },
]

const audiences = [
  {
    icon: ShoppingBasket,
    title: 'Families',
    description: 'Fresh produce, fish, poultry and dairy delivered to your door.',
    cta: 'Shop the farm',
    href: '/distribution/farm-products',
  },
  {
    icon: CalendarCheck,
    title: 'Diners',
    description: 'Eat at our restaurants, order takeaway, or book a table.',
    cta: 'Find a restaurant',
    href: '/distribution/restaurants',
  },
  {
    icon: Building2,
    title: 'Businesses',
    description: 'Restaurants, hotels, schools and shops: reliable wholesale supply.',
    cta: 'Wholesale supply',
    href: '/distribution/partners/wholesale',
  },
  {
    icon: Sprout,
    title: 'Farmers',
    description: 'Sell your harvest to a buyer who pays fairly and picks up.',
    cta: 'Become a supplier',
    href: '/distribution/partners/partnerships',
  },
]

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-emerald-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-semibold text-primary-800 mb-6">
                <Leaf className="w-4 h-4" /> Farm-to-table, made in {site.country}
              </p>
              <h1 className="text-5xl sm:text-6xl font-display font-bold text-gray-900 mb-6 text-balance animate-fade-in">
                From our farms
                <span className="text-primary-600 block">to your table.</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-xl">
                {site.name} grows, processes and delivers the food it sells — fish, poultry, meat, dairy
                and fresh produce — so you always know where your food comes from.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/distribution/farm-products">
                  <Button size="lg" className="group w-full sm:w-auto">
                    Shop fresh produce
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/distribution/restaurants">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Find a restaurant
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                {site.paymentMethods.map((m) => (
                  <span key={m} className="inline-flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-primary-600" /> {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Journey card — the product promise at a glance */}
            <div className="relative">
              <div className="rounded-2xl bg-white shadow-premium-lg border border-primary-100 p-6 sm:p-8">
                <p className="text-sm font-semibold text-gray-500 mb-1">Example order journey</p>
                <p className="font-display font-bold text-xl text-gray-900 mb-6">Fresh tilapia, 2 kg</p>
                <ol className="space-y-5">
                  {[
                    { t: 'Harvested', d: 'SuberFood fish ponds — batch recorded', done: true },
                    { t: 'Cleaned & packed', d: 'Processing line, cold-chain storage', done: true },
                    { t: 'Out for delivery', d: 'Driver assigned, live location shared', done: true },
                    { t: 'Delivered', d: 'Confirmed at your door', done: false },
                  ].map((s, i) => (
                    <li key={s.t} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            s.done ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {i + 1}
                        </span>
                        {i < 3 && <span className="w-px flex-1 bg-primary-200 mt-1" />}
                      </div>
                      <div className="pb-1">
                        <p className="font-semibold text-gray-900">{s.t}</p>
                        <p className="text-sm text-gray-500">{s.d}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <Link
                  href="/track-order"
                  className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:gap-2 transition-all"
                >
                  Track a real order <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Value chain */}
        <Section
          eyebrow="One company, the whole chain"
          title="We own every step between the soil and your plate"
          subtitle="Most food changes hands five or six times before it reaches you. Ours stays with us — that is how we control freshness, quality and price."
        >
          <ValueChain />
        </Section>

        {/* Live products */}
        <Section muted>
          <FeaturedProducts />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, i) => (
              <div key={step.title} className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-white border border-primary-100 text-primary-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <step.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400">Step {i + 1}</p>
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Why */}
        <Section eyebrow="Why SuberFood" title="Food you can trust, at prices that make sense">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reasons.map((r) => (
              <div key={r.title} className="flex gap-4 rounded-xl border border-gray-100 p-6 shadow-sm">
                <r.icon className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{r.title}</h3>
                  <p className="text-gray-600">{r.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Audiences */}
        <Section muted eyebrow="Work with us" title="One platform, four ways in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {audiences.map((a) => (
              <Link
                key={a.title}
                href={a.href}
                className="group rounded-xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-premium hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center mb-4">
                  <a.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-lg text-gray-900 mb-2">{a.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{a.description}</p>
                <span className="text-sm font-semibold text-primary-700 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  {a.cta} <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </Section>

        <CtaBand
          title="Ready to eat food with a story?"
          description="Join the families and businesses who know exactly where their food comes from."
          primary={{ label: 'Start shopping', href: '/distribution/farm-products' }}
          secondary={{ label: 'For business partners', href: '/distribution/partners' }}
        />
      </main>
      <Footer />
    </>
  )
}
