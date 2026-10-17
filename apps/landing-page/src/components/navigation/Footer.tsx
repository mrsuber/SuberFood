import Link from 'next/link'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import { site } from '@/lib/site'

const columns = [
  {
    title: 'Shop & Dine',
    links: [
      { name: 'Farm Shop', href: '/distribution/farm-products' },
      { name: 'Restaurants', href: '/distribution/restaurants' },
      { name: 'Menu', href: '/distribution/restaurants/menu' },
      { name: 'Locations', href: '/distribution/restaurants/locations' },
      { name: 'Book a Table', href: '/distribution/restaurants/reservations' },
    ],
  },
  {
    title: 'Our Value Chain',
    links: [
      { name: 'Farming', href: '/farming' },
      { name: 'Processing', href: '/processing' },
      { name: 'Distribution', href: '/distribution' },
      { name: 'Sustainability', href: '/sustainability' },
    ],
  },
  {
    title: 'Business',
    links: [
      { name: 'B2B Partners', href: '/distribution/partners' },
      { name: 'Wholesale', href: '/distribution/partners/wholesale' },
      { name: 'Supply as a Farmer', href: '/distribution/partners/partnerships' },
      { name: 'Business Inquiries', href: '/distribution/partners/contact' },
    ],
  },
  {
    title: 'Support',
    links: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQs', href: '/faq' },
      { name: 'Track Order', href: '/track-order' },
      { name: 'Returns & Refunds', href: '/returns' },
    ],
  },
]

const companyLinks = [
  { name: 'About Us', href: '/about' },
  { name: 'Careers', href: '/careers' },
  { name: 'Press', href: '/press' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
  { name: 'Cookie Policy', href: '/cookies' },
]

const socialLinks = [
  { name: 'Facebook', href: site.social.facebook },
  { name: 'Instagram', href: site.social.instagram },
  { name: 'LinkedIn', href: site.social.linkedin },
  { name: 'X', href: site.social.x },
].filter((s) => s.href)

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="col-span-2">
            <h3 className="text-white font-display font-bold text-2xl mb-4">{site.name}</h3>
            <p className="text-sm mb-6 text-gray-400">
              One connected value chain — our farms, processing lines, delivery network and restaurants —
              so every meal and every basket can be traced back to where it was grown.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <span>
                  {site.contact.address}, {site.contact.city}, {site.country}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <a href={`tel:${site.contact.phone.replace(/\s/g, '')}`} className="hover:text-primary-400">
                  {site.contact.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <a href={`mailto:${site.contact.email}`} className="hover:text-primary-400">
                  {site.contact.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span>{site.contact.hours}</span>
              </div>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-semibold mb-4">{col.title}</h4>
              <ul className="space-y-2 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-primary-400 transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {companyLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-primary-400 transition-colors">
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} {site.name}. All rights reserved. Proudly built in {site.country}.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">We accept: {site.paymentMethods.slice(0, 2).join(' · ')}</span>
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-400 transition-colors"
                >
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
