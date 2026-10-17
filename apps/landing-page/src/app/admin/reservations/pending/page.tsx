'use client'

import { AdminPage } from '@/components/admin/ui'
import { ReservationsBoard } from '@/components/admin/ReservationsBoard'

export default function PendingReservationsPage() {
  return (
    <AdminPage
      title="Pending Reservations"
      description="Requests waiting for confirmation."
      back={{ label: 'All reservations', href: '/admin/reservations' }}
    >
      <ReservationsBoard initialStatus="PENDING" />
    </AdminPage>
  )
}
