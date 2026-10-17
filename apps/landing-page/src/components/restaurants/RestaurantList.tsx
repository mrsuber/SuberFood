'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock, Users, Phone, ChevronRight, UtensilsCrossed, Star, CalendarCheck } from 'lucide-react'
import { useRestaurants, restaurantTypeLabels } from '@/lib/hooks/useRestaurants'

export function RestaurantList({ mode = 'browse' }: { mode?: 'browse' | 'reserve' }) {
  const { restaurants, loading, error } = useRestaurants()

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[0, 1].map((i) => (
          <div key={i} className="h-96 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error || restaurants.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {error ? 'We could not load our restaurants right now' : 'Our restaurants are opening soon'}
        </h3>
        <p className="text-gray-600 mb-6">
          {error ? 'Please refresh the page in a moment.' : 'In the meantime, order fresh ingredients from our farm shop.'}
        </p>
        <Link href="/distribution/farm-products" className="text-primary-700 font-semibold hover:underline">
          Visit the farm shop →
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {restaurants.map((r) => (
        <div
          key={r.id}
          className="rounded-xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-premium-lg transition-all"
        >
          <div className="relative h-56 bg-primary-50">
            {r.images?.[0] ? (
              <Image src={r.images[0]} alt={r.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-primary-200">
                <UtensilsCrossed className="w-16 h-16" />
              </div>
            )}
            {r.currentWaitTime != null && r.currentWaitTime > 0 && (
              <span className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900">
                ~{r.currentWaitTime} min wait
              </span>
            )}
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="text-xl font-display font-bold text-gray-900">{r.name}</h3>
                <p className="text-sm text-primary-700 font-medium">{restaurantTypeLabels[r.type] || r.type}</p>
              </div>
              {r.rating > 0 && (
                <span className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {r.rating.toFixed(1)}
                </span>
              )}
            </div>
            {r.description && <p className="text-gray-600 text-sm mb-4 line-clamp-2">{r.description}</p>}
            <ul className="space-y-2 text-sm text-gray-700 mb-6">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-600 flex-shrink-0" /> {r.address}, {r.city}
              </li>
              {r.openingTime && r.closingTime && (
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-600 flex-shrink-0" /> Open {r.openingTime} – {r.closingTime}
                </li>
              )}
              {r.capacity > 0 && (
                <li className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary-600 flex-shrink-0" /> Seats {r.capacity}
                </li>
              )}
              {r.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary-600 flex-shrink-0" />
                  <a href={`tel:${r.phone.replace(/\s/g, '')}`} className="hover:text-primary-700">
                    {r.phone}
                  </a>
                </li>
              )}
            </ul>
            <div className="flex gap-3">
              {mode === 'reserve' ? (
                <Link
                  href={`/distribution/restaurants/${r.slug}/reserve`}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 font-semibold text-white hover:bg-primary-700"
                >
                  <CalendarCheck className="w-4 h-4" /> Book a table
                </Link>
              ) : (
                <>
                  <Link
                    href={`/distribution/restaurants/${r.slug}`}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-primary-600 px-4 py-2.5 font-semibold text-white hover:bg-primary-700"
                  >
                    View details <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/distribution/restaurants/${r.slug}/reserve`}
                    className="inline-flex items-center justify-center rounded-lg border-2 border-primary-600 px-4 py-2.5 font-semibold text-primary-700 hover:bg-primary-50"
                  >
                    Reserve
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
