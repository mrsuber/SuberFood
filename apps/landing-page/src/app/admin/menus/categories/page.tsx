import Link from 'next/link'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Edit, Trash2, MapPin, UtensilsCrossed } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getCategories() {
  try {
    const categories = await prisma.menuCategory.findMany({
      include: {
        restaurant: true,
        _count: {
          select: {
            items: true,
          },
        },
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

export default async function MenuCategoriesPage() {
  const categories = await getCategories()
  const restaurants = await getRestaurants()

  // Group categories by restaurant
  const categoriesByRestaurant = categories.reduce((acc, cat) => {
    const restName = cat.restaurant.name
    if (!acc[restName]) acc[restName] = []
    acc[restName].push(cat)
    return acc
  }, {} as Record<string, typeof categories>)

  return (
    <div>
      <AdminHeader title="Menu Categories" />

      <div className="p-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Categories</p>
                  <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
                </div>
                <UtensilsCrossed className="w-10 h-10 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Categories</p>
                  <p className="text-3xl font-bold text-green-600">
                    {categories.filter(c => c.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Menu Items</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {categories.reduce((acc, c) => acc + c._count.items, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">All Categories</h2>
            <p className="text-gray-600">Manage menu categories across all restaurant locations</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/menus">
              <Button variant="outline">Back to Menu</Button>
            </Link>
            <Link href="/admin/menus/categories/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </Link>
          </div>
        </div>

        {/* Categories by Restaurant */}
        <div className="space-y-6">
          {restaurants.map(restaurant => {
            const restaurantCategories = categoriesByRestaurant[restaurant.name] || []

            return (
              <Card key={restaurant.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary-600" />
                      <h3 className="text-lg font-bold text-gray-900">{restaurant.name}</h3>
                      <span className="text-sm text-gray-500">
                        ({restaurantCategories.length} categories)
                      </span>
                    </div>
                    <Link href={`/admin/menus/categories/new?restaurantId=${restaurant.id}`}>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Category
                      </Button>
                    </Link>
                  </div>

                  {restaurantCategories.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No categories yet for this location
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {restaurantCategories.map(category => (
                        <div
                          key={category.id}
                          className="p-4 border rounded-lg hover:border-primary-300 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{category.name}</h4>
                              {category.description && (
                                <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                              )}
                            </div>
                            <Link href={`/admin/menus/categories/${category.id}`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t">
                            <span className="text-sm text-gray-600">
                              {category._count.items} items
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              category.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {category.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {categories.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UtensilsCrossed className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories yet</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first category</p>
              <Link href="/admin/menus/categories/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
