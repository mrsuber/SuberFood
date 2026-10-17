import type { Metadata } from 'next'
import { ClipboardList, Calculator, Truck, Repeat } from 'lucide-react'
import { PageShell, PageHero, Section } from '@/components/marketing'
import { InquiryForm } from '@/components/marketing/InquiryForm'
import { FeaturedProducts } from '@/components/marketing/FeaturedProducts'

export const metadata: Metadata = {
  title: 'Wholesale Supply | SuberFood',
  description: 'Request a wholesale quote for fresh produce, fish, poultry, meat, eggs and dairy.',
}

const steps = [
  { icon: ClipboardList, title: 'Tell us your needs', text: 'Products, quantities and how often.' },
  { icon: Calculator, title: 'Get your quote', text: 'Bulk prices and delivery fees, usually within one business day.' },
  { icon: Truck, title: 'First delivery', text: 'We deliver, you check quality on arrival.' },
  { icon: Repeat, title: 'Standing order', text: 'Set up a regular schedule that fits your business.' },
]

export default function WholesalePage() {
  return (
    <PageShell>
      <PageHero
        tone="purple"
        eyebrow="Wholesale"
        title="Bulk food supply, priced for business"
        description="Fresh vegetables, tubers, fruits, fish, poultry, meat, eggs and dairy — in the units your business buys, delivered on your schedule."
        breadcrumbs={[
          { name: 'B2B Partners', href: '/distribution/partners' },
          { name: 'Wholesale', href: '/distribution/partners/wholesale' },
        ]}
      />

      <Section>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-full bg-violet-100 text-violet-800 font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <s.icon className="w-5 h-5 text-violet-700" />
              </div>
              <p className="font-semibold text-gray-900">{s.title}</p>
              <p className="text-sm text-gray-600">{s.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section muted>
        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Request a quote</h2>
            <p className="text-gray-600 mb-6">
              The more detail you share, the more accurate our quote. Not sure about quantities yet? Give us an estimate —
              we can adjust after the first deliveries.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Bulk prices per basket, crate, bag or carton</li>
              <li>✓ Daily, weekly or monthly deliveries</li>
              <li>✓ Pay by mobile money, transfer or on account</li>
            </ul>
          </div>
          <div className="lg:col-span-3 rounded-2xl bg-white border border-gray-200 p-6 sm:p-8 shadow-sm">
            <InquiryForm
              type="WHOLESALE"
              showCompany
              extraFields={[
                {
                  name: 'businessType',
                  label: 'Type of business',
                  type: 'select',
                  required: true,
                  options: ['Restaurant / caterer', 'Hotel', 'School / hospital / canteen', 'Supermarket / shop', 'Market reseller', 'Other'],
                },
                {
                  name: 'frequency',
                  label: 'Delivery frequency',
                  type: 'select',
                  options: ['Daily', 'Several times a week', 'Weekly', 'Monthly', 'One-off order'],
                },
                { name: 'budget', label: 'Estimated weekly spend (XAF)', type: 'text', placeholder: 'e.g. 250 000' },
              ]}
              messageLabel="What do you need?"
              messagePlaceholder="e.g. 3 baskets of tomatoes, 50 kg tilapia, 20 trays of eggs per week"
              submitLabel="Request quote"
              successTitle="Quote request received"
              successMessage="Our B2B team will contact you within one business day with prices and a delivery plan."
            />
          </div>
        </div>
      </Section>

      <Section>
        <FeaturedProducts title="A taste of what we supply" />
      </Section>
    </PageShell>
  )
}
