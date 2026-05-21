'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  ChevronDown
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  name: string
  href: string
  icon: any
  badge?: number
  submenu?: { name: string; href: string }[]
}

const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Restaurants',
    href: '/admin/restaurants',
    icon: Store,
    submenu: [
      { name: 'All Restaurants', href: '/admin/restaurants' },
      { name: 'Add New', href: '/admin/restaurants/new' },
      { name: 'Tables', href: '/admin/restaurants/tables' },
    ]
  },
  {
    name: 'Menus',
    href: '/admin/menus',
    icon: MenuIcon,
    submenu: [
      { name: 'Menu Items', href: '/admin/menus' },
      { name: 'Categories', href: '/admin/menus/categories' },
      { name: 'Add Item', href: '/admin/menus/new' },
    ]
  },
  {
    name: 'Reservations',
    href: '/admin/reservations',
    icon: Calendar,
    badge: 5,
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    badge: 12,
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package,
    submenu: [
      { name: 'All Products', href: '/admin/products' },
      { name: 'Add Product', href: '/admin/products/new' },
      { name: 'Categories', href: '/admin/products/categories' },
      { name: 'Inventory', href: '/admin/products/inventory' },
    ]
  },
  {
    name: 'Customers',
    href: '/admin/customers',
    icon: Users,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: TrendingUp,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
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
      <nav className="flex-1 overflow-y-auto py-6">
        <div className="space-y-1 px-3">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const hasSubmenu = item.submenu && item.submenu.length > 0
            const isSubmenuOpen = openSubmenu === item.name

            return (
              <div key={item.name}>
                {hasSubmenu ? (
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}

                {/* Submenu */}
                {hasSubmenu && isSubmenuOpen && (
                  <div className="mt-1 ml-12 space-y-1">
                    {item.submenu?.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
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
        <button className="w-full flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors text-sm">
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
