import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Phone, MapPin, ShoppingCart, Calendar } from 'lucide-react'

export default function CustomersPage() {
  const customers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 111-2222',
      location: 'San Francisco, CA',
      totalOrders: 15,
      totalSpent: 1250.00,
      lastOrder: '2026-05-20',
      status: 'Active',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1 (555) 222-3333',
      location: 'Oakland, CA',
      totalOrders: 8,
      totalSpent: 680.50,
      lastOrder: '2026-05-18',
      status: 'Active',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '+1 (555) 333-4444',
      location: 'San Jose, CA',
      totalOrders: 22,
      totalSpent: 2340.75,
      lastOrder: '2026-05-21',
      status: 'Active',
    },
  ]

  return (
    <div>
      <AdminHeader title="Customers" />

      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900">892</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Active This Month</p>
              <p className="text-3xl font-bold text-green-600">234</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">New This Week</p>
              <p className="text-3xl font-bold text-blue-600">12</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Avg. Order Value</p>
              <p className="text-3xl font-bold text-gray-900">$89</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <input
            type="search"
            placeholder="Search customers..."
            className="px-4 py-2 border border-gray-300 rounded-lg flex-1 max-w-md"
          />
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option>All Customers</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        {/* Customers List */}
        <div className="space-y-4">
          {customers.map((customer) => (
            <Card key={customer.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {customer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{customer.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          {customer.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {customer.location}
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <ShoppingCart className="w-4 h-4" />
                          <span>{customer.totalOrders} orders</span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-gray-900">
                          Total: ${customer.totalSpent.toFixed(2)}
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          Last order: {new Date(customer.lastOrder).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                      {customer.status}
                    </span>
                    <Button variant="outline" size="sm">
                      View Details
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
