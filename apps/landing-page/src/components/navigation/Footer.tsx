import Link from 'next/link'
import { Mail, Phone, MapPin, Globe } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-display font-bold text-2xl mb-4">SuberFood</h3>
            <p className="text-sm mb-6 text-gray-400">
              Complete farm-to-table transparency. Experience fresh, sustainable,
              and traceable food from our integrated supply chain.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-primary-500" />
                <span>123 Farm Road, Agricultural District</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary-500" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary-500" />
                <span>info@suberfoods.com</span>
              </div>
            </div>
          </div>

          {/* Distribution */}
          <div>
            <h4 className="text-white font-semibold mb-4">Distribution</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/distribution/restaurants" className="hover:text-primary-400 transition-colors">
                  Restaurants
                </Link>
              </li>
              <li>
                <Link href="/distribution/restaurants/menu" className="hover:text-primary-400 transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/distribution/restaurants/locations" className="hover:text-primary-400 transition-colors">
                  Locations
                </Link>
              </li>
              <li>
                <Link href="/distribution/retail" className="hover:text-primary-400 transition-colors">
                  Retail & E-commerce
                </Link>
              </li>
              <li>
                <Link href="/distribution/partners" className="hover:text-primary-400 transition-colors">
                  B2B Partners
                </Link>
              </li>
            </ul>
          </div>

          {/* Processing */}
          <div>
            <h4 className="text-white font-semibold mb-4">Processing</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/processing/sardine" className="hover:text-primary-400 transition-colors">
                  Sardine Processing
                </Link>
              </li>
              <li>
                <Link href="/processing/milk" className="hover:text-primary-400 transition-colors">
                  Milk Processing
                </Link>
              </li>
              <li>
                <Link href="/processing/meat" className="hover:text-primary-400 transition-colors">
                  Meat Processing
                </Link>
              </li>
              <li>
                <Link href="/processing/vegetables" className="hover:text-primary-400 transition-colors">
                  Vegetables
                </Link>
              </li>
            </ul>
          </div>

          {/* Farming */}
          <div>
            <h4 className="text-white font-semibold mb-4">Farming</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/farming/aquaculture" className="hover:text-primary-400 transition-colors">
                  Fish Farming
                </Link>
              </li>
              <li>
                <Link href="/farming/poultry" className="hover:text-primary-400 transition-colors">
                  Poultry
                </Link>
              </li>
              <li>
                <Link href="/farming/livestock" className="hover:text-primary-400 transition-colors">
                  Livestock
                </Link>
              </li>
              <li>
                <Link href="/farming/crops" className="hover:text-primary-400 transition-colors">
                  Crop Farming
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Additional Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-800">
          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
              <li><Link href="/sustainability" className="hover:text-primary-400 transition-colors">Sustainability</Link></li>
              <li><Link href="/careers" className="hover:text-primary-400 transition-colors">Careers</Link></li>
              <li><Link href="/press" className="hover:text-primary-400 transition-colors">Press</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="hover:text-primary-400 transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-primary-400 transition-colors">FAQs</Link></li>
              <li><Link href="/track-order" className="hover:text-primary-400 transition-colors">Track Order</Link></li>
              <li><Link href="/returns" className="hover:text-primary-400 transition-colors">Returns</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookies" className="hover:text-primary-400 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} SuberFood. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                 className="hover:text-primary-400 transition-colors text-sm">
                Facebook
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                 className="hover:text-primary-400 transition-colors text-sm">
                Twitter
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                 className="hover:text-primary-400 transition-colors text-sm">
                Instagram
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                 className="hover:text-primary-400 transition-colors text-sm">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
