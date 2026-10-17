'use client'

import { Truck, Banknote, Star, Users } from 'lucide-react'
import { AdminPage, Panel, StatCard, Loading, ErrorNote, EmptyState, LinkButton, useAdminFetch } from '@/components/admin/ui'
import { FarmSupplyForm } from '@/components/admin/FarmSupplyForm'
import { SupplyTable } from '@/components/admin/SupplyTable'

const xaf = (n: number) => `${Math.round(n).toLocaleString('fr-FR')} XAF`

export default function SupplyIntakePage() {
  const { data, loading, error, reload } = useAdminFetch<{ data: any[]; stats: any }>('/api/admin/farm-supplies')
  const recent = (data?.data || []).slice(0, 10)
  const s = data?.stats

  return (
    <AdminPage
      title="Harvest & Supply"
      description="Record every delivery from our farms and partner farmers. Each delivery gets a batch number that links the product back to the farmer — the foundation of farm-to-table traceability."
      actions={
        <>
          <LinkButton href="/admin/farming/harvests" variant="outline">All harvests</LinkButton>
          <LinkButton href="/admin/farming/supply-chain" variant="outline">Supply chain</LinkButton>
        </>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Deliveries recorded" value={s?.count ?? '—'} icon={Truck} />
        <StatCard label="Supplying farmers" value={s?.farmers ?? '—'} icon={Users} tone="blue" />
        <StatCard label="Owed to farmers" value={s ? xaf(s.unpaid) : '—'} icon={Banknote} tone="amber" />
        <StatCard label="Average quality" value={s?.averageQuality ? `${s.averageQuality.toFixed(1)} / 5` : '—'} icon={Star} tone="gray" />
      </div>
      <Panel title="Record a delivery">
        <FarmSupplyForm onSaved={reload} />
      </Panel>
      <Panel title="Latest deliveries">
        {error && <ErrorNote message={error} />}
        {loading ? <Loading /> : recent.length === 0 ? <EmptyState title="No deliveries recorded yet" /> : <SupplyTable supplies={recent} onChange={reload} />}
      </Panel>
    </AdminPage>
  )
}
