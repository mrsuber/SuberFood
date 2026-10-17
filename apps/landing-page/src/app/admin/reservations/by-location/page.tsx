'use client'

import { AdminPage } from '@/components/admin/ui'
import { ReservationsBoard } from '@/components/admin/ReservationsBoard'

export default function ReservationsByLocationPage() {
  return (
    <AdminPage
      title="Reservations by Location"
      back={{ label: 'All reservations', href: '/admin/reservations' }}
    >
      <ReservationsBoard groupByLocation />
    </AdminPage>
  )
}
