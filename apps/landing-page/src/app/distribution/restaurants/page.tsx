import type { Metadata } from 'next'
import Link from 'next/link'
import { Sprout, ChefHat, Recycle, Utensils, ShoppingBag, Truck, PartyPopper } from 'lucide-react'
import { PageShell, PageHero, Section, FeatureGrid, CtaBand } from '@/components/marketing'
import { RestaurantList } from '@/components/restaurants/RestaurantList'

export const metadata: Metadata = {
  title: 'Restaurants | SuberFood',
  description: 'Farm-to-table restaurants cooking with ingredients from SuberFood farms. Dine in, take away, order delivery or book a table.',
}

const reasons = [
  { icon: Sprout, title: 'Ingredients from our farms', description: 'Our kitchens cook with fish, poultry, meat and produce from our own farms and partner farmers.' },
  { icon: ChefHat, title: 'Cooked with care', description: 'Local favourites and modern dishes, prepared fresh by our kitchen teams.' },
  { icon: Recycle, title: 'Less waste', description: 'Kitchen stock is tracked ingredient by ingredient, so we buy and cook what we need.' },
]

const ways = [
  { icon: Utensils, title: 'Dine in', description: 'Order at your table and enjoy.' },
  { icon: ShoppingBag, title: 'Takeaway', description: 'Order ahead and pick up at your chosen time.' },
  { icon: Truck, title: 'Delivery', description: 'Hot meals delivered within our delivery zones.' },
  { icon: PartyPopper, title: 'Events', description: 'Private dining and catering for celebrations and companies.' },
]

export default function RestaurantsPage() {
  return (
    <PageShell>
      <PageHero
        tone="amber"
        eyebrow="Restaurants"
        title="Farm-to-table, on your plate"
        description="Every dish starts on our farms. Eat with us, take it home, or have it delivered."
      >
        <Link
          href="/distribution/restaurants/reservations"
          className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 font-semibold text-amber-800 hover:bg-amber-50"
        >
          Book a table
        </Link>
        <Link
          href="/distribution/restaurants/menu"
          className="inline-flex items-center justify-center rounded-lg border-2 border-white px-8 py-3 font-semibold text-white hover:bg-white/10"
        >
          View the menu
        </Link>
      </PageHero>

      <Section muted eyebrow="Our locations" title="Find a SuberFood restaurant">
        <RestaurantList />
      </Section>

      <Section eyebrow="Your way" title="Four ways to enjoy SuberFood">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {ways.map((w) => (
            <div key={w.title} className="text-center">
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
                <w.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900">{w.title}</h3>
              <p className="text-sm text-gray-600">{w.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section muted eyebrow="Why dine with us" title="Food you can trace back to the farm">
        <FeatureGrid features={reasons} tone="amber" />
      </Section>

      <CtaBand
        title="Planning an event?"
        description="Private dining, office lunches and catering with farm-fresh menus."
        primary={{ label: 'Talk to our team', href: '/distribution/restaurants/contact' }}
        secondary={{ label: 'Book a table', href: '/distribution/restaurants/reservations' }}
      />
    </PageShell>
  )
}
