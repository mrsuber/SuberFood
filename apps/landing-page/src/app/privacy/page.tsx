import type { Metadata } from 'next'
import { PageShell, PageHero, Prose } from '@/components/marketing'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Privacy Policy | SuberFood',
  description: 'How SuberFood collects, uses and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <PageShell>
      <PageHero tone="slate" eyebrow="Legal" title="Privacy Policy" />
      <Prose updated="October 2026">
        <p>
          This policy explains what personal information {site.name} (&quot;we&quot;, &quot;us&quot;) collects when you use{' '}
          {site.domain}, order from us, or work with us, and how we use and protect it.
        </p>

        <h2>Information we collect</h2>
        <ul>
          <li><strong>Account and contact details:</strong> name, phone number(s), email address, delivery addresses.</li>
          <li><strong>Orders and payments:</strong> items ordered, amounts, payment method and mobile money transaction references. We do not store your mobile money PIN.</li>
          <li><strong>Wallet and referrals:</strong> wallet balance and transactions, referral codes, referral relationships and earnings.</li>
          <li><strong>Verification documents:</strong> if you verify your identity for the referral program, the ID and photo you upload.</li>
          <li><strong>Delivery data:</strong> delivery address and, for drivers, location during active deliveries.</li>
          <li><strong>Technical data:</strong> device and browser information and cookies needed to keep you signed in.</li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>To process, deliver and support your orders and reservations.</li>
          <li>To process payments, refunds, wallet top-ups and withdrawals.</li>
          <li>To run the referral program and prevent fraud and abuse, including self-referrals and duplicate accounts.</li>
          <li>To contact you about your orders and, if you agree, about offers.</li>
          <li>To improve our products, operations and services.</li>
        </ul>

        <h2>Sharing</h2>
        <p>We do not sell your personal information. We share it only with:</p>
        <ul>
          <li>Payment providers (such as MTN Mobile Money and Orange Money) to process your payments.</li>
          <li>Our delivery staff, who see the details needed to deliver your order.</li>
          <li>Service providers who host and operate our systems on our behalf.</li>
          <li>Authorities, where the law requires it.</li>
        </ul>

        <h2>Retention and security</h2>
        <p>
          We keep information for as long as needed to provide our services and meet legal and accounting obligations.
          Access to personal data is limited to staff who need it, and passwords are stored in hashed form.
        </p>

        <h2>Your rights</h2>
        <p>
          You can ask to access, correct or delete your personal information, or to stop marketing messages. Contact us at{' '}
          <a href={`mailto:${site.contact.privacyEmail}`}>{site.contact.privacyEmail}</a>.
        </p>

        <h2>Changes</h2>
        <p>We may update this policy. Significant changes will be announced on this page.</p>
      </Prose>
    </PageShell>
  )
}
