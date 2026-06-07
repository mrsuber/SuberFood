import Link from 'next/link'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Edit, Trash2, MapPin, Phone, Clock, Star, Users, ChefHat, UtensilsCrossed } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getRestaurants() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        _count: {
          select: {
            menuCategories: true,
            staff: true,
            equipment: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return restaurants
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return []
  }
}

export default async function RestaurantsManagementPage() {
  const restaurants = await getRestaurants()

  return (
    <div>
      <AdminHeader title="Restaurant Management" />

      <div className="p-8">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-600">Manage all restaurant locations, menus, staff, and operations</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>{restaurants.length} Total Locations</span>
              <span>•</span>
              <span>{restaurants.filter(r => r.status === 'OPEN').length} Currently Open</span>
            </div>
          </div>
          <Link href="/admin/distribution/restaurants/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Restaurant Location
            </Button>
          </Link>
        </div>

        {/* Restaurants Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-primary-600 font-medium">
                      {restaurant.type.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{restaurant.rating || '4.5'}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <span>{restaurant.address}, {restaurant.city}, {restaurant.state} {restaurant.postalCode}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />
                    <span>{restaurant.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 flex-shrink-0 text-gray-400" />
                    <span>
                      {restaurant.openingTime || '11:00'} - {restaurant.closingTime || '22:00'}
                    </span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <UtensilsCrossed className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                    <div className="text-lg font-bold text-gray-900">{restaurant._count.menuCategories}</div>
                    <div className="text-xs text-gray-600">Menu Categories</div>
                  </div>
                  <div className="text-center">
                    <ChefHat className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                    <div className="text-lg font-bold text-gray-900">{restaurant._count.staff}</div>
                    <div className="text-xs text-gray-600">Staff Members</div>
                  </div>
                  <div className="text-center">
                    <Users className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                    <div className="text-lg font-bold text-gray-900">{restaurant.capacity}</div>
                    <div className="text-xs text-gray-600">Capacity</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`px-3 py-1 rounded-full font-medium ${
                      restaurant.status === 'OPEN'
                        ? 'bg-green-100 text-green-700'
                        : restaurant.status === 'CLOSED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {restaurant.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/distribution/restaurants/${restaurant.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/admin/distribution/restaurants/menus?restaurant=${restaurant.id}`}>
                      <Button variant="ghost" size="sm">
                        <UtensilsCrossed className="w-4 h-4 mr-1" />
                        Menu
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {restaurants.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No restaurants yet</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first restaurant location</p>
              <Link href="/admin/distribution/restaurants/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Restaurant Location
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
