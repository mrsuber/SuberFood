import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageShell } from '@/components/marketing'
import { OperationDetail } from '@/components/marketing/Operation'
import { processingFacilities } from '@/lib/content/operations'

export const dynamicParams = false

export function generateStaticParams() {
  return processingFacilities.map((f) => ({ facility: f.slug }))
}

export function generateMetadata({ params }: { params: { facility: string } }): Metadata {
  const facility = processingFacilities.find((f) => f.slug === params.facility)
  return facility ? { title: `${facility.title} | SuberFood`, description: facility.short } : {}
}

export default function ProcessingFacilityPage({ params }: { params: { facility: string } }) {
  const facility = processingFacilities.find((f) => f.slug === params.facility)
  if (!facility) notFound()

  return (
    <PageShell>
      <OperationDetail
        op={facility}
        parent={{ name: 'Processing', href: '/processing' }}
        siblings={processingFacilities}
      />
    </PageShell>
  )
}
