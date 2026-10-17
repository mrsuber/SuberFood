import type { Metadata } from 'next'
import { PageShell, PageHero, Section, ContactDetails } from '@/components/marketing'
import { InquiryForm } from '@/components/marketing/InquiryForm'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Business Inquiries | SuberFood',
  description: 'Contact the SuberFood B2B team about wholesale supply, partnerships and investment.',
}

export default function PartnersContactPage() {
  return (
    <PageShell>
      <PageHero
        tone="purple"
        eyebrow="Business inquiries"
        title="Talk to our B2B team"
        description="Wholesale accounts, distribution and retail partnerships, processing contracts or investment — we would like to hear from you."
        breadcrumbs={[
          { name: 'B2B Partners', href: '/distribution/partners' },
          { name: 'Contact', href: '/distribution/partners/contact' },
        ]}
      />
      <Section>
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <InquiryForm
              typeOptions={[
                { value: 'WHOLESALE', label: 'Wholesale account' },
                { value: 'PARTNERSHIP', label: 'Distribution / retail partnership' },
                { value: 'FARMER_SUPPLY', label: 'Supplying SuberFood' },
                { value: 'GENERAL', label: 'Investment or something else' },
              ]}
              showCompany
              showSubject
              messagePlaceholder="Tell us about your business and what you have in mind"
            />
          </div>
          <ContactDetails email={site.contact.businessEmail} />
        </div>
      </Section>
    </PageShell>
  )
}
