'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Store,
  Menu as MenuIcon,
  Calendar,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Settings,
  LogOut,
  ChevronDown,
  Building2,
  ShoppingBag,
  Handshake,
  Factory,
  Wheat,
  Sprout,
  ChefHat,
  UtensilsCrossed,
  Beef,
  ClipboardList
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  name: string
  href: string
  icon: any
  badge?: number
  submenu?: { name: string; href: string }[]
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navigationSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        name: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
      },
      {
        name: 'Analytics',
        href: '/admin/analytics',
        icon: TrendingUp,
      },
    ]
  },
  {
    title: 'Distribution',
    items: [
      {
        name: 'Restaurant Locations',
        href: '/admin/distribution/restaurants',
        icon: Building2,
        submenu: [
          { name: 'All Locations', href: '/admin/distribution/restaurants' },
          { name: 'Add New Location', href: '/admin/distribution/restaurants/new' },
        ]
      },
      {
        name: 'Menus & Dishes',
        href: '/admin/menus',
        icon: MenuIcon,
        submenu: [
          { name: 'All Menu Items', href: '/admin/menus' },
          { name: 'Add Menu Item', href: '/admin/menus/new' },
          { name: 'Dish Availability', href: '/admin/menus/availability' },
          { name: 'By Location', href: '/admin/menus/by-location' },
        ]
      },
      {
        name: 'Kitchen Inventory',
        href: '/admin/inventory',
        icon: Package,
        submenu: [
          { name: 'All Ingredients', href: '/admin/inventory' },
          { name: 'Add Ingredient', href: '/admin/inventory/new' },
          { name: 'Bulk Preparation', href: '/admin/inventory/prepare' },
          { name: 'Recipes', href: '/admin/inventory/recipes' },
          { name: 'Stock Movements', href: '/admin/inventory/movements' },
          { name: 'By Location', href: '/admin/inventory/by-location' },
        ]
      },
      {
        name: 'Staff & Chefs',
        href: '/admin/staff',
        icon: ChefHat,
        submenu: [
          { name: 'All Staff', href: '/admin/staff' },
          { name: 'Add Staff Member', href: '/admin/staff/new' },
          { name: 'By Location', href: '/admin/staff/by-location' },
          { name: 'Schedules', href: '/admin/staff/schedules' },
        ]
      },
      {
        name: 'Equipment & Assets',
        href: '/admin/equipment',
        icon: UtensilsCrossed,
        submenu: [
          { name: 'All Equipment', href: '/admin/equipment' },
          { name: 'Add Equipment', href: '/admin/equipment/new' },
          { name: 'By Location', href: '/admin/equipment/by-location' },
          { name: 'Maintenance', href: '/admin/equipment/maintenance' },
        ]
      },
      {
        name: 'Reservations',
        href: '/admin/reservations',
        icon: Calendar,
        submenu: [
          { name: 'All Reservations', href: '/admin/reservations' },
          { name: 'By Location', href: '/admin/reservations/by-location' },
          { name: 'Pending', href: '/admin/reservations/pending' },
        ]
      },
      {
        name: 'Orders',
        href: '/admin/orders',
        icon: ShoppingCart,
        badge: 12,
      },
      {
        name: 'E-commerce',
        href: '/admin/distribution/ecommerce',
        icon: ShoppingBag,
        submenu: [
          { name: 'Products', href: '/admin/products' },
          { name: 'Add Product', href: '/admin/products/new' },
          { name: 'Categories', href: '/admin/products/categories' },
          { name: 'Online Orders', href: '/admin/distribution/ecommerce/orders' },
        ]
      },
      {
        name: 'B2B Partners',
        href: '/admin/distribution/partners',
        icon: Handshake,
        submenu: [
          { name: 'All Partners', href: '/admin/distribution/partners' },
          { name: 'Add Partner', href: '/admin/distribution/partners/new' },
          { name: 'Bulk Orders', href: '/admin/distribution/partners/orders' },
        ]
      },
      {
        name: 'Customers',
        href: '/admin/customers',
        icon: Users,
      },
    ]
  },
  {
    title: 'Processing',
    items: [
      {
        name: 'Food Processing',
        href: '/admin/processing/facilities',
        icon: Factory,
        submenu: [
          { name: 'Facilities', href: '/admin/processing/facilities' },
          { name: 'Production Batches', href: '/admin/processing/batches' },
          { name: 'Quality Control', href: '/admin/processing/quality' },
        ]
      },
    ]
  },
  {
    title: 'Farming & Production',
    items: [
      {
        name: 'Farm Management',
        href: '/admin/farming/farms',
        icon: Wheat,
        submenu: [
          { name: 'All Farms', href: '/admin/farming/farms' },
          { name: 'Add Farm', href: '/admin/farming/farms/new' },
          { name: 'Crops', href: '/admin/farming/crops' },
        ]
      },
      {
        name: 'Livestock',
        href: '/admin/farming/livestock',
        icon: Beef,
        submenu: [
          { name: 'All Animals', href: '/admin/farming/livestock' },
          { name: 'Add Animal', href: '/admin/farming/livestock/new' },
          { name: 'Health Records', href: '/admin/farming/livestock/health' },
        ]
      },
      {
        name: 'Harvest & Supply',
        href: '/admin/farming/supply',
        icon: Sprout,
        submenu: [
          { name: 'Harvests', href: '/admin/farming/harvests' },
          { name: 'Supply Chain', href: '/admin/farming/supply-chain' },
        ]
      },
    ]
  },
  {
    title: 'System',
    items: [
      {
        name: 'Settings',
        href: '/admin/settings',
        icon: Settings,
      },
      {
        name: 'Activity Logs',
        href: '/admin/activity-logs',
        icon: ClipboardList,
      },
    ]
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  const toggleSubmenu = (name: string) => {
    setOpenSubmenu(openSubmenu === name ? null : name)
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="text-2xl font-display font-bold text-primary-400">
            SuberFood
          </div>
        </Link>
        <p className="text-xs text-gray-400 mt-1">Admin Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-6 px-3">
          {navigationSections.map((section) => (
            <div key={section.title}>
              {/* Section Title */}
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
                {section.title}
              </h3>

              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  const hasSubmenu = item.submenu && item.submenu.length > 0
                  const isSubmenuOpen = openSubmenu === item.name

                  return (
                    <div key={item.name}>
                      {hasSubmenu ? (
                        <button
                          onClick={() => toggleSubmenu(item.name)}
                          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-300 hover:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium text-sm">{item.name}</span>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              isSubmenuOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-300 hover:bg-gray-800'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium text-sm">{item.name}</span>
                          {item.badge && (
                            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      )}

                      {/* Submenu */}
                      {hasSubmenu && isSubmenuOpen && (
                        <div className="mt-1 ml-9 space-y-1">
                          {item.submenu?.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={`block px-4 py-2 rounded-lg text-xs transition-colors ${
                                pathname === subItem.href
                                  ? 'bg-gray-800 text-primary-400'
                                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                              }`}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="font-semibold">A</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Admin User</p>
            <p className="text-xs text-gray-400">admin@suberfoods.com</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="w-full flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
