'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BadgeCheck, Package, Truck, Banknote, Phone, MessageCircle } from 'lucide-react'
import { AdminPage, Panel, StatCard, StatusPill, Loading, ErrorNote, EmptyState, useAdminFetch, sendJson, humanize } from '@/components/admin/ui'
import { FarmerForm } from '@/components/admin/FarmerForm'
import { FarmSupplyForm } from '@/components/admin/FarmSupplyForm'
import { SupplyTable } from '@/components/admin/SupplyTable'

const xaf = (n: any) => `${Math.round(Number(n) || 0).toLocaleString('fr-FR')} XAF`

export default function FarmerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data, loading, error, reload } = useAdminFetch<{ farmer: any }>(`/api/admin/farmers/${id}`)
  const supplies = useAdminFetch<{ data: any[] }>(`/api/admin/farm-supplies?farmerId=${id}`)
  const [tab, setTab] = useState<'overview' | 'edit' | 'supply'>('overview')
  const farmer = data?.farmer

  if (loading && !farmer) return <AdminPage title="Farmer"><Loading /></AdminPage>
  if (error || !farmer)
    return (
      <AdminPage title="Farmer" back={{ label: 'All farmers', href: '/admin/farmers' }}>
        <ErrorNote message={error || 'Farmer not found'} />
      </AdminPage>
    )

  const verify = async (verified: boolean) => {
    await sendJson(`/api/admin/farmers/${id}/verify`, 'POST', { verified })
    reload()
  }
  const remove = async () => {
    if (!confirm(`Delete ${farmer.name}? Their supply history will be deleted too.`)) return
    await sendJson(`/api/admin/farmers/${id}`, 'DELETE')
    router.push('/admin/farmers')
  }
  const refreshAll = () => {
    reload()
    supplies.reload()
  }
  const unpaid = (supplies.data?.data || []).reduce((s, x) => s + Math.max(0, Number(x.totalCost) - Number(x.paidAmount)), 0)
  const phoneDigits = farmer.phone?.replace(/\D/g, '')

  return (
    <AdminPage
      title={farmer.businessName || farmer.name}
      back={{ label: 'All farmers', href: '/admin/farmers' }}
      description={`${humanize(farmer.farmerType)} · ${[farmer.village, farmer.district, farmer.region].filter(Boolean).join(', ')}`}
      actions={
        <>
          {farmer.isVerified ? (
            <button onClick={() => verify(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Revoke verification
            </button>
          ) : (
            <button onClick={() => verify(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
              <BadgeCheck className="w-4 h-4" /> Verify farmer
            </button>
          )}
          <button onClick={remove} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
            Delete
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Status" value={<StatusPill value={farmer.status} />} icon={BadgeCheck} tone="gray" />
        <StatCard label="Total supplied" value={Number(farmer.totalSupplied).toLocaleString('fr-FR')} icon={Truck} tone="blue" />
        <StatCard label="Paid to farmer" value={xaf(farmer.totalRevenue)} icon={Banknote} />
        <StatCard label="Owed" value={xaf(unpaid)} icon={Banknote} tone="amber" />
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {(['overview', 'supply', 'edit'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${tab === t ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            {t === 'overview' ? 'Overview' : t === 'supply' ? 'Record delivery' : 'Edit details'}
          </button>
        ))}
      </div>

      {tab === 'edit' && (
        <Panel>
          <FarmerForm
            isEdit
            initial={farmer}
            submitLabel="Save changes"
            onSubmit={async (values) => {
              await sendJson(`/api/admin/farmers/${id}`, 'PATCH', values)
              setTab('overview')
              reload()
            }}
          />
        </Panel>
      )}

      {tab === 'supply' && (
        <Panel title="Record a delivery from this farmer">
          <FarmSupplyForm farmerId={id} onSaved={refreshAll} />
        </Panel>
      )}

      {tab === 'overview' && (
        <>
          <div className="grid lg:grid-cols-3 gap-6">
            <Panel title="Contact & payment">
              <div className="space-y-2 text-sm">
                <a href={`tel:${farmer.phone}`} className="flex gap-2 text-primary-700 hover:underline"><Phone className="w-4 h-4" /> {farmer.phone}</a>
                {phoneDigits && (
                  <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener noreferrer" className="flex gap-2 text-primary-700 hover:underline">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                )}
                {farmer.email && <p className="text-gray-700">{farmer.email}</p>}
                <p className="text-gray-700">{farmer.address}</p>
                <p className="pt-2 text-gray-500">Mobile money: <span className="text-gray-900">{farmer.mobileMoneyNumber ? `${farmer.mobileMoneyNumber} (${farmer.mobileMoneyProvider})` : '—'}</span></p>
                {farmer.bankName && <p className="text-gray-500">Bank: <span className="text-gray-900">{farmer.bankName} {farmer.bankAccountNumber}</span></p>}
              </div>
            </Panel>
            <Panel title="Farm" className="lg:col-span-2">
              <dl className="grid sm:grid-cols-3 gap-4 text-sm">
                <div><dt className="text-gray-500">Size</dt><dd className="font-medium">{farmer.farmSize ? `${Number(farmer.farmSize)} ha` : '—'}</dd></div>
                <div><dt className="text-gray-500">Organic</dt><dd className="font-medium">{farmer.isOrganic ? 'Yes' : 'No'}</dd></div>
                <div><dt className="text-gray-500">Certified</dt><dd className="font-medium">{farmer.isCertified ? farmer.certifications?.join(', ') || 'Yes' : 'No'}</dd></div>
                <div className="sm:col-span-3"><dt className="text-gray-500">Main products</dt><dd className="font-medium">{farmer.mainCrops?.join(', ') || '—'}</dd></div>
                {farmer.specialties && <div className="sm:col-span-3"><dt className="text-gray-500">Specialties</dt><dd>{farmer.specialties}</dd></div>}
                {farmer.notes && <div className="sm:col-span-3"><dt className="text-gray-500">Notes</dt><dd className="whitespace-pre-line">{farmer.notes}</dd></div>}
              </dl>
            </Panel>
          </div>

          <Panel title="Products sourced from this farmer">
            {farmer.products?.length ? (
              <ul className="flex flex-wrap gap-2">
                {farmer.products.map((p: any) => (
                  <li key={p.id} className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm">
                    <Package className="w-3.5 h-3.5 text-gray-500" /> {p.name}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No shop products linked yet" description="Set this farmer as the source on a product to show it here." />
            )}
          </Panel>

          <Panel title="Delivery history">
            {supplies.loading ? (
              <Loading />
            ) : (supplies.data?.data || []).length === 0 ? (
              <EmptyState title="No deliveries yet" />
            ) : (
              <SupplyTable supplies={supplies.data!.data} onChange={refreshAll} />
            )}
          </Panel>
        </>
      )}
    </AdminPage>
  )
}
