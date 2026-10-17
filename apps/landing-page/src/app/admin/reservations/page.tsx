'use client'

import { AdminPage } from '@/components/admin/ui'
import { ReservationsBoard } from '@/components/admin/ReservationsBoard'

export default function ReservationsPage() {
  return (
    <AdminPage title="Reservations" description="Table bookings from the website. Confirm new requests, then seat or mark no-shows on the day.">
      <ReservationsBoard />
    </AdminPage>
  )
}
