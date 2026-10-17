import type { Metadata } from 'next'
import Link from 'next/link'
import { PageShell, PageHero, Prose } from '@/components/marketing'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Returns & Refunds | SuberFood',
  description: 'Our freshness guarantee and how returns, refunds and cancellations work at SuberFood.',
}

export default function ReturnsPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Support"
        title="Returns & refunds"
        description="Fresh food should arrive fresh. If something is not right, we will make it right."
      />
      <Prose updated="October 2026">
        <h2>Our freshness guarantee</h2>
        <p>
          If a product arrives damaged, spoiled, or not as described, tell us within <strong>24 hours of delivery</strong>{' '}
          and we will replace it or refund it — your choice.
        </p>

        <h2>How to report a problem</h2>
        <ul>
          <li>
            Contact us via our <Link href="/contact">contact page</Link>, by phone ({site.contact.phone}) or by email (
            {site.contact.email}).
          </li>
          <li>Include your order number and, if possible, a photo of the product.</li>
          <li>For chilled or frozen items, please keep the product refrigerated until we resolve the issue.</li>
        </ul>

        <h2>Refunds</h2>
        <ul>
          <li>Approved refunds are credited to your SuberFood wallet straight away, so you can use them on your next order.</li>
          <li>If you prefer, we can return the money to your mobile money account. This usually takes 1–3 business days.</li>
          <li>Cash-on-delivery orders are refunded to your wallet or mobile money.</li>
        </ul>

        <h2>Cancellations</h2>
        <ul>
          <li>You can cancel free of charge before your order is prepared or dispatched.</li>
          <li>
            For <strong>pre-orders</strong>, you can decline the confirmed price at no cost. Once you accept the price and
            we have sourced the product, cancellations may not be possible.
          </li>
          <li>Wholesale and B2B orders follow the terms in your supply agreement.</li>
        </ul>

        <h2>What we cannot accept back</h2>
        <p>
          For food safety reasons we cannot resell returned perishable products, so we do not ask you to send them back.
          We may decline repeated claims that appear to be abusive.
        </p>
      </Prose>
    </PageShell>
  )
}
