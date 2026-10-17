'use client'

import { useEffect, useState } from 'react'

export interface RestaurantSummary {
  id: string
  name: string
  slug: string
  type: string
  description: string | null
  address: string
  city: string
  state: string
  phone: string
  email: string
  status: string
  openingTime: string | null
  closingTime: string | null
  capacity: number
  rating: number
  images: string[]
  amenities: string[]
  privateRooms: boolean
  outdoorSeating: boolean
  currentWaitTime: number | null
}

/** Open restaurants from /api/locations (the restaurants table). */
export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/locations')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed to load restaurants'))))
      .then((data) => {
        if (!cancelled) setRestaurants(data.locations || [])
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { restaurants, loading, error }
}

export const restaurantTypeLabels: Record<string, string> = {
  CLASSICAL_FINE_DINING: 'Classical fine dining',
  QUICK_SERVICE: 'Quick service',
  CAFETERIA: 'Cafeteria',
}

/** 30-minute slots between opening and the last seating (1 hour before close). */
export function timeSlots(openingTime: string | null, closingTime: string | null) {
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  const start = toMin(openingTime || '11:00')
  const end = toMin(closingTime || '22:00') - 60
  const slots: string[] = []
  for (let m = Math.ceil(start / 30) * 30; m <= end; m += 30) {
    slots.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`)
  }
  return slots
}
