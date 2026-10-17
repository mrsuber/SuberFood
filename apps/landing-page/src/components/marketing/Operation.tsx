import Link from 'next/link'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { PageHero, Section, FeatureGrid, CtaBand, tones } from '@/components/marketing'
import { categoryLabels, type Operation } from '@/lib/content/operations'
import { cn } from '@/lib/utils'

export function OperationGrid({ operations, basePath }: { operations: Operation[]; basePath: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {operations.map((op) => {
        const t = tones[op.tone]
        return (
          <Link
            key={op.slug}
            href={`${basePath}/${op.slug}`}
            className="group rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-premium-lg transition-all overflow-hidden"
          >
            <div className={cn('p-8 bg-gradient-to-br to-white', t.soft)}>
              <div
                className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform',
                  t.icon
                )}
              >
                <op.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">{op.title}</h3>
              <p className="text-gray-600 mb-6">{op.short}</p>
              <ul className="grid grid-cols-2 gap-2 mb-6">
                {op.highlights.map((h) => (
                  <li key={h} className="flex items-center text-sm text-gray-700">
                    <span className={cn('w-1.5 h-1.5 rounded-full mr-2', t.dot)} />
                    {h}
                  </li>
                ))}
              </ul>
              <span className={cn('inline-flex items-center font-semibold gap-1 group-hover:gap-2 transition-all', t.text)}>
                Learn more <ArrowRight className="w-5 h-5" />
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export function OperationDetail({
  op,
  parent,
  siblings,
}: {
  op: Operation
  parent: { name: string; href: string }
  siblings: Operation[]
}) {
  const t = tones[op.tone]
  return (
    <>
      <PageHero
        tone={op.tone}
        eyebrow={parent.name}
        title={op.title}
        description={op.intro}
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: parent.name, href: parent.href },
        ]}
      >
        <Link
          href={`/distribution/farm-products?category=${op.shopCategories[0]}`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-gray-900 hover:bg-gray-100"
        >
          Shop {categoryLabels[op.shopCategories[0]]?.toLowerCase() || 'products'} <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/distribution/partners/wholesale"
          className="inline-flex items-center justify-center rounded-lg border-2 border-white px-6 py-3 font-semibold text-white hover:bg-white/10"
        >
          Buy in bulk
        </Link>
      </PageHero>

      <Section eyebrow="How we do it" title="Our practices" center={false}>
        <FeatureGrid features={op.practices} tone={op.tone} columns={4} />
      </Section>

      <Section muted eyebrow="Step by step" title="From start to your table" center={false}>
        <ol className="grid gap-6 md:grid-cols-4">
          {op.process.map((step, i) => (
            <li key={step.title} className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
              <span className={cn('inline-flex w-9 h-9 rounded-full items-center justify-center font-bold mb-4', t.icon)}>
                {i + 1}
              </span>
              <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-6">What comes out of it</h2>
            <ul className="space-y-3">
              {op.products.map((p) => (
                <li key={p} className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className={cn('w-5 h-5 flex-shrink-0', t.text)} /> {p}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-2">
              {op.shopCategories.map((c) => (
                <Link
                  key={c}
                  href={`/distribution/farm-products?category=${c}`}
                  className="rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-700 hover:border-primary-500 hover:text-primary-700"
                >
                  {categoryLabels[c] || c} →
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Explore the chain</h3>
            <ul className="space-y-2">
              {op.related && (
                <li>
                  <Link href={op.related.href} className="flex items-center justify-between rounded-lg bg-white px-4 py-3 hover:shadow-sm">
                    <span className="font-medium text-gray-900">{op.related.label}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                </li>
              )}
              {siblings
                .filter((s) => s.slug !== op.slug)
                .map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`${parent.href}/${s.slug}`}
                      className="flex items-center justify-between rounded-lg bg-white px-4 py-3 hover:shadow-sm"
                    >
                      <span className="font-medium text-gray-900">{s.title}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </Section>

      <CtaBand
        title={`Supplying a restaurant, hotel or shop?`}
        description="Get reliable, traceable supply at wholesale prices."
        primary={{ label: 'Request a wholesale quote', href: '/distribution/partners/wholesale' }}
        secondary={{ label: 'Supply us as a farmer', href: '/distribution/partners/partnerships' }}
      />
    </>
  )
}
