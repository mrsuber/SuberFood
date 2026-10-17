import type { Metadata } from 'next'
import Link from 'next/link'
import { PageShell, PageHero, Prose } from '@/components/marketing'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Terms of Service | SuberFood',
  description: 'The terms that apply when you use SuberFood services.',
}

export default function TermsPage() {
  return (
    <PageShell>
      <PageHero tone="slate" eyebrow="Legal" title="Terms of Service" />
      <Prose updated="October 2026">
        <p>
          These terms apply when you use {site.domain}, place an order, make a reservation, or use the SuberFood wallet
          or referral program. By using our services you agree to them.
        </p>

        <h2>Accounts</h2>
        <p>
          Keep your login details private and your contact information accurate. One person may hold one account. We
          may suspend accounts used for fraud or abuse.
        </p>

        <h2>Orders and prices</h2>
        <ul>
          <li>Prices are shown in {site.currency} and include applicable taxes unless stated otherwise.</li>
          <li>Delivery fees depend on your delivery zone and are shown before you confirm.</li>
          <li>
            Pre-orders (bookings) are requests. The final price is confirmed after sourcing, and the order is only
            binding once you accept that price.
          </li>
          <li>Product availability can change; we will contact you if we cannot fulfil part of an order.</li>
        </ul>

        <h2>Payment</h2>
        <p>
          We accept {site.paymentMethods.join(', ')}. Customers with repeated unpaid or refused deliveries may be asked
          to pay in advance for future orders.
        </p>

        <h2>Wallet</h2>
        <ul>
          <li>Your wallet balance can be used for purchases on SuberFood.</li>
          <li>Withdrawal requests are reviewed and processed by our team.</li>
          <li>We may correct balances that result from errors or fraud.</li>
        </ul>

        <h2>Referral program</h2>
        <ul>
          <li>Earning referral rewards requires identity verification.</li>
          <li>Self-referrals, fake accounts and other abuse are not allowed and may lead to cancelled rewards and suspension.</li>
          <li>We may change or end the program; earned and confirmed rewards will be honoured.</li>
        </ul>

        <h2>Returns and refunds</h2>
        <p>
          See our <Link href="/returns">Returns & Refunds policy</Link>.
        </p>

        <h2>Liability</h2>
        <p>
          We take great care with the quality and safety of our food. To the extent permitted by law, our liability is
          limited to the value of the affected order.
        </p>

        <h2>Governing law</h2>
        <p>These terms are governed by the laws of the Republic of {site.country}.</p>

        <h2>Contact</h2>
        <p>
          Questions about these terms? <Link href="/contact">Contact us</Link>.
        </p>
      </Prose>
    </PageShell>
  )
}
