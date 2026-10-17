import type { Metadata } from 'next'
import Link from 'next/link'
import { PackageSearch, Handshake, HelpCircle } from 'lucide-react'
import { PageShell, PageHero, Section, ContactDetails } from '@/components/marketing'
import { InquiryForm } from '@/components/marketing/InquiryForm'

export const metadata: Metadata = {
  title: 'Contact Us | SuberFood',
  description: 'Get in touch with SuberFood — orders, deliveries, partnerships and general questions.',
}

const shortcuts = [
  { icon: PackageSearch, title: 'Where is my order?', description: 'Use your tracking code for live status.', href: '/track-order' },
  { icon: HelpCircle, title: 'Questions about delivery or payment', description: 'Most answers are in our FAQs.', href: '/faq' },
  { icon: Handshake, title: 'Business & wholesale', description: 'Bulk supply for restaurants, hotels and shops.', href: '/distribution/partners/contact' },
]

export default function ContactPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Contact"
        title="We are here to help"
        description="Questions about an order, a delivery or working with us? Send us a message and our team will reply within one business day."
      />

      <Section>
        <div className="grid gap-4 md:grid-cols-3 mb-12">
          {shortcuts.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="flex gap-4 rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-premium transition-shadow"
            >
              <s.icon className="w-6 h-6 text-primary-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">{s.title}</p>
                <p className="text-sm text-gray-600">{s.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Send us a message</h2>
            <InquiryForm
              typeOptions={[
                { value: 'GENERAL', label: 'General question' },
                { value: 'SUPPORT', label: 'Help with an order' },
                { value: 'WHOLESALE', label: 'Wholesale / bulk orders' },
                { value: 'FARMER_SUPPLY', label: 'I am a farmer and want to supply' },
                { value: 'EVENTS', label: 'Catering & events' },
                { value: 'PRESS', label: 'Press & media' },
              ]}
              showSubject
              extraFields={[{ name: 'orderNumber', label: 'Order number (if any)', placeholder: 'e.g. FPO-2026-123456' }]}
            />
          </div>
          <ContactDetails note="For urgent delivery issues, call or WhatsApp us with your order number ready." />
        </div>
      </Section>
    </PageShell>
  )
}
