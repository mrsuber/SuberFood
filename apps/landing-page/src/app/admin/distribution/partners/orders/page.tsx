'use client'

import { PlannedModule } from '@/components/admin/ui'

export default function PartnerOrdersPage() {
  return (
    <PlannedModule
      title="Bulk Orders"
      phase="Phase 4 · B2B portal"
      summary="A dedicated view of partner orders will come with partner accounts. Bulk purchases placed today through the farm shop already appear in farm product orders."
      planned={[
        'Orders grouped by partner account',
        'Recurring delivery schedules',
        'Invoices and payment status per partner',
        'Volume and spend reports',
      ]}
      today={[
        { label: 'Farm product orders', href: '/admin/farm-products/orders', description: 'All shop orders, including bulk quantities' },
        { label: 'Orders by product', href: '/admin/farm-products/orders/by-product', description: 'Plan sourcing trips by product' },
      ]}
    />
  )
}
