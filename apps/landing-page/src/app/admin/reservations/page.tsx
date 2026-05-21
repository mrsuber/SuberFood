import { AdminHeader } from '@/components/admin/AdminHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Clock, Users, MapPin, Phone, Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function ReservationsPage() {
  // Mock data - will be replaced with database queries
  const reservations = [
    {
      id: '1',
      customerName: 'Alice Brown',
      email: 'alice@example.com',
      phone: '+1 (555) 111-2222',
      restaurant: 'SuberFood Classical',
      date: '2026-05-21',
      time: '19:00',
      partySize: 4,
      status: 'Confirmed',
      specialRequests: 'Window seat preferred',
      createdAt: '2026-05-18',
    },
    {
      id: '2',
      customerName: 'Bob Wilson',
      email: 'bob@example.com',
      phone: '+1 (555) 222-3333',
      restaurant: 'SuberFood Bistro',
      date: '2026-05-20',
      time: '18:30',
      partySize: 2,
      status: 'Pending',
      specialRequests: null,
      createdAt: '2026-05-20',
    },
    {
      id: '3',
      customerName: 'Carol Davis',
      email: 'carol@example.com',
      phone: '+1 (555) 333-4444',
      restaurant: 'SuberFood Classical',
      date: '2026-05-21',
      time: '20:00',
      partySize: 6,
      status: 'Confirmed',
      specialRequests: 'Anniversary celebration, need quiet area',
      createdAt: '2026-05-19',
    },
    {
      id: '4',
      customerName: 'David Martinez',
      email: 'david@example.com',
      phone: '+1 (555) 444-5555',
      restaurant: 'SuberFood Bistro',
      date: '2026-05-20',
      time: '19:30',
      partySize: 3,
      status: 'Cancelled',
      specialRequests: null,
      createdAt: '2026-05-17',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-700'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'Cancelled':
        return 'bg-red-100 text-red-700'
      case 'Seated':
        return 'bg-blue-100 text-blue-700'
      case 'Completed':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <CheckCircle className="w-4 h-4" />
      case 'Pending':
        return <AlertCircle className="w-4 h-4" />
      case 'Cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <div>
      <AdminHeader title="Reservations" />

      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Today's Reservations</p>
              <p className="text-3xl font-bold text-gray-900">12</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">5</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Confirmed</p>
              <p className="text-3xl font-bold text-green-600">7</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">This Week</p>
              <p className="text-3xl font-bold text-gray-900">48</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
            <option>All Restaurants</option>
            <option>SuberFood Classical</option>
            <option>SuberFood Bistro</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
            <option>All Statuses</option>
            <option>Confirmed</option>
            <option>Pending</option>
            <option>Cancelled</option>
          </select>
          <input
            type="date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Reservations List */}
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <Card key={reservation.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {reservation.customerName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">{reservation.restaurant}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(reservation.status)}`}>
                      {getStatusIcon(reservation.status)}
                      {reservation.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{new Date(reservation.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{reservation.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{reservation.partySize} guests</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{reservation.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{reservation.phone}</span>
                  </div>
                </div>

                {reservation.specialRequests && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">Special Requests:</p>
                    <p className="text-sm text-blue-700">{reservation.specialRequests}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Booked on {new Date(reservation.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2">
                    {reservation.status === 'Pending' && (
                      <>
                        <Button size="sm" variant="default">
                          Confirm
                        </Button>
                        <Button size="sm" variant="outline">
                          Decline
                        </Button>
                      </>
                    )}
                    {reservation.status === 'Confirmed' && (
                      <>
                        <Button size="sm" variant="outline">
                          Mark as Seated
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600">
                          Cancel
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="ghost">
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
