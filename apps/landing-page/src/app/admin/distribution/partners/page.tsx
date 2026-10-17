'use client'

import { AdminPage, LinkButton } from '@/components/admin/ui'
import { InquiryInbox } from '@/components/admin/InquiryInbox'

export default function PartnersPage() {
  return (
    <AdminPage
      title="B2B Partners"
      description="Wholesale quote requests, partnership proposals and farmer supplier applications from the website."
      actions={<LinkButton href="/admin/distribution/partners/new">Add partner</LinkButton>}
    >
      <InquiryInbox types={['WHOLESALE', 'PARTNERSHIP', 'FARMER_SUPPLY']} />
    </AdminPage>
  )
}
