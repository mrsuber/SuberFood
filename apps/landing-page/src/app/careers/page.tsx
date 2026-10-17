import type { Metadata } from 'next'
import { Sprout, Factory, Truck, ChefHat, Code2, Headphones, GraduationCap, TrendingUp, HeartHandshake } from 'lucide-react'
import { PageShell, PageHero, Section, FeatureGrid } from '@/components/marketing'
import { InquiryForm } from '@/components/marketing/InquiryForm'

export const metadata: Metadata = {
  title: 'Careers | SuberFood',
  description: 'Join SuberFood and help build a transparent farm-to-table food system in Cameroon.',
}

const teams = [
  { icon: Sprout, title: 'Farming', description: 'Farm managers, aquaculture and poultry technicians, field workers and agronomists.' },
  { icon: Factory, title: 'Processing & quality', description: 'Line operators, food safety and quality control specialists.' },
  { icon: Truck, title: 'Logistics & delivery', description: 'Delivery drivers and riders, warehouse and cold-chain staff, dispatchers.' },
  { icon: ChefHat, title: 'Restaurants', description: 'Chefs, cooks, waiters and restaurant managers.' },
  { icon: Headphones, title: 'Customer care & sales', description: 'Customer support, B2B account managers and farmer sourcing agents.' },
  { icon: Code2, title: 'Technology', description: 'Engineers and data people building the platform that connects it all.' },
]

const perks = [
  { icon: GraduationCap, title: 'Learn on the job', description: 'Hands-on training across farming, food safety and operations.' },
  { icon: TrendingUp, title: 'Grow with us', description: 'A young company expanding to new cities — room to take on more.' },
  { icon: HeartHandshake, title: 'Work that matters', description: 'Better food for families and better income for farmers.' },
]

export default function CareersPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Careers"
        title="Help us feed Cameroon better"
        description="We are building a food company that runs from farm to table. That takes farmers, cooks, drivers, engineers and everyone in between."
      />

      <Section eyebrow="Teams" title="Where you could work">
        <FeatureGrid features={teams} />
      </Section>

      <Section muted eyebrow="Why join" title="What we offer">
        <FeatureGrid features={perks} tone="amber" />
      </Section>

      <Section>
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Open applications</h2>
            <p className="text-gray-600 mb-4">
              We post specific roles as they open. In the meantime, tell us who you are and what you would like to do —
              we review every application and keep it on file for upcoming roles.
            </p>
            <p className="text-gray-600">
              Include links to your CV or LinkedIn in your message, or mention that you can send it on request.
            </p>
          </div>
          <InquiryForm
            type="CAREERS"
            extraFields={[
              {
                name: 'team',
                label: 'Team of interest',
                type: 'select',
                options: teams.map((t) => t.title),
                required: true,
              },
            ]}
            messageLabel="About you"
            messagePlaceholder="Your experience, the role you are interested in, and a link to your CV"
            submitLabel="Send application"
            successTitle="Application received"
            successMessage="Thank you for your interest in SuberFood. We will contact you if there is a suitable role."
          />
        </div>
      </Section>
    </PageShell>
  )
}
