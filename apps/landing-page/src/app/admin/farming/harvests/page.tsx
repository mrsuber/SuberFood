'use client'

import { useState } from 'react'
import { AdminPage, Panel, Loading, ErrorNote, EmptyState, LinkButton, inputClass, useAdminFetch } from '@/components/admin/ui'
import { SupplyTable } from '@/components/admin/SupplyTable'

export default function HarvestsPage() {
  const [search, setSearch] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('all')
  const params = new URLSearchParams({ paymentStatus, ...(search ? { search } : {}) })
  const { data, loading, error, reload } = useAdminFetch<{ data: any[] }>(`/api/admin/farm-supplies?${params}`)

  return (
    <AdminPage
      title="Harvests"
      back={{ label: 'Harvest & Supply', href: '/admin/farming/supply' }}
      description="Every batch received from farms, newest first."
      actions={<LinkButton href="/admin/farming/supply">Record delivery</LinkButton>}
    >
      <Panel>
        <div className="flex flex-wrap gap-3">
          <input className={`${inputClass} flex-1 min-w-[220px]`} placeholder="Search batch number, farmer or product" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className={`${inputClass} w-auto`} value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
            <option value="all">All payments</option>
            <option value="PENDING">Unpaid</option>
            <option value="PARTIAL">Partially paid</option>
            <option value="PAID">Paid</option>
          </select>
        </div>
      </Panel>
      {error && <ErrorNote message={error} />}
      <Panel>
        {loading ? <Loading /> : (data?.data || []).length === 0 ? <EmptyState title="No harvests match" /> : <SupplyTable supplies={data!.data} onChange={reload} />}
      </Panel>
    </AdminPage>
  )
}
