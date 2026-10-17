import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageShell } from '@/components/marketing'
import { OperationDetail } from '@/components/marketing/Operation'
import { farmingOperations } from '@/lib/content/operations'

export const dynamicParams = false

export function generateStaticParams() {
  return farmingOperations.map((op) => ({ operation: op.slug }))
}

export function generateMetadata({ params }: { params: { operation: string } }): Metadata {
  const op = farmingOperations.find((o) => o.slug === params.operation)
  return op ? { title: `${op.title} | SuberFood`, description: op.short } : {}
}

export default function FarmingOperationPage({ params }: { params: { operation: string } }) {
  const op = farmingOperations.find((o) => o.slug === params.operation)
  if (!op) notFound()

  return (
    <PageShell>
      <OperationDetail op={op} parent={{ name: 'Farming', href: '/farming' }} siblings={farmingOperations} />
    </PageShell>
  )
}
