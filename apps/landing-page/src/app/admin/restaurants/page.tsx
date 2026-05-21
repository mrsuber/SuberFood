import Link from 'next/link'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Edit, Trash2, MapPin, Phone, Clock, Star } from 'lucide-react'

export default function RestaurantsPage() {
  // Mock data - will be replaced with database queries
  const restaurants = [
    {
      id: '1',
      name: 'SuberFood Classical',
      type: 'Classical Fine Dining',
      address: '123 Gourmet Avenue, San Francisco, CA 94102',
      phone: '+1 (555) 123-4567',
      status: 'Open',
      rating: 4.8,
      capacity: 80,
      openingTime: '17:00',
      closingTime: '23:00',
    },
    {
      id: '2',
      name: 'SuberFood Bistro',
      type: 'Cafeteria',
      address: '456 Market Street, San Francisco, CA 94103',
      phone: '+1 (555) 234-5678',
      status: 'Open',
      rating: 4.6,
      capacity: 120,
      openingTime: '11:00',
      closingTime: '22:00',
    },
  ]

  return (
    <div>
      <AdminHeader title="Restaurant Management" />

      <div className="p-8">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-600">Manage all restaurant locations and settings</p>
          </div>
          <Link href="/admin/restaurants/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Restaurant
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
                      {restaurant.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{restaurant.rating}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <span>{restaurant.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />
                    <span>{restaurant.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 flex-shrink-0 text-gray-400" />
                    <span>
                      {restaurant.openingTime} - {restaurant.closingTime}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`px-3 py-1 rounded-full font-medium ${
                      restaurant.status === 'Open'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {restaurant.status}
                    </span>
                    <span className="text-gray-600">Capacity: {restaurant.capacity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/restaurants/${restaurant.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
