import type { Metadata } from 'next'
import { Sprout, Droplets, Bug, Recycle, HeartPulse, Users } from 'lucide-react'
import { PageShell, PageHero, Section, FeatureGrid, StatBand, CtaBand } from '@/components/marketing'
import { OperationGrid } from '@/components/marketing/Operation'
import { farmingOperations } from '@/lib/content/operations'

export const metadata: Metadata = {
  title: 'Farming | SuberFood',
  description: 'Fish, poultry, livestock and crop farming — the first link in the SuberFood farm-to-table chain.',
}

const principles = [
  { icon: Sprout, title: 'Soil health', description: 'Crop rotation and composting keep our land productive for the long term.' },
  { icon: Droplets, title: 'Water care', description: 'Efficient irrigation and monitored fish ponds.' },
  { icon: Bug, title: 'Careful inputs', description: 'Pest and disease prevention first; inputs only where they are needed.' },
  { icon: HeartPulse, title: 'Animal welfare', description: 'Space, clean water, good feed and veterinary care for every animal.' },
  { icon: Recycle, title: 'Circular farming', description: 'Manure becomes fertiliser and crop residue becomes feed or compost.' },
  { icon: Users, title: 'Partner farmers', description: 'We buy from verified smallholders and pay fairly and on time.' },
]

export default function FarmingPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Farming"
        title="Where every SuberFood product begins"
        description="We raise fish, poultry and livestock and grow crops on our own farms — and source from a growing network of verified Cameroonian farmers. Knowing the farm is the first step to trusting the food."
      />

      <Section>
        <OperationGrid operations={farmingOperations} basePath="/farming" />
      </Section>

      <StatBand
        stats={[
          { value: '4', label: 'Farming operations' },
          { value: 'Own + partner', label: 'Farms supplying us' },
          { value: 'To order', label: 'Harvest planning' },
          { value: 'Traceable', label: 'From farm to fork' },
        ]}
      />

      <Section muted eyebrow="Our principles" title="How we farm">
        <FeatureGrid features={principles} />
      </Section>

      <CtaBand
        title="Are you a farmer?"
        description="Sell your harvest to a buyer who collects, pays fairly and pays on time."
        primary={{ label: 'Become a supplier', href: '/distribution/partners/partnerships' }}
        secondary={{ label: 'Shop farm products', href: '/distribution/farm-products' }}
      />
    </PageShell>
  )
}
