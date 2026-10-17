'use client'

import { PlannedModule } from '@/components/admin/ui'

export default function NewPartnerPage() {
  return (
    <PlannedModule
      title="Add Partner"
      phase="Phase 4 · B2B portal"
      summary="Partner accounts will let restaurants, hotels and retailers log in, see their negotiated prices and place standing orders. Until then, B2B leads arrive through the wholesale form and are managed in the partners inbox, and farmer suppliers are registered as farmers."
      planned={[
        'Partner company profiles and contacts',
        'Negotiated price lists per partner',
        'Credit terms and invoicing',
        'Standing / recurring orders',
        'Partner portal login (B2B_PARTNER role)',
        'Account manager assignment',
      ]}
      today={[
        { label: 'Partner leads inbox', href: '/admin/distribution/partners', description: 'Wholesale and partnership requests from the website' },
        { label: 'Register a farmer supplier', href: '/admin/farmers/new', description: 'Add a verified farmer to the supplier network' },
        { label: 'Bulk prices', href: '/admin/farm-products/products', description: 'Set bulk units and prices on products' },
      ]}
    />
  )
}
