'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Menu, X, ShoppingCart, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SubNavItem {
  name: string
  href: string
  submenu?: {
    name: string
    href: string
    description: string
  }[]
}

interface NavItem {
  name: string
  href: string
  subNav?: SubNavItem[]
}

const navigationData: NavItem[] = [
  {
    name: 'Distribution',
    href: '/distribution',
    subNav: [
      {
        name: 'Restaurants',
        href: '/distribution/restaurants',
        submenu: [
          {
            name: 'About',
            href: '/distribution/restaurants',
            description: 'Learn about our restaurants'
          },
          {
            name: 'Menu',
            href: '/distribution/restaurants/menu',
            description: 'Browse our delicious menu items'
          },
          {
            name: 'Locations',
            href: '/distribution/restaurants/locations',
            description: 'Find restaurants near you'
          },
          {
            name: 'Reservations',
            href: '/distribution/restaurants/reservations',
            description: 'Book a table'
          },
          {
            name: 'Contact',
            href: '/distribution/restaurants/contact',
            description: 'Get in touch with us'
          },
        ]
      },
      {
        name: 'Retail & E-commerce',
        href: '/distribution/retail',
        submenu: [
          {
            name: 'Shop Online',
            href: '/distribution/retail/shop',
            description: 'Browse our online store'
          },
          {
            name: 'Products',
            href: '/distribution/retail/products',
            description: 'Fresh products delivered'
          },
          {
            name: 'Delivery',
            href: '/distribution/retail/delivery',
            description: 'Delivery information'
          },
        ]
      },
      {
        name: 'B2B Partners',
        href: '/distribution/partners',
        submenu: [
          {
            name: 'Wholesale',
            href: '/distribution/partners/wholesale',
            description: 'Bulk ordering'
          },
          {
            name: 'Partnerships',
            href: '/distribution/partners/partnerships',
            description: 'Partner with us'
          },
          {
            name: 'Contact',
            href: '/distribution/partners/contact',
            description: 'Business inquiries'
          },
        ]
      },
    ]
  },
  {
    name: 'Processing',
    href: '/processing',
    subNav: [
      {
        name: 'Sardine Processing',
        href: '/processing/sardine',
      },
      {
        name: 'Milk Processing',
        href: '/processing/milk',
      },
      {
        name: 'Meat Processing',
        href: '/processing/meat',
      },
      {
        name: 'Vegetable Processing',
        href: '/processing/vegetables',
      },
    ]
  },
  {
    name: 'Farming',
    href: '/farming',
    subNav: [
      {
        name: 'Fish Farming',
        href: '/farming/aquaculture',
      },
      {
        name: 'Poultry Farming',
        href: '/farming/poultry',
      },
      {
        name: 'Livestock',
        href: '/farming/livestock',
      },
      {
        name: 'Crop Farming',
        href: '/farming/crops',
      },
    ]
  },
  {
    name: 'About',
    href: '/about',
  },
  {
    name: 'Sustainability',
    href: '/sustainability',
  },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeMainNav, setActiveMainNav] = useState<string | null>(null)
  const [activeSubDropdown, setActiveSubDropdown] = useState<string | null>(null)
  const pathname = usePathname()

  // Determine active main nav based on current path
  const getActiveMainNav = () => {
    if (pathname.startsWith('/distribution')) return 'Distribution'
    if (pathname.startsWith('/processing')) return 'Processing'
    if (pathname.startsWith('/farming')) return 'Farming'
    if (pathname.startsWith('/about')) return 'About'
    if (pathname.startsWith('/sustainability')) return 'Sustainability'
    return null
  }

  const currentMainNav = getActiveMainNav()
  const currentNavData = navigationData.find(item => item.name === currentMainNav)

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      {/* Main Navigation Bar */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl font-display font-bold text-primary-600">
                SuberFood
              </div>
            </Link>

            {/* Desktop Main Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationData.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 font-medium transition-colors ${
                    currentMainNav === item.name
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                  onMouseEnter={() => setActiveMainNav(item.name)}
                  onMouseLeave={() => setActiveMainNav(null)}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
              <Button size="sm">
                Shop Now
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar - Only shown when a main nav with subnav is active */}
      {currentNavData?.subNav && (
        <div className="bg-gray-50 border-b border-gray-200 hidden lg:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-1 h-12">
              {currentNavData.subNav.map((subItem) => (
                <div
                  key={subItem.name}
                  className="relative"
                  onMouseEnter={() => subItem.submenu && setActiveSubDropdown(subItem.name)}
                  onMouseLeave={() => setActiveSubDropdown(null)}
                >
                  <Link
                    href={subItem.href}
                    className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${
                      pathname.startsWith(subItem.href)
                        ? 'text-primary-600'
                        : 'text-gray-700 hover:text-primary-600'
                    }`}
                  >
                    {subItem.name}
                    {subItem.submenu && <ChevronDown className="w-3 h-3" />}
                  </Link>

                  {/* Sub-dropdown Menu */}
                  {subItem.submenu && activeSubDropdown === subItem.name && (
                    <div className="absolute left-0 mt-0 w-72 bg-white rounded-lg shadow-xl border border-gray-100 py-2 animate-slide-in">
                      {subItem.submenu.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.name}
                          href={dropdownItem.href}
                          className="block px-6 py-3 hover:bg-primary-50 transition-colors group"
                        >
                          <div className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {dropdownItem.name}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {dropdownItem.description}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden py-4 border-t border-gray-100 animate-slide-in">
          {navigationData.map((item) => (
            <div key={item.name} className="mb-2">
              <Link
                href={item.href}
                className="block px-4 py-2 text-gray-700 font-medium hover:bg-primary-50 rounded-md"
                onClick={() => !item.subNav && setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
              {item.subNav && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.subNav.map((subItem) => (
                    <div key={subItem.name}>
                      <Link
                        href={subItem.href}
                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-primary-50 rounded-md"
                        onClick={() => !subItem.submenu && setMobileMenuOpen(false)}
                      >
                        {subItem.name}
                      </Link>
                      {subItem.submenu && (
                        <div className="ml-4 mt-1 space-y-1">
                          {subItem.submenu.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.name}
                              href={dropdownItem.href}
                              className="block px-4 py-2 text-xs text-gray-500 hover:bg-primary-50 rounded-md"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {dropdownItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="mt-4 px-4 space-y-2">
            <Button className="w-full" onClick={() => setMobileMenuOpen(false)}>
              Shop Now
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setMobileMenuOpen(false)}>
              Sign In
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}
