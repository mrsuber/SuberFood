'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { AdminPage, Panel, StatCard, Loading, ErrorNote, EmptyState, inputClass, useAdminFetch } from '@/components/admin/ui'
import { SupplyTable } from '@/components/admin/SupplyTable'

export default function QualityControlPage() {
  const [status, setStatus] = useState('QUALITY_CHECK')
  const { data, loading, error, reload } = useAdminFetch<{ data: any[] }>(`/api/admin/farm-supplies?status=${status}`)
  const counts = useAdminFetch<{ data: any[] }>('/api/admin/farm-supplies', [data])
  const all = counts.data?.data || []

  return (
    <AdminPage
      title="Quality Control"
      description="Incoming batches rated 2 stars or lower are held for quality check. Approve them for sale or reject them."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Awaiting check" value={all.filter((s) => s.status === 'QUALITY_CHECK').length} icon={AlertTriangle} tone="amber" />
        <StatCard label="Approved" value={all.filter((s) => s.status === 'APPROVED').length} icon={CheckCircle} />
        <StatCard label="Rejected" value={all.filter((s) => s.status === 'REJECTED').length} icon={XCircle} tone="red" />
      </div>
      <Panel>
        <select className={`${inputClass} w-auto`} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="QUALITY_CHECK">Awaiting check</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="all">All batches</option>
        </select>
      </Panel>
      {error && <ErrorNote message={error} />}
      <Panel>
        {loading ? (
          <Loading />
        ) : (data?.data || []).length === 0 ? (
          <EmptyState title={status === 'QUALITY_CHECK' ? 'No batches waiting for quality check' : 'No batches'} />
        ) : (
          <SupplyTable supplies={data!.data} onChange={reload} showQualityActions />
        )}
      </Panel>
    </AdminPage>
  )
}
