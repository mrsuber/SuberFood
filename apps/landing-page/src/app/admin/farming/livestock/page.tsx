'use client'

import { PlannedModule } from '@/components/admin/ui'

export default function Page() {
  return (
    <PlannedModule
      title="Livestock"
      phase="Phase 1 · Livestock, poultry & aquaculture"
      summary="Animal records will cover every animal or flock on our farms — cattle, goats, pigs, poultry and fish ponds — with health, breeding and production history."
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
