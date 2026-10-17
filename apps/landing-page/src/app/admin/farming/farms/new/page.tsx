'use client'

import { AdminPage } from '@/components/admin/ui'
import { SiteRegistry } from '@/components/admin/SiteRegistry'
import { farmsConfig } from '@/components/admin/siteConfigs'

export default function NewFarmPage() {
  return (
    <AdminPage title="Add Farm" back={{ label: 'All farms', href: '/admin/farming/farms' }}>
      <SiteRegistry config={farmsConfig} />
    </AdminPage>
  )
}
