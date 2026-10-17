'use client'

import { useRouter } from 'next/navigation'
import { AdminPage, Panel, sendJson } from '@/components/admin/ui'
import { EquipmentForm } from '@/components/admin/EquipmentForm'

export default function NewEquipmentPage() {
  const router = useRouter()
  return (
    <AdminPage title="Add Equipment" back={{ label: 'All equipment', href: '/admin/equipment' }}>
      <Panel>
        <EquipmentForm
          submitLabel="Add equipment"
          onSubmit={async (values) => {
            const created = await sendJson('/api/admin/equipment', 'POST', values)
            router.push(created?.equipment?.id ? `/admin/equipment/${created.equipment.id}` : '/admin/equipment')
          }}
        />
      </Panel>
    </AdminPage>
  )
}
