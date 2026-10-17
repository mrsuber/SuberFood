'use client'

import { AdminPage, LinkButton } from '@/components/admin/ui'
import { SiteRegistry } from '@/components/admin/SiteRegistry'
import { farmsConfig } from '@/components/admin/siteConfigs'

export default function FarmsPage() {
  return (
    <AdminPage
      title="Farm Management"
      description="SuberFood-run farm sites. Partner farmers who supply us are managed under Farmers."
      actions={
        <>
          <LinkButton href="/admin/farmers" variant="outline">Partner farmers</LinkButton>
          <LinkButton href="/admin/farming/supply">Record harvest</LinkButton>
        </>
      }
    >
      <SiteRegistry config={farmsConfig} />
    </AdminPage>
  )
}
