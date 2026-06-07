import Link from 'next/link'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Edit, Trash2, MapPin, Phone, Clock, Star, Users, ChefHat, UtensilsCrossed, Power, Eye, EyeOff, Settings, Package } from 'lucide-react'
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
        status: 'asc', // Show OPEN first, then CLOSED, then TEMPORARILY_CLOSED
        createdAt: 'desc',
      },
    })
    return restaurants
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return []
  }
}

async function getLocationStats(restaurants: any[]) {
  const stats = {
    total: restaurants.length,
    open: restaurants.filter(r => r.status === 'OPEN').length,
    closed: restaurants.filter(r => r.status === 'CLOSED').length,
    temporarilyClosed: restaurants.filter(r => r.status === 'TEMPORARILY_CLOSED').length,
    totalStaff: restaurants.reduce((acc, r) => acc + r._count.staff, 0),
    totalEquipment: restaurants.reduce((acc, r) => acc + r._count.equipment, 0),
    totalCapacity: restaurants.reduce((acc, r) => acc + r.capacity, 0),
  }
  return stats
}

export default async function RestaurantsManagementPage() {
  const restaurants = await getRestaurants()
  const stats = await getLocationStats(restaurants)

  return (
    <div>
      <AdminHeader title="Restaurant Locations" />

      <div className="p-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Locations</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <MapPin className="w-10 h-10 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Currently Open</p>
                  <p className="text-3xl font-bold text-green-600">{stats.open}</p>
                </div>
                <Power className="w-10 h-10 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Staff</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalStaff}</p>
                </div>
                <ChefHat className="w-10 h-10 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Capacity</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.totalCapacity}</p>
                </div>
                <Users className="w-10 h-10 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">All Locations</h2>
            <p className="text-gray-600">Manage individual restaurant locations, their menus, staff, kitchen, and equipment</p>
          </div>
          <Link href="/admin/distribution/restaurants/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Location
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

                {/* Location Management Actions */}
                <div className="pt-4 border-t mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full font-medium text-sm ${
                      restaurant.status === 'OPEN'
                        ? 'bg-green-100 text-green-700'
                        : restaurant.status === 'CLOSED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {restaurant.status === 'TEMPORARILY_CLOSED' ? 'TEMP. CLOSED' : restaurant.status}
                    </span>

                    <div className="flex items-center gap-2">
                      <Link href={`/admin/distribution/restaurants/${restaurant.id}`}>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4 mr-1" />
                          Settings
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Quick Access Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/admin/menus?location=${restaurant.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <UtensilsCrossed className="w-4 h-4 mr-1" />
                        Menu
                      </Button>
                    </Link>
                    <Link href={`/admin/inventory?location=${restaurant.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Package className="w-4 h-4 mr-1" />
                        Kitchen
                      </Button>
                    </Link>
                    <Link href={`/admin/staff?location=${restaurant.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <ChefHat className="w-4 h-4 mr-1" />
                        Staff
                      </Button>
                    </Link>
                    <Link href={`/admin/equipment?location=${restaurant.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <UtensilsCrossed className="w-4 h-4 mr-1" />
                        Equipment
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
