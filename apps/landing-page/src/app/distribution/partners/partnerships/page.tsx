import type { Metadata } from 'next'
import { Banknote, Truck, CalendarRange, GraduationCap, BadgeCheck, Sprout } from 'lucide-react'
import { PageShell, PageHero, Section, FeatureGrid, FaqList } from '@/components/marketing'
import { InquiryForm } from '@/components/marketing/InquiryForm'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Farmer & Supplier Partnerships | SuberFood',
  description: 'Sell your crops, fish, poultry or livestock to SuberFood. Fair prices, collection from your farm and on-time payment.',
}

const benefits = [
  { icon: Banknote, title: 'Fair, on-time payment', description: 'Agreed prices and prompt payment by mobile money or cash for every supply.' },
  { icon: Truck, title: 'We collect', description: 'Our team can collect from your farm or a nearby collection point.' },
  { icon: CalendarRange, title: 'Demand you can plan on', description: 'Customer pre-orders tell us — and you — what is needed before harvest.' },
  { icon: GraduationCap, title: 'Support & advice', description: 'Guidance on quality, grading and handling so you get the best price.' },
  { icon: BadgeCheck, title: 'Verified supplier status', description: 'Verified farmers get priority orders and are featured as a product source.' },
  { icon: Sprout, title: 'Grow with us', description: 'As our customers grow across cities, so does the demand for your harvest.' },
]

const faqs = [
  { q: 'What can I supply?', a: 'Vegetables, tubers, fruits, grains, legumes, spices, fish, poultry, eggs, livestock and milk. Tell us what you produce and in what quantities.' },
  { q: 'How does verification work?', a: 'We visit your farm or collection point, check your products and record your details. Once verified you can receive orders.' },
  { q: 'How are prices set?', a: 'We agree a price before each supply based on quality, grade and market conditions. You always know the price before you deliver.' },
  { q: 'Which regions do you buy from?', a: `We currently source mostly around ${site.serviceCities.slice(0, 5).join(', ')}, and are expanding. Apply wherever you are.` },
]

export default function PartnershipsPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Farmer partnerships"
        title="Grow it. We will buy it, collect it and pay on time."
        description="SuberFood buys from verified farmers across Cameroon. Join our supplier network and sell to a buyer who values quality and pays fairly."
        breadcrumbs={[
          { name: 'B2B Partners', href: '/distribution/partners' },
          { name: 'Partnerships', href: '/distribution/partners/partnerships' },
        ]}
      />

      <Section eyebrow="Why supply SuberFood" title="A better deal for farmers">
        <FeatureGrid features={benefits} />
      </Section>

      <Section muted>
        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Apply to become a supplier</h2>
              <p className="text-gray-600">
                Fill in the form and our sourcing team will call you to arrange a visit. You can also apply for a cooperative
                or farmer group.
              </p>
            </div>
            <FaqList items={faqs} />
          </div>
          <div className="lg:col-span-3 rounded-2xl bg-white border border-gray-200 p-6 sm:p-8 shadow-sm">
            <InquiryForm
              type="FARMER_SUPPLY"
              showCompany
              extraFields={[
                {
                  name: 'farmType',
                  label: 'What do you produce?',
                  type: 'select',
                  required: true,
                  options: ['Vegetables', 'Tubers (cassava, yam, cocoyam)', 'Fruits & plantains', 'Grains & legumes', 'Fish', 'Poultry & eggs', 'Livestock', 'Milk', 'Several of these'],
                },
                { name: 'village', label: 'Village / locality', type: 'text', placeholder: 'e.g. Muea' },
                { name: 'farmSize', label: 'Farm size or herd size', type: 'text', placeholder: 'e.g. 2 hectares, 300 birds' },
                {
                  name: 'supplierKind',
                  label: 'You are…',
                  type: 'select',
                  options: ['Individual farmer', 'Cooperative / farmer group', 'Fishermen group', 'Processor', 'Other supplier'],
                },
              ]}
              messageLabel="Tell us about your farm"
              messagePlaceholder="What you grow or raise, typical quantities per harvest/month, and when it is available"
              submitLabel="Apply as supplier"
              successTitle="Application received"
              successMessage="Thank you! Our sourcing team will call you to arrange a visit."
            />
          </div>
        </div>
      </Section>
    </PageShell>
  )
}
