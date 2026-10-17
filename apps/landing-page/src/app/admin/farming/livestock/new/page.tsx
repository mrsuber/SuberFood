'use client'

import { PlannedModule } from '@/components/admin/ui'

export default function Page() {
  return (
    <PlannedModule
      title="Add Animal"
      phase="Phase 1 · Livestock, poultry & aquaculture"
      summary="Individual animal and flock registration will arrive with the livestock module. Until then, record animals and products delivered for processing as harvest supplies."
      planned={[
        'Animal / flock / pond registry with tag IDs',
        'Vaccination and treatment records',
        'Breeding and birth records',
        'Milk, egg and growth production logs',
        'Feed consumption and costs',
        'Animal-to-meat traceability at processing',
      ]}
      today={[
        { label: 'Farms', href: '/admin/farming/farms', description: 'Register livestock, poultry and fish farm sites' },
        { label: 'Record a delivery', href: '/admin/farming/supply', description: 'Log eggs, milk, fish or animals received' },
        { label: 'Partner farmers', href: '/admin/farmers', description: 'Livestock and poultry suppliers' },
      ]}
    />
  )
}
