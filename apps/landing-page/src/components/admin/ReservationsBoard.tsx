'use client'

import { useState } from 'react'
import { CalendarCheck, Clock, Users, CalendarDays } from 'lucide-react'
import {
  Panel,
  StatCard,
  StatusPill,
  Loading,
  EmptyState,
  ErrorNote,
  inputClass,
  useAdminFetch,
  sendJson,
  humanize,
  groupByRestaurant,
} from '@/components/admin/ui'

interface Reservation {
  id: string
  reservationDate: string
  reservationTime: string
  partySize: number
  status: string
  specialRequests: string | null
  notes: string | null
  restaurant: { id: string; name: string; city: string }
  user: { id: string; name: string | null; email: string | null; phone: string | null }
}

const NEXT_ACTIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SEATED', 'NO_SHOW', 'CANCELLED'],
  SEATED: ['COMPLETED'],
}

export function ReservationsBoard({ initialStatus = 'all', groupByLocation = false }: { initialStatus?: string; groupByLocation?: boolean }) {
  const [status, setStatus] = useState(initialStatus)
  const [range, setRange] = useState('upcoming')
  const [restaurantId, setRestaurantId] = useState('all')
  const [busy, setBusy] = useState<string | null>(null)

  const params = new URLSearchParams({ status, range, restaurantId })
  const { data, loading, error, reload } = useAdminFetch<{
    data: Reservation[]
    restaurants: { id: string; name: string; city: string }[]
    stats: { upcomingByStatus: Record<string, number>; today: number }
  }>(`/api/admin/reservations?${params}`)

  const setReservationStatus = async (id: string, next: string) => {
    setBusy(id)
    try {
      await sendJson(`/api/admin/reservations/${id}`, 'PATCH', { status: next })
      reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setBusy(null)
    }
  }

  const reservations = data?.data || []
  const upcoming = data?.stats.upcomingByStatus || {}
  const guests = reservations.reduce((sum, r) => sum + r.partySize, 0)

  const table = (rows: Reservation[]) => (
    <div className="overflow-x-auto -m-6">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
          <tr>
            <th className="px-6 py-3">When</th>
            <th className="px-6 py-3">Guest</th>
            {!groupByLocation && <th className="px-6 py-3">Restaurant</th>}
            <th className="px-6 py-3">Party</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((r) => (
            <tr key={r.id} className="align-top">
              <td className="px-6 py-4 whitespace-nowrap">
                <p className="font-medium text-gray-900">
                  {new Date(r.reservationDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Africa/Douala' })}
                </p>
                <p className="text-gray-500">{r.reservationTime}</p>
              </td>
              <td className="px-6 py-4">
                <p className="font-medium text-gray-900">{r.user.name || r.notes || 'Guest'}</p>
                <p className="text-gray-500">{r.user.phone || r.user.email}</p>
                {r.notes && <p className="text-xs text-gray-400">{r.notes}</p>}
                {r.specialRequests && <p className="mt-1 text-xs text-amber-700">“{r.specialRequests}”</p>}
              </td>
              {!groupByLocation && (
                <td className="px-6 py-4">
                  {r.restaurant.name}
                  <p className="text-gray-500">{r.restaurant.city}</p>
                </td>
              )}
              <td className="px-6 py-4">{r.partySize}</td>
              <td className="px-6 py-4">
                <StatusPill value={r.status} />
              </td>
              <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                {(NEXT_ACTIONS[r.status] || []).map((next) => (
                  <button
                    key={next}
                    disabled={busy === r.id}
                    onClick={() => setReservationStatus(r.id, next)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold disabled:opacity-50 ${
                      next === 'CANCELLED' || next === 'NO_SHOW'
                        ? 'text-red-700 hover:bg-red-50'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {next === 'CONFIRMED' ? 'Confirm' : humanize(next)}
                  </button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today" value={data ? data.stats.today : '—'} icon={CalendarDays} tone="blue" />
        <StatCard label="Awaiting confirmation" value={upcoming.PENDING ?? 0} icon={Clock} tone="amber" />
        <StatCard label="Confirmed (upcoming)" value={upcoming.CONFIRMED ?? 0} icon={CalendarCheck} />
        <StatCard label="Guests in this view" value={guests} icon={Users} tone="gray" />
      </div>

      <Panel>
        <div className="flex flex-wrap gap-3">
          <select className={`${inputClass} w-auto`} value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="all">All dates</option>
          </select>
          <select className={`${inputClass} w-auto`} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {['PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map((s) => (
              <option key={s} value={s}>
                {humanize(s)}
              </option>
            ))}
          </select>
          <select className={`${inputClass} w-auto`} value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)}>
            <option value="all">All restaurants</option>
            {data?.restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.city})
              </option>
            ))}
          </select>
        </div>
      </Panel>

      {error && <ErrorNote message={error} />}

      {loading ? (
        <Loading />
      ) : reservations.length === 0 ? (
        <Panel>
          <EmptyState title="No reservations match these filters" description="Bookings made on the website appear here." />
        </Panel>
      ) : groupByLocation ? (
        groupByRestaurant(reservations).map((g) => (
          <Panel key={g.name} title={`${g.name}${g.city ? ` · ${g.city}` : ''} — ${g.items.length} bookings`}>
            {table(g.items)}
          </Panel>
        ))
      ) : (
        <Panel>{table(reservations)}</Panel>
      )}
    </div>
  )
}
