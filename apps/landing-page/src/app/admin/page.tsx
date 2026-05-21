import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Users, ShoppingCart, Calendar, DollarSign } from 'lucide-react'

export default function AdminDashboard() {
  // Mock data - will be replaced with real data from API
  const stats = [
    {
      title: 'Total Revenue',
      value: '$45,231',
      change: '+20.1%',
      trend: 'up',
      icon: DollarSign,
    },
    {
      title: 'Total Orders',
      value: '1,234',
      change: '+12.5%',
      trend: 'up',
      icon: ShoppingCart,
    },
    {
      title: 'Reservations Today',
      value: '45',
      change: '-5.2%',
      trend: 'down',
      icon: Calendar,
    },
    {
      title: 'Active Customers',
      value: '892',
      change: '+8.3%',
      trend: 'up',
      icon: Users,
    },
  ]

  const recentOrders = [
    { id: '1', customer: 'John Doe', total: '$125.00', status: 'Completed', time: '2 mins ago' },
    { id: '2', customer: 'Jane Smith', total: '$89.50', status: 'Processing', time: '15 mins ago' },
    { id: '3', customer: 'Mike Johnson', total: '$234.00', status: 'Pending', time: '1 hour ago' },
    { id: '4', customer: 'Sarah Williams', total: '$156.75', status: 'Completed', time: '2 hours ago' },
  ]

  const recentReservations = [
    { id: '1', customer: 'Alice Brown', restaurant: 'SuberFood Classical', time: '7:00 PM', guests: 4, status: 'Confirmed' },
    { id: '2', customer: 'Bob Wilson', restaurant: 'SuberFood Bistro', time: '6:30 PM', guests: 2, status: 'Pending' },
    { id: '3', customer: 'Carol Davis', restaurant: 'SuberFood Classical', time: '8:00 PM', guests: 6, status: 'Confirmed' },
  ]

  return (
    <div>
      <AdminHeader title="Dashboard" />

      <div className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500">vs last month</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{order.customer}</p>
                      <p className="text-sm text-gray-500">{order.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{order.total}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'Completed'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'Processing'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Reservations */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Reservations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReservations.map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{reservation.customer}</p>
                      <p className="text-sm text-gray-500">{reservation.restaurant}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {reservation.time} • {reservation.guests} guests
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          reservation.status === 'Confirmed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {reservation.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Placeholder */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Revenue chart will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
