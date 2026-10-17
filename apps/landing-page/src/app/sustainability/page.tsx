import type { Metadata } from 'next'
import {
  Droplets,
  Sprout,
  Recycle,
  Route,
  Snowflake,
  HandCoins,
  QrCode,
  ClipboardCheck,
  MapPinned,
} from 'lucide-react'
import { PageShell, PageHero, Section, FeatureGrid, CtaBand } from '@/components/marketing'

export const metadata: Metadata = {
  title: 'Sustainability & Traceability | SuberFood',
  description:
    'How SuberFood reduces food waste, supports farmers and makes every order traceable from farm to table.',
}

const commitments = [
  { icon: Sprout, title: 'Healthy soil', description: 'Crop rotation, composting and careful use of inputs on our fields and with partner farmers.' },
  { icon: Droplets, title: 'Water care', description: 'Monitored fish ponds and efficient irrigation so we use water carefully.' },
  { icon: Recycle, title: 'Less waste', description: 'Pre-orders and booking let us harvest to demand, and surplus goes to processing instead of the bin.' },
  { icon: Route, title: 'Shorter journeys', description: 'Local sourcing and planned delivery routes mean fewer kilometres per kilogram.' },
  { icon: Snowflake, title: 'Cold chain', description: 'Fish, meat and dairy are kept cold from processing to delivery to protect quality and safety.' },
  { icon: HandCoins, title: 'Fair farmer pay', description: 'Verified farmers are paid fairly and on time, with records of every supply we receive.' },
]

const traceSteps = [
  { icon: MapPinned, title: 'Origin recorded', description: 'Each product is linked to its source — a SuberFood farm or a verified partner farmer.' },
  { icon: ClipboardCheck, title: 'Stock & handling logged', description: 'Receipts, stock movements and preparation batches are recorded in our system.' },
  { icon: QrCode, title: 'Tracking code on every order', description: 'You receive a tracking code to follow your delivery, driver and status in real time.' },
]

export default function SustainabilityPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Sustainability"
        title="Good food should not cost the earth — or the farmer"
        description="Owning the whole chain lets us make better decisions at every step: what we grow, how we process it, how far it travels and how little goes to waste."
      />

      <Section eyebrow="Our commitments" title="What we do differently">
        <FeatureGrid features={commitments} />
      </Section>

      <Section
        muted
        eyebrow="Traceability"
        title="Follow your food from farm to fork"
        subtitle="Transparency is not a slogan for us — it is built into how our platform works."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {traceSteps.map((s, i) => (
            <div key={s.title} className="relative rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
              <span className="absolute top-4 right-4 text-4xl font-display font-bold text-primary-100">{i + 1}</span>
              <s.icon className="w-8 h-8 text-primary-700 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-600">{s.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="rounded-2xl bg-gray-900 text-white p-8 sm:p-12 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-display font-bold mb-4">Our honest progress</h2>
            <p className="text-gray-300">
              We are a growing company and we will publish measurable targets — food waste, farmer payments
              and delivery distances — as our farm and processing records come online. If you want to know
              something about how we work, ask us directly.
            </p>
          </div>
          <ul className="space-y-3 text-gray-200">
            <li className="flex gap-3"><span className="text-primary-400">✓</span> Order and delivery tracking live today</li>
            <li className="flex gap-3"><span className="text-primary-400">✓</span> Verified farmer supplier records</li>
            <li className="flex gap-3"><span className="text-primary-400">✓</span> Stock movement and preparation batch logs</li>
            <li className="flex gap-3"><span className="text-gray-500">○</span> Farm-plot level origin on every product — in progress</li>
            <li className="flex gap-3"><span className="text-gray-500">○</span> Public sustainability report — planned</li>
          </ul>
        </div>
      </Section>

      <CtaBand
        title="Taste the difference transparency makes"
        primary={{ label: 'Shop the farm', href: '/distribution/farm-products' }}
        secondary={{ label: 'Ask us a question', href: '/contact' }}
      />
    </PageShell>
  )
}
