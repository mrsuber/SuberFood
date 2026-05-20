'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Menu, X, ShoppingCart, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavItem {
  name: string
  href: string
  submenu?: {
    name: string
    href: string
    description: string
  }[]
}

const navigationData: NavItem[] = [
  {
    name: 'Distribution',
    href: '/distribution',
    submenu: [
      {
        name: 'Restaurants',
        href: '/distribution/restaurants',
        description: 'Classical fine dining experiences'
      },
      {
        name: 'Retail & E-commerce',
        href: '/distribution/retail',
        description: 'Shop fresh products online'
      },
      {
        name: 'B2B Partners',
        href: '/distribution/partners',
        description: 'Wholesale distribution'
      },
    ]
  },
  {
    name: 'Processing',
    href: '/processing',
    submenu: [
      {
        name: 'Sardine Processing',
        href: '/processing/sardine',
        description: 'Premium seafood processing'
      },
      {
        name: 'Milk Processing',
        href: '/processing/milk',
        description: 'Dairy products & pasteurization'
      },
      {
        name: 'Meat Processing',
        href: '/processing/meat',
        description: 'Quality meat products'
      },
      {
        name: 'Vegetable Processing',
        href: '/processing/vegetables',
        description: 'Fresh-cut & packaged produce'
      },
    ]
  },
  {
    name: 'Farming',
    href: '/farming',
    submenu: [
      {
        name: 'Fish Farming',
        href: '/farming/aquaculture',
        description: 'Sustainable aquaculture operations'
      },
      {
        name: 'Poultry Farming',
        href: '/farming/poultry',
        description: 'Free-range chicken & eggs'
      },
      {
        name: 'Livestock',
        href: '/farming/livestock',
        description: 'Cattle & dairy farming'
      },
      {
        name: 'Crop Farming',
        href: '/farming/crops',
        description: 'Organic fruits & vegetables'
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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-3xl font-display font-bold text-primary-600">
              SuberFood
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationData.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.submenu && setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors flex items-center gap-1"
                >
                  {item.name}
                  {item.submenu && <ChevronDown className="w-4 h-4" />}
                </Link>

                {/* Dropdown Menu */}
                {item.submenu && activeDropdown === item.name && (
                  <div className="absolute left-0 mt-0 w-80 bg-white rounded-lg shadow-premium-lg border border-gray-100 py-2 animate-slide-in">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className="block px-6 py-3 hover:bg-primary-50 transition-colors group"
                      >
                        <div className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {subItem.name}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {subItem.description}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 animate-slide-in">
            {navigationData.map((item) => (
              <div key={item.name} className="mb-2">
                <Link
                  href={item.href}
                  className="block px-4 py-2 text-gray-700 font-medium hover:bg-primary-50 rounded-md"
                  onClick={() => !item.submenu && setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
                {item.submenu && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-primary-50 rounded-md"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {subItem.name}
                      </Link>
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
      </div>
    </nav>
  )
}
