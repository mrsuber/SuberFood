'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Clock,
  Package,
  CheckCircle,
  Truck,
  Phone,
  Star,
  Navigation,
} from 'lucide-react'

interface TrackingData {
  orderNumber: string
  customerName: string
  status: string
  estimatedArrival: string | null
  actualDeliveryTime: string | null
  deliveryAddress: string
  deliveryInstructions: string | null
  driver: {
    name: string
    phone: string
    rating: number | null
  } | null
  items: Array<{
    productName: string
    quantity: number
    unit: string
    productImage: string | null
  }>
  totalAmount: number
  timeline: Array<{
    status: string
    note: string | null
    timestamp: string
  }>
  currentLocation: {
    latitude: number
    longitude: number
    lastUpdate: string
    speed: number | null
    heading: number | null
  } | null
}

export default function TrackDeliveryPage() {
  const params = useParams()
  const trackingCode = params.trackingCode as string

  const [tracking, setTracking] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTracking()
    // Poll for updates every 10 seconds if delivery is in progress
    const interval = setInterval(() => {
      if (tracking && ['IN_TRANSIT', 'PICKED_UP', 'ASSIGNED'].includes(tracking.status)) {
        fetchTracking()
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [trackingCode])

  const fetchTracking = async () => {
    try {
      const response = await fetch(`/api/track/${trackingCode}`)
      const data = await response.json()

      if (data.success) {
        setTracking(data.tracking)
      } else {
        setError(data.message || 'Tracking information not found')
      }
    } catch (err) {
      setError('Failed to fetch tracking information')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      PENDING: { label: 'Pending', className: 'bg-gray-100 text-gray-700', icon: Clock },
      ASSIGNED: { label: 'Driver Assigned', className: 'bg-blue-100 text-blue-700', icon: CheckCircle },
      PICKED_UP: { label: 'Picked Up', className: 'bg-indigo-100 text-indigo-700', icon: Package },
      IN_TRANSIT: { label: 'On The Way', className: 'bg-purple-100 text-purple-700', icon: Truck },
      ARRIVED: { label: 'Arrived', className: 'bg-yellow-100 text-yellow-700', icon: MapPin },
      DELIVERED: { label: 'Delivered', className: 'bg-green-100 text-green-700', icon: CheckCircle },
      FAILED: { label: 'Delivery Failed', className: 'bg-red-100 text-red-700', icon: Clock },
      CANCELLED: { label: 'Cancelled', className: 'bg-gray-100 text-gray-700', icon: Clock },
    }

    const config = statusConfig[status] || statusConfig.PENDING
    const Icon = config.icon

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#15803D] mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading tracking information...</p>
        </div>
      </div>
    )
  }

  if (error || !tracking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Tracking Not Found</h2>
              <p className="text-gray-600">{error || 'Unable to find tracking information for this code.'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Delivery</h1>
          <p className="text-gray-600">Order #{tracking.orderNumber}</p>
        </div>

        {/* Status Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Delivery Status</h2>
                {getStatusBadge(tracking.status)}
              </div>
              {tracking.currentLocation && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Last updated</p>
                  <p className="text-sm font-medium">
                    {new Date(tracking.currentLocation.lastUpdate).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>

            {tracking.estimatedArrival && !tracking.actualDeliveryTime && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Estimated Arrival</p>
                    <p className="text-lg font-bold text-blue-600">
                      {new Date(tracking.estimatedArrival).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {tracking.actualDeliveryTime && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Delivered At</p>
                    <p className="text-lg font-bold text-green-600">
                      {new Date(tracking.actualDeliveryTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Driver Info */}
        {tracking.driver && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-[#15803D]" />
                Your Driver
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg text-gray-900">{tracking.driver.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <a
                      href={`tel:${tracking.driver.phone}`}
                      className="text-[#15803D] hover:underline"
                    >
                      {tracking.driver.phone}
                    </a>
                  </div>
                </div>
                {tracking.driver.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{tracking.driver.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delivery Address */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#15803D]" />
              Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">{tracking.deliveryAddress}</p>
            {tracking.deliveryInstructions && (
              <p className="text-sm text-gray-600 mt-2">
                <strong>Instructions:</strong> {tracking.deliveryInstructions}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Delivery Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tracking.timeline.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-[#15803D]' : 'bg-gray-300'}`} />
                    {index < tracking.timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-300 flex-1 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      {getStatusBadge(event.status)}
                      <span className="text-sm text-gray-600">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {event.note && (
                      <p className="text-sm text-gray-600 mt-1">{event.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tracking.items.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  {item.productImage && (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-[#15803D]">
                  {Number(tracking.totalAmount).toLocaleString()} XAF
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
