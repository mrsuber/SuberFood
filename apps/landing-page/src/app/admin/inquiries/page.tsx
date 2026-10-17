'use client'

import { AdminPage } from '@/components/admin/ui'
import { InquiryInbox } from '@/components/admin/InquiryInbox'

export default function InquiriesPage() {
  return (
    <AdminPage
      title="Inquiries"
      description="Every message from the website's contact, wholesale, farmer, events, careers and press forms. Work through new ones and mark them resolved."
    >
      <InquiryInbox />
    </AdminPage>
  )
}
