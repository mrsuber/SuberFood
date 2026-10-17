import type { Metadata } from 'next'
import { Thermometer, ShieldCheck, ClipboardCheck, FlaskConical, Recycle, Package } from 'lucide-react'
import { PageShell, PageHero, Section, FeatureGrid, StatBand, CtaBand } from '@/components/marketing'
import { OperationGrid } from '@/components/marketing/Operation'
import { processingFacilities } from '@/lib/content/operations'

export const metadata: Metadata = {
  title: 'Processing | SuberFood',
  description: 'Sardine, milk, meat and vegetable processing — turning harvests into safe, long-lasting food.',
}

const standards = [
  { icon: ShieldCheck, title: 'Hygiene', description: 'Cleaning schedules, protective equipment and trained staff on every line.' },
  { icon: Thermometer, title: 'Temperature control', description: 'Fish, meat and dairy are kept cold from receiving to dispatch.' },
  { icon: FlaskConical, title: 'Quality checks', description: 'Raw materials and finished products are checked before they move on.' },
  { icon: ClipboardCheck, title: 'Batch records', description: 'Each batch records its source, date and quantity for traceability.' },
  { icon: Recycle, title: 'Less waste', description: 'Surplus harvest is processed instead of thrown away.' },
  { icon: Package, title: 'Protective packing', description: 'Packed and labelled to keep food safe in storage and transport.' },
]

export default function ProcessingPage() {
  return (
    <PageShell>
      <PageHero
        tone="indigo"
        eyebrow="Processing"
        title="Turning harvests into safe, lasting food"
        description="Our processing units clean, preserve and pack what our farms produce — fish, milk, meat and vegetables — so good food lasts longer and reaches more people without losing quality."
      />

      <Section>
        <OperationGrid operations={processingFacilities} basePath="/processing" />
      </Section>

      <StatBand
        tone="indigo"
        stats={[
          { value: '4', label: 'Processing lines' },
          { value: 'Batch', label: 'Level records' },
          { value: 'Cold', label: 'Chain for perishables' },
          { value: 'Farm-fed', label: 'Raw materials' },
        ]}
      />

      <Section muted eyebrow="Standards" title="How we keep it safe">
        <FeatureGrid features={standards} tone="indigo" />
      </Section>

      <CtaBand
        title="Need processed products in volume?"
        description="Smoked fish, dairy, meat cuts and prepared vegetables for your business."
        primary={{ label: 'Request a wholesale quote', href: '/distribution/partners/wholesale' }}
        secondary={{ label: 'Shop online', href: '/distribution/farm-products' }}
      />
    </PageShell>
  )
}
