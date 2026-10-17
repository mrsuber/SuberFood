import type { Metadata } from 'next'
import Link from 'next/link'
import { PageShell, PageHero, Section, FaqList, CtaBand } from '@/components/marketing'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | SuberFood',
  description: 'Answers about ordering, delivery, payment, pre-orders, the SuberFood wallet and referrals.',
}

const groups: { id: string; title: string; items: { q: string; a: React.ReactNode }[] }[] = [
  {
    id: 'ordering',
    title: 'Ordering',
    items: [
      {
        q: 'Do I need an account to order?',
        a: 'No. You can check out as a guest with your phone number. Creating an account lets you see your order history, use the SuberFood wallet and earn referral rewards.',
      },
      {
        q: 'What is the difference between retail and bulk prices?',
        a: 'Retail prices are per kilogram, piece or litre for household quantities. Bulk prices apply to larger units such as baskets, crates or bags, and are cheaper per unit — ideal for big families, restaurants and shops.',
      },
      {
        q: 'What does "Pre-order" mean?',
        a: (
          <>
            Some products are harvested or sourced on demand. When an item is out of stock you can book it. We source it
            from our farms or partner farmers, confirm the final price with you, and only then ask you to confirm the
            order. You can accept or decline the confirmed price.
          </>
        ),
      },
      {
        q: 'Can I change or cancel my order?',
        a: (
          <>
            Contact us as soon as possible with your order number. Orders that have not been prepared or dispatched can
            usually be changed or cancelled. See our <Link href="/returns">returns & refunds policy</Link>.
          </>
        ),
      },
    ],
  },
  {
    id: 'delivery',
    title: 'Delivery & pickup',
    items: [
      {
        q: 'Where do you deliver?',
        a: `We deliver within our delivery zones in and around ${site.serviceCities.join(', ')}. Your delivery fee is calculated at checkout based on your zone. You can also choose pickup at our distribution center in ${site.contact.city}.`,
      },
      {
        q: 'How do I track my delivery?',
        a: (
          <>
            When your order is dispatched you receive a tracking code. Enter it on our{' '}
            <Link href="/track-order">order tracking page</Link> to see the status, your driver and their live
            location.
          </>
        ),
      },
      {
        q: 'How do you keep fish, meat and dairy fresh?',
        a: 'Perishable products are stored cold after processing and packed for delivery to keep the cold chain as intact as possible. We plan routes so chilled items spend as little time on the road as possible.',
      },
    ],
  },
  {
    id: 'payment',
    title: 'Payment',
    items: [
      {
        q: 'Which payment methods do you accept?',
        a: `${site.paymentMethods.join(', ')}. Mobile money payments are confirmed automatically on your phone.`,
      },
      {
        q: 'My mobile money payment is pending — what should I do?',
        a: 'Check your phone for the payment prompt and approve it. If you approved it and the order still shows pending after a few minutes, contact us with your order number and the mobile money transaction ID.',
      },
      {
        q: 'What is the SuberFood wallet?',
        a: (
          <>
            Your wallet holds a balance you can use at checkout — fully or partly. You can top it up with mobile money,
            and referral rewards and refunds are paid into it. Manage it from <Link href="/wallet">My Wallet</Link>.
          </>
        ),
      },
    ],
  },
  {
    id: 'referrals',
    title: 'Referrals',
    items: [
      {
        q: 'How does the referral program work?',
        a: (
          <>
            Share your referral code. People you refer get a discount on their orders, and you earn a share of the profit on
            their orders, paid into your wallet. Verify your identity to start earning. Details are on your{' '}
            <Link href="/referrals">Referrals page</Link>.
          </>
        ),
      },
      {
        q: 'Can I refer myself?',
        a: 'No. Self-referrals and duplicate accounts are detected automatically and can lead to suspended referral rewards.',
      },
    ],
  },
  {
    id: 'business',
    title: 'Businesses & farmers',
    items: [
      {
        q: 'Do you supply restaurants, hotels and shops?',
        a: (
          <>
            Yes. We offer wholesale supply with bulk pricing and scheduled deliveries. Visit{' '}
            <Link href="/distribution/partners/wholesale">Wholesale</Link> to request a quote.
          </>
        ),
      },
      {
        q: 'I am a farmer. Can I sell to SuberFood?',
        a: (
          <>
            Yes. We work with verified farmers across Cameroon. Apply on our{' '}
            <Link href="/distribution/partners/partnerships">partnerships page</Link> and our sourcing team will
            contact you.
          </>
        ),
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Help center"
        title="Frequently asked questions"
        description="Everything you need to know about ordering, delivery, payment and working with SuberFood."
      />
      <Section>
        <div className="grid lg:grid-cols-4 gap-10">
          <nav className="hidden lg:block">
            <ul className="sticky top-28 space-y-2 text-sm">
              {groups.map((g) => (
                <li key={g.id}>
                  <a href={`#${g.id}`} className="text-gray-600 hover:text-primary-700 font-medium">
                    {g.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="lg:col-span-3 space-y-12">
            {groups.map((g) => (
              <div key={g.id} id={g.id} className="scroll-mt-28">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">{g.title}</h2>
                <FaqList items={g.items} />
              </div>
            ))}
          </div>
        </div>
      </Section>
      <CtaBand
        title="Still have a question?"
        description="Our team replies within one business day."
        primary={{ label: 'Contact us', href: '/contact' }}
        secondary={{ label: 'Track an order', href: '/track-order' }}
      />
    </PageShell>
  )
}
