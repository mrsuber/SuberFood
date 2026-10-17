import type { Metadata } from 'next'
import { PageShell, PageHero, Section, ValueChain } from '@/components/marketing'
import { InquiryForm } from '@/components/marketing/InquiryForm'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Press | SuberFood',
  description: 'Press information, company facts and media contact for SuberFood.',
}

const facts = [
  { label: 'Company', value: site.name },
  { label: 'Headquarters', value: `${site.contact.city}, ${site.country}` },
  { label: 'Business', value: 'Vertically integrated farm-to-table food company' },
  { label: 'Operations', value: 'Farming, food processing, delivery, restaurants, online farm shop, B2B supply' },
  { label: 'Cities served', value: site.serviceCities.join(', ') },
  { label: 'Media contact', value: site.contact.pressEmail },
]

export default function PressPage() {
  return (
    <PageShell>
      <PageHero
        tone="slate"
        eyebrow="Press"
        title="Newsroom"
        description="Facts, background and a direct line to our team for journalists and partners."
      />

      <Section>
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-display font-bold text-gray-900">About {site.name}</h2>
            <p className="text-gray-700 leading-relaxed">
              {site.name} is a Cameroonian food company that controls the full journey of its food — from its own
              farms and verified partner farmers, through processing, to delivery and its own restaurants. Customers
              order online, pay with mobile money and track their deliveries in real time. The company&apos;s platform
              records products, stock, payments and deliveries end to end, making food traceable from farm to fork.
            </p>
            <dl className="grid sm:grid-cols-2 gap-4">
              {facts.map((f) => (
                <div key={f.label} className="rounded-lg border border-gray-200 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">{f.label}</dt>
                  <dd className="font-medium text-gray-900 mt-1">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-gray-900 mb-4">Media inquiries</h2>
            <InquiryForm
              type="PRESS"
              showCompany
              showCity={false}
              messagePlaceholder="Your outlet, deadline and what you would like to know"
              submitLabel="Contact press team"
            />
          </div>
        </div>
      </Section>

      <Section muted title="Our model in one picture">
        <ValueChain />
      </Section>
    </PageShell>
  )
}
