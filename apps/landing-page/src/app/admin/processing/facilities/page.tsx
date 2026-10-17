'use client'

import { AdminPage, LinkButton } from '@/components/admin/ui'
import { SiteRegistry } from '@/components/admin/SiteRegistry'
import { facilitiesConfig } from '@/components/admin/siteConfigs'

export default function ProcessingFacilitiesPage() {
  return (
    <AdminPage
      title="Processing Facilities"
      description="Sardine, milk, meat and vegetable processing units and their daily capacity."
      actions={<LinkButton href="/admin/processing/quality" variant="outline">Quality control</LinkButton>}
    >
      <SiteRegistry config={facilitiesConfig} />
    </AdminPage>
  )
}
