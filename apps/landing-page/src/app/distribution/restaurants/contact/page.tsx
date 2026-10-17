import type { Metadata } from 'next'
import { PageShell, PageHero, Section, ContactDetails } from '@/components/marketing'
import { InquiryForm } from '@/components/marketing/InquiryForm'

export const metadata: Metadata = {
  title: 'Contact Our Restaurants | SuberFood',
  description: 'Private dining, catering, events and feedback for SuberFood restaurants.',
}

export default function RestaurantContactPage() {
  return (
    <PageShell>
      <PageHero
        tone="amber"
        eyebrow="Restaurants"
        title="Events, catering & feedback"
        description="Planning a celebration, an office lunch or a large group? Have feedback on a visit? Our restaurant team would love to hear from you."
        breadcrumbs={[
          { name: 'Restaurants', href: '/distribution/restaurants' },
          { name: 'Contact', href: '/distribution/restaurants/contact' },
        ]}
      />
      <Section>
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <InquiryForm
              typeOptions={[
                { value: 'EVENTS', label: 'Private event or catering' },
                { value: 'RESTAURANT', label: 'Feedback about a visit' },
                { value: 'GENERAL', label: 'Other restaurant question' },
              ]}
              extraFields={[
                { name: 'eventDate', label: 'Event date (if any)', type: 'text', placeholder: 'e.g. 14 December' },
                { name: 'guests', label: 'Number of guests', type: 'number' },
              ]}
              messagePlaceholder="Tell us about your event or your visit"
            />
          </div>
          <ContactDetails note="For same-day table bookings, calling the restaurant directly is fastest." />
        </div>
      </Section>
    </PageShell>
  )
}
