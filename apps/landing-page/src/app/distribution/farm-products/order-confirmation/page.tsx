'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/navigation/Navbar'
import { Footer } from '@/components/navigation/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useFarmCart } from '@/contexts/FarmCartContext'
import {
  CheckCircle2,
  Package,
  Truck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ArrowRight,
  Download,
  Home,
} from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  fulfillmentType: string
  guestName: string
  guestEmail: string | null
  guestPhone: string
  deliveryAddress: string | null
  deliveryCity: string | null
  deliveryState: string | null
  pickupLocation: string | null
  subtotal: number
  deliveryFee: number
  totalAmount: number
  paymentStatus: string
  status: string
  createdAt: string
  items: Array<{
    id: string
    productName: string
    quantity: number
    unit: string
    pricePerUnit: number
    totalPrice: number
    purchaseType: string
  }>
}

export default function OrderConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clearCart } = useFarmCart()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const orderNumber = searchParams.get('orderNumber')

  useEffect(() => {
    if (!orderNumber) {
      setError('No order number provided')
      setLoading(false)
      return
    }

    // Fetch order details
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/farm-products/orders?orderNumber=${orderNumber}`)
        const result = await response.json()

        if (!result.success) {
          setError(result.message || 'Failed to fetch order details')
          return
        }

        setOrder(result.data)

        // Clear the cart after successful order
        clearCart()
      } catch (err) {
        console.error('Error fetching order:', err)
        setError('Failed to load order details')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderNumber, clearCart])

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} XAF`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#15803D] mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading order details...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !order) {
    return (
      <>
        <Navbar />
        <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-red-600 mb-4">
              <Package className="h-24 w-24 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Order Not Found</h1>
              <p className="text-gray-600">{error || 'We could not find your order.'}</p>
            </div>
            <Link href="/distribution/farm-products">
              <Button className="bg-[#15803D] hover:bg-[#166534]">
                <Home className="h-4 w-4 mr-2" />
                Back to Shop
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <CheckCircle2 className="h-20 w-20 text-green-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-xl text-gray-600">
              Thank you for your order. We'll get started on it right away.
            </p>
          </div>

          {/* Order Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Order Details</span>
                <Badge variant={order.paymentStatus === 'COMPLETED' ? 'default' : 'secondary'}>
                  {order.paymentStatus === 'COMPLETED' ? 'Paid' : order.paymentStatus}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-semibold">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-semibold text-[#15803D]">{formatPrice(order.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fulfillment</p>
                  <p className="font-semibold flex items-center gap-2">
                    {order.fulfillmentType === 'DELIVERY' ? (
                      <>
                        <Truck className="h-4 w-4" />
                        Delivery
                      </>
                    ) : (
                      <>
                        <Package className="h-4 w-4" />
                        Pickup
                      </>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-[#15803D] mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold">{order.guestPhone}</p>
                </div>
              </div>
              {order.guestEmail && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-[#15803D] mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{order.guestEmail}</p>
                  </div>
                </div>
              )}
              {order.fulfillmentType === 'DELIVERY' && order.deliveryAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[#15803D] mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Delivery Address</p>
                    <p className="font-semibold">{order.deliveryAddress}</p>
                  </div>
                </div>
              )}
              {order.fulfillmentType === 'PICKUP' && order.pickupLocation && (
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-[#15803D] mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Pickup Location</p>
                    <p className="font-semibold">{order.pickupLocation}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Please bring your order number when picking up
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-600">
                        {item.purchaseType === 'RETAIL' ? 'Retail' : 'Bulk'} • {item.quantity} {item.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatPrice(item.totalPrice)}</p>
                      <p className="text-sm text-gray-600">
                        {formatPrice(item.pricePerUnit)}/{item.unit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-semibold">
                    {order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : 'Free'}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-[#15803D]">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.fulfillmentType === 'DELIVERY' ? (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 rounded-full p-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Order Confirmed</p>
                        <p className="text-sm text-gray-600">We've received your order</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-gray-100 rounded-full p-2">
                        <Package className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Preparing Your Order</p>
                        <p className="text-sm text-gray-600">We'll prepare your fresh products</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-gray-100 rounded-full p-2">
                        <Truck className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Delivery</p>
                        <p className="text-sm text-gray-600">
                          We'll deliver to your address. You'll receive updates via phone.
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 rounded-full p-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Order Confirmed</p>
                        <p className="text-sm text-gray-600">We've received your order</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-gray-100 rounded-full p-2">
                        <Package className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Preparing Your Order</p>
                        <p className="text-sm text-gray-600">
                          We'll prepare your fresh products for pickup
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-gray-100 rounded-full p-2">
                        <Calendar className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Pickup Ready</p>
                        <p className="text-sm text-gray-600">
                          We'll call you when your order is ready for pickup at {order.pickupLocation}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/distribution/farm-products" className="flex-1">
              <Button variant="outline" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            <Button className="flex-1 bg-[#15803D] hover:bg-[#166534]">
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
