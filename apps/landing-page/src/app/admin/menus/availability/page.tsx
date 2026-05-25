'use client'

import Link from 'next/link'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { useState, useEffect } from 'react'

type MenuItem = {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  categoryId: string
  available: boolean
  maxServings: number
  missingIngredients: Array<{
    name: string
    need: number
    have: number
    unit: string
  }>
  isAvailable: boolean
  hasRecipe: boolean
}

export default function MenuAvailabilityPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'available' | 'unavailable'>('all')

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/menu/available')
      const result = await response.json()
      if (result.success) {
        setMenuItems(result.data)
      }
    } catch (error) {
      console.error('Error fetching menu items:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/menu/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !currentStatus }),
      })

      if (response.ok) {
        await fetchMenuItems()
      }
    } catch (error) {
      console.error('Error toggling availability:', error)
    }
  }

  const filteredItems = menuItems.filter((item) => {
    if (filter === 'available') return item.available && item.isAvailable
    if (filter === 'unavailable') return !item.available || !item.isAvailable
    return true
  })

  const stats = {
    total: menuItems.length,
    available: menuItems.filter((i) => i.available && i.isAvailable).length,
    outOfStock: menuItems.filter((i) => !i.available && i.hasRecipe).length,
    manuallyDisabled: menuItems.filter((i) => !i.isAvailable).length,
    noRecipe: menuItems.filter((i) => !i.hasRecipe).length,
  }

  return (
    <div>
      <AdminHeader title="Menu Availability Management" />

      <div className="p-8">
        {/* Info Banner */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Inventory-Based Availability</p>
                <p>
                  Dishes are automatically marked as unavailable when ingredients run out. Create
                  recipes for menu items at <strong>/admin/inventory/recipes</strong> to enable
                  automatic stock tracking.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Total Dishes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-green-600">Available Now</p>
              <p className="text-2xl font-bold text-green-900">{stats.available}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-red-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-900">{stats.outOfStock}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-yellow-600">Manually Disabled</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.manuallyDisabled}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">No Recipe</p>
              <p className="text-2xl font-bold text-gray-900">{stats.noRecipe}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All Dishes
                </Button>
                <Button
                  variant={filter === 'available' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('available')}
                >
                  Available
                </Button>
                <Button
                  variant={filter === 'unavailable' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('unavailable')}
                >
                  Unavailable
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={fetchMenuItems}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="w-12 h-12 text-primary-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading menu items...</p>
            </CardContent>
          </Card>
        )}

        {/* Menu Items Table */}
        {!loading && (
          <Card>
            <CardHeader>
              <CardTitle>Menu Items ({filteredItems.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Dish
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Recipe Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Inventory Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Max Servings
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Public Visibility
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                        <td className="px-6 py-4">
                          {item.hasRecipe ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3" />
                              Has Recipe
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              <Package className="w-3 h-3" />
                              No Recipe
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {item.available ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3" />
                              In Stock
                            </span>
                          ) : (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                <XCircle className="w-3 h-3" />
                                Out of Stock
                              </span>
                              {item.missingIngredients.length > 0 && (
                                <p className="text-xs text-red-600 mt-1">
                                  Missing: {item.missingIngredients.map((i) => i.name).join(', ')}
                                </p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {item.hasRecipe ? (
                            <span className="font-semibold text-gray-900">{item.maxServings}</span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {item.isAvailable ? (
                            <span className="inline-flex items-center gap-1 text-sm text-green-700">
                              <CheckCircle className="w-4 h-4" />
                              Visible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                              <XCircle className="w-4 h-4" />
                              Hidden
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/menus/${item.id}`}>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleAvailability(item.id, item.isAvailable)}
                            >
                              {item.isAvailable ? 'Hide' : 'Show'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alert for items without recipes */}
        {stats.noRecipe > 0 && (
          <Card className="mt-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-900">
                  <p className="font-semibold mb-1">
                    {stats.noRecipe} dish(es) don't have recipes
                  </p>
                  <p>
                    Without recipes, these dishes will always show as available regardless of
                    inventory levels. Create recipes at <strong>/admin/inventory/recipes</strong>{' '}
                    to enable automatic stock tracking.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
