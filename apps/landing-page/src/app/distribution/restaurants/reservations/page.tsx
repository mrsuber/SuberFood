import type { Metadata } from 'next'
import { CalendarCheck, Clock, Users, MessageSquare } from 'lucide-react'
import { PageShell, PageHero, Section } from '@/components/marketing'
import { RestaurantList } from '@/components/restaurants/RestaurantList'

export const metadata: Metadata = {
  title: 'Reservations | SuberFood Restaurants',
  description: 'Book a table at a SuberFood restaurant.',
}

const steps = [
  { icon: CalendarCheck, title: 'Pick a restaurant', text: 'Choose the location that suits you.' },
  { icon: Clock, title: 'Choose date & time', text: 'See the times available that day.' },
  { icon: Users, title: 'Tell us your party size', text: 'Add any special requests.' },
  { icon: MessageSquare, title: 'We confirm', text: 'The restaurant confirms your booking.' },
]

export default function ReservationsPage() {
  return (
    <PageShell>
      <PageHero
        tone="amber"
        eyebrow="Reservations"
        title="Book a table"
        description="Reserve in under a minute. Sign in to book, and manage your reservations from your account."
        breadcrumbs={[
          { name: 'Restaurants', href: '/distribution/restaurants' },
          { name: 'Reservations', href: '/distribution/restaurants/reservations' },
        ]}
      />
      <Section>
        <ol className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-3">
              <span className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-gray-900">{s.title}</p>
                <p className="text-sm text-gray-600">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <RestaurantList mode="reserve" />
        <p className="mt-8 text-sm text-gray-500 text-center">
          Groups of more than 30 or private events? <a href="/distribution/restaurants/contact" className="text-primary-700 font-medium hover:underline">Contact our events team</a>.
        </p>
      </Section>
    </PageShell>
  )
}
