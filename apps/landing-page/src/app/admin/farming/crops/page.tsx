'use client'

import { PlannedModule } from '@/components/admin/ui'

export default function CropsPage() {
  return (
    <PlannedModule
      title="Crops"
      phase="Phase 1 · Farm management"
      summary="Crop records will track what is planted where, its growth stage and expected harvest — so pre-orders can be matched to upcoming harvests."
      planned={[
        'Fields and plots per farm',
        'Planting records (crop, variety, date, area)',
        'Growth stages and field activities',
        'Inputs used (seed, fertiliser, treatments)',
        'Expected vs actual yield',
        'Harvest forecasts feeding the shop’s pre-orders',
      ]}
      today={[
        { label: 'Farms', href: '/admin/farming/farms', description: 'Register crop farm sites' },
        { label: 'Record a harvest', href: '/admin/farming/supply', description: 'Log harvests with batch numbers' },
        { label: 'Pre-orders by product', href: '/admin/farm-products/orders/by-product', description: 'See demand to plan harvests' },
      ]}
    />
  )
}
