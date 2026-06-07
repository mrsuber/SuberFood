'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  ArrowLeft, Save, Power, MapPin, Phone, Mail, Clock,
  Users, Star, Image, Settings, AlertCircle, CheckCircle
} from 'lucide-react'

interface Restaurant {
  id: string
  name: string
  slug: string
  type: string
  description: string | null
  address: string
  city: string
  state: string
  postalCode: string
  phone: string
  email: string
  status: string
  openingTime: string | null
  closingTime: string | null
  operatingDays: string | null
  capacity: number
  rating: number
  latitude: number | null
  longitude: number | null
  images: string[] | null
  amenities: string[] | null
  parkingInfo: string | null
  accessibilityFeatures: string[] | null
  privateRooms: boolean
  outdoorSeating: boolean
  story: string | null
}

export default function RestaurantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const restaurantId = params.id as string

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'CLASSICAL_FINE_DINING',
    description: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    email: '',
    status: 'OPEN',
    openingTime: '',
    closingTime: '',
    capacity: 0,
    parkingInfo: '',
    story: '',
    privateRooms: false,
    outdoorSeating: false,
  })

  useEffect(() => {
    fetchRestaurant()
  }, [restaurantId])

  const fetchRestaurant = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/restaurants/${restaurantId}`)

      if (!response.ok) throw new Error('Failed to fetch restaurant')

      const data = await response.json()
      setRestaurant(data.restaurant)

      // Populate form
      setFormData({
        name: data.restaurant.name || '',
        type: data.restaurant.type || 'CLASSICAL_FINE_DINING',
        description: data.restaurant.description || '',
        address: data.restaurant.address || '',
        city: data.restaurant.city || '',
        state: data.restaurant.state || '',
        postalCode: data.restaurant.postalCode || '',
        phone: data.restaurant.phone || '',
        email: data.restaurant.email || '',
        status: data.restaurant.status || 'OPEN',
        openingTime: data.restaurant.openingTime || '',
        closingTime: data.restaurant.closingTime || '',
        capacity: data.restaurant.capacity || 0,
        parkingInfo: data.restaurant.parkingInfo || '',
        story: data.restaurant.story || '',
        privateRooms: data.restaurant.privateRooms || false,
        outdoorSeating: data.restaurant.outdoorSeating || false,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch(`/api/admin/restaurants/${restaurantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update restaurant')
      }

      setSuccessMessage('Restaurant updated successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
      fetchRestaurant()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusToggle = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/restaurants/${restaurantId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update status')

      setSuccessMessage(`Location status updated to ${newStatus}`)
      fetchRestaurant()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading restaurant details...</p>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-gray-900 mb-2">Restaurant not found</p>
          <Link href="/admin/distribution/restaurants">
            <Button>Back to Locations</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AdminHeader title={`Edit Location: ${restaurant.name}`} />

      <div className="p-8">
        {/* Back Button */}
        <Link href="/admin/distribution/restaurants" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Locations
        </Link>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {/* Status Control */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Location Status</h3>
                <p className="text-sm text-gray-600">Control whether this location appears on the public website</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-full font-medium ${
                  restaurant.status === 'OPEN'
                    ? 'bg-green-100 text-green-700'
                    : restaurant.status === 'CLOSED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {restaurant.status}
                </span>
                <div className="flex gap-2">
                  {restaurant.status !== 'OPEN' && (
                    <Button onClick={() => handleStatusToggle('OPEN')} variant="outline" size="sm">
                      <Power className="w-4 h-4 mr-1" />
                      Open
                    </Button>
                  )}
                  {restaurant.status !== 'TEMPORARILY_CLOSED' && (
                    <Button onClick={() => handleStatusToggle('TEMPORARILY_CLOSED')} variant="outline" size="sm">
                      Temp Close
                    </Button>
                  )}
                  {restaurant.status !== 'CLOSED' && (
                    <Button onClick={() => handleStatusToggle('CLOSED')} variant="outline" size="sm">
                      Close
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="CLASSICAL_FINE_DINING">Classical Fine Dining</option>
                      <option value="CAFETERIA">Cafeteria</option>
                      <option value="QUICK_SERVICE">Quick Service</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="Brief description of this location..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{restaurant.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="text-gray-600">Capacity</span>
                  <span className="font-semibold">{restaurant.capacity} seats</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Update Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    min="0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Operating Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
                  <input
                    type="time"
                    value={formData.openingTime}
                    onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
                  <input
                    type="time"
                    value={formData.closingTime}
                    onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parking Information</label>
                  <textarea
                    value={formData.parkingInfo}
                    onChange={(e) => setFormData({ ...formData, parkingInfo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    rows={2}
                    placeholder="Parking details..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Story</label>
                  <textarea
                    value={formData.story}
                    onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    rows={4}
                    placeholder="Tell the story of this location..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.privateRooms}
                      onChange={(e) => setFormData({ ...formData, privateRooms: e.target.checked })}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Private Rooms Available</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.outdoorSeating}
                      onChange={(e) => setFormData({ ...formData, outdoorSeating: e.target.checked })}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Outdoor Seating Available</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end gap-3">
            <Link href="/admin/distribution/restaurants">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
