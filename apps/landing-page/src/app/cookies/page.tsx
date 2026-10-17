import type { Metadata } from 'next'
import { PageShell, PageHero, Prose } from '@/components/marketing'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Cookie Policy | SuberFood',
  description: 'How SuberFood uses cookies and local storage.',
}

export default function CookiesPage() {
  return (
    <PageShell>
      <PageHero tone="slate" eyebrow="Legal" title="Cookie Policy" />
      <Prose updated="October 2026">
        <p>
          Cookies are small files stored by your browser. {site.name} uses only what is needed to run the website — we do
          not use advertising cookies.
        </p>

        <h2>What we use</h2>
        <ul>
          <li>
            <strong>Sign-in cookies</strong> keep you logged in securely and protect forms against misuse.
          </li>
          <li>
            <strong>Local storage</strong> remembers your shopping cart on your device, so it is still there when you come
            back.
          </li>
        </ul>

        <h2>Managing cookies</h2>
        <p>
          You can clear or block cookies in your browser settings. If you block sign-in cookies, you will not be able to
          log in or check out with an account.
        </p>

        <h2>Questions</h2>
        <p>
          Email <a href={`mailto:${site.contact.privacyEmail}`}>{site.contact.privacyEmail}</a>.
        </p>
      </Prose>
    </PageShell>
  )
}
