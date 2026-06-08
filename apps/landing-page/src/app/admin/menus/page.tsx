import Link from 'next/link'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Edit, Trash2, DollarSign, Clock, MapPin } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getMenuItems() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      include: {
        category: {
          include: {
            restaurant: true,
          },
        },
      },
      orderBy: [
        { category: { restaurant: { name: 'asc' } } },
        { category: { displayOrder: 'asc' } },
      ],
    })
    return menuItems
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return []
  }
}

async function getRestaurants() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: {
        status: {
          in: ['OPEN', 'TEMPORARILY_CLOSED'],
        },
      },
      orderBy: { name: 'asc' },
    })
    return restaurants
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return []
  }
}

async function getCategories() {
  try {
    const categories = await prisma.menuCategory.findMany({
      include: {
        restaurant: true,
      },
      orderBy: [
        { restaurant: { name: 'asc' } },
        { displayOrder: 'asc' },
      ],
    })
    return categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function MenusPage() {
  const menuItems = await getMenuItems()
  const restaurants = await getRestaurants()
  const categories = await getCategories()

  // Group categories by restaurant for the filter
  const categoriesByRestaurant = categories.reduce((acc, cat) => {
    const restName = cat.restaurant.name
    if (!acc[restName]) acc[restName] = []
    acc[restName].push(cat)
    return acc
  }, {} as Record<string, typeof categories>)

  return (
    <div>
      <AdminHeader title="Menu Management" />

      <div className="p-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Menu Items</p>
                  <p className="text-3xl font-bold text-gray-900">{menuItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Available</p>
                  <p className="text-3xl font-bold text-green-600">
                    {menuItems.filter(i => i.isAvailable).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Unavailable</p>
                  <p className="text-3xl font-bold text-red-600">
                    {menuItems.filter(i => !i.isAvailable).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Categories</p>
                  <p className="text-3xl font-bold text-blue-600">{categories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">All Menu Items</h2>
            <p className="text-gray-600">Manage menu items across all restaurant locations</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/menus/categories">
              <Button variant="outline">Manage Categories</Button>
            </Link>
            <Link href="/admin/menus/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Menu Item
              </Button>
            </Link>
          </div>
        </div>

        {/* Menu Items Table */}
        <Card>
          <CardContent className="p-0">
            {menuItems.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No menu items yet</h3>
                <p className="text-gray-600 mb-6">Get started by adding your first menu item</p>
                <Link href="/admin/menus/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Menu Item
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Item Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Location</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Prep Time</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {menuItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <div className="flex gap-2 mt-1">
                              {item.isVegetarian && (
                                <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                  Vegetarian
                                </span>
                              )}
                              {item.isVegan && (
                                <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                  Vegan
                                </span>
                              )}
                              {item.isGlutenFree && (
                                <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                  Gluten-Free
                                </span>
                              )}
                              {item.isChefRecommended && (
                                <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                  Chef's Recommend
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.category.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            {item.category.restaurant.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                              <DollarSign className="w-4 h-4" />
                              {item.price.toFixed(2)}
                            </div>
                            {item.salePrice && (
                              <div className="flex items-center gap-1 text-xs text-green-600">
                                Sale: ${item.salePrice.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {item.preparationTime ? (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              {item.preparationTime} min
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            item.isAvailable
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {item.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/menus/${item.id}`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
