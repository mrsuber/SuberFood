'use client'

import { useRouter } from 'next/navigation'
import { AdminPage, Panel, sendJson } from '@/components/admin/ui'
import { FarmerForm } from '@/components/admin/FarmerForm'

export default function NewFarmerPage() {
  const router = useRouter()
  return (
    <AdminPage
      title="Register Farmer"
      back={{ label: 'All farmers', href: '/admin/farmers' }}
      description="Add a partner farmer or cooperative to the supplier network. New farmers start as pending verification until a farm visit."
    >
      <Panel>
        <FarmerForm
          submitLabel="Register farmer"
          onSubmit={async (values) => {
            const res = await sendJson('/api/admin/farmers', 'POST', values)
            router.push(res.farmer?.id ? `/admin/farmers/${res.farmer.id}` : '/admin/farmers')
          }}
        />
      </Panel>
    </AdminPage>
  )
}
