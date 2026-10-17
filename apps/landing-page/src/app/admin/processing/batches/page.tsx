'use client'

import { PlannedModule } from '@/components/admin/ui'

export default function ProductionBatchesPage() {
  return (
    <PlannedModule
      title="Production Batches"
      phase="Phase 1 · Farm-to-processing"
      summary="Production batches will record what goes into each processing run (raw batches from farms) and what comes out (finished, packed products), so a can of sardines or a bottle of milk can be traced to its source batches."
      planned={[
        'Plan and schedule production runs per facility',
        'Consume raw farm batches as inputs',
        'Record yields, losses and packaging',
        'Generate finished-goods batch numbers and labels',
        'Link finished batches to shop products and orders',
        'HACCP checkpoints per batch',
      ]}
      today={[
        { label: 'Raw batches (harvests)', href: '/admin/farming/harvests', description: 'Batches received from farms, with batch numbers' },
        { label: 'Kitchen bulk preparation', href: '/admin/inventory/prepare', description: 'Preparation batches for restaurant kitchens' },
        { label: 'Quality control', href: '/admin/processing/quality', description: 'Approve or reject incoming batches' },
      ]}
    />
  )
}
