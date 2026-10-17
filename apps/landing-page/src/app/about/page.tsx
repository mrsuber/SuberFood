import type { Metadata } from 'next'
import { Eye, HeartHandshake, Leaf, Scale, Target, Compass } from 'lucide-react'
import { PageShell, PageHero, Section, ValueChain, FeatureGrid, CtaBand } from '@/components/marketing'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'About Us | SuberFood',
  description:
    'SuberFood is a vertically integrated food company in Cameroon — farming, processing, distribution and restaurants under one roof.',
}

const values = [
  { icon: Eye, title: 'Transparency', description: 'Customers should be able to see where food came from and how it was handled. We build our systems around that.' },
  { icon: Scale, title: 'Fairness', description: 'Fair prices for families, fair and prompt payment for the farmers who supply us.' },
  { icon: Leaf, title: 'Responsibility', description: 'Farm practices that protect soil and water, and a supply chain that wastes less.' },
  { icon: HeartHandshake, title: 'Community', description: 'Jobs in rural areas, training for farmers, and food that keeps value inside Cameroon.' },
]

const roadmap = [
  { phase: 'Now', title: 'Farm shop, restaurants & delivery', description: 'Online farm shop with mobile money, restaurant ordering, delivery tracking, wallet and referrals.' },
  { phase: 'Next', title: 'Farm & processing operations', description: 'Digital farm records, livestock health, harvest planning and batch-level processing traceability.' },
  { phase: 'Then', title: 'B2B and more cities', description: 'A wholesale portal for restaurants, hotels and shops, and expansion to more Cameroonian cities.' },
  { phase: 'Vision', title: 'Central Africa', description: 'A transparent, data-driven food network serving multiple countries in the region.' },
]

export default function AboutPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="About SuberFood"
        title="Growing a food system Cameroon can trust"
        description={`${site.name} brings farming, processing, logistics and food service together in one company. When we control every step, we can promise freshness, quality and honesty about where your food comes from.`}
      />

      <Section>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-600 mb-3">Our story</p>
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-6">Why we exist</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                In most markets, food passes through many hands between the farm and the plate. Each step
                adds cost, time and uncertainty. Families pay more for produce that is less fresh, and
                farmers earn less for the work they put in.
              </p>
              <p>
                {site.name} was started to shorten that chain. We raise fish, poultry and livestock, grow
                crops, and buy directly from verified local farmers. We process food in our own facilities,
                deliver it ourselves, and serve it in our own restaurants.
              </p>
              <p>
                Technology ties it together: one platform records products, stock, orders, payments and
                deliveries, so every order can be followed from start to finish.
              </p>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-xl bg-primary-50 border border-primary-100 p-6">
              <Target className="w-8 h-8 text-primary-700 mb-3" />
              <h3 className="font-display font-semibold text-xl text-gray-900 mb-2">Mission</h3>
              <p className="text-gray-700">
                Connect every step of the food supply chain — from farmers to consumers — with the highest
                standards of quality, transparency and efficiency.
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-6">
              <Compass className="w-8 h-8 text-amber-700 mb-3" />
              <h3 className="font-display font-semibold text-xl text-gray-900 mb-2">Vision</h3>
              <p className="text-gray-700">
                The most transparent, efficient and sustainable farm-to-table network in Africa, where anyone
                can trace their food back to the farm it came from.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section muted eyebrow="How we work" title="Five steps, one company">
        <ValueChain />
      </Section>

      <Section eyebrow="What we stand for" title="Our values">
        <FeatureGrid features={values} columns={4} />
      </Section>

      <Section muted eyebrow="Where we are going" title="Our roadmap">
        <ol className="relative grid gap-6 md:grid-cols-4">
          {roadmap.map((r, i) => (
            <li key={r.phase} className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold mb-4 ${
                  i === 0 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {r.phase}
              </span>
              <h3 className="font-semibold text-gray-900 mb-2">{r.title}</h3>
              <p className="text-sm text-gray-600">{r.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      <CtaBand
        title="Be part of the story"
        description="Shop with us, supply us, partner with us or join the team."
        primary={{ label: 'Shop the farm', href: '/distribution/farm-products' }}
        secondary={{ label: 'Careers', href: '/careers' }}
      />
    </PageShell>
  )
}
