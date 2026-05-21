import Link from 'next/link'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Edit, Trash2, DollarSign, Clock } from 'lucide-react'

export default function MenusPage() {
  // Mock data
  const menuItems = [
    {
      id: '1',
      name: 'Farm Greens Salad',
      category: 'Appetizers',
      restaurant: 'SuberFood Classical',
      price: 18,
      isAvailable: true,
      isVegetarian: true,
      preparationTime: 10,
    },
    {
      id: '2',
      name: 'Pan-Seared Sea Bass',
      category: 'Main Courses',
      restaurant: 'SuberFood Classical',
      price: 48,
      isAvailable: true,
      isVegetarian: false,
      preparationTime: 25,
    },
    {
      id: '3',
      name: 'Grass-Fed Ribeye',
      category: 'Main Courses',
      restaurant: 'SuberFood Classical',
      price: 62,
      isAvailable: true,
      isVegetarian: false,
      preparationTime: 30,
    },
    {
      id: '4',
      name: 'Chocolate Lava Cake',
      category: 'Desserts',
      restaurant: 'SuberFood Classical',
      price: 14,
      isAvailable: true,
      isVegetarian: true,
      preparationTime: 15,
    },
  ]

  return (
    <div>
      <AdminHeader title="Menu Management" />

      <div className="p-8">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-600">Manage menu items across all restaurants</p>
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

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option>All Restaurants</option>
            <option>SuberFood Classical</option>
            <option>SuberFood Bistro</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option>All Categories</option>
            <option>Appetizers</option>
            <option>Main Courses</option>
            <option>Desserts</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option>All Items</option>
            <option>Available Only</option>
            <option>Unavailable Only</option>
          </select>
        </div>

        {/* Menu Items Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Item Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Restaurant</th>
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
                          {item.isVegetarian && (
                            <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              Vegetarian
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.restaurant}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                          <DollarSign className="w-4 h-4" />
                          {item.price}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          {item.preparationTime} min
                        </div>
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
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
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
      </div>
    </div>
  )
}
