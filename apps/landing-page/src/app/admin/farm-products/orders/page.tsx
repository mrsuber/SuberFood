'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Package,
  Truck,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

export default function FarmProductsOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, paymentFilter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      let url = '/api/admin/farm-products/orders?'

      if (statusFilter !== 'all') {
        url += `status=${statusFilter}&`
      }

      if (paymentFilter !== 'all') {
        url += `paymentStatus=${paymentFilter}&`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setOrders(data.data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/farm-products/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (data.success) {
        fetchOrders()
      } else {
        alert(data.message || 'Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    }
  }

  const filteredOrders = orders.filter((order) =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.guestPhone?.includes(searchTerm)
  )

  const formatPrice = (price: number) => {
    return `${parseFloat(price.toString()).toLocaleString()} XAF`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-blue-100 text-blue-700',
      PREPARING: 'bg-purple-100 text-purple-700',
      READY_FOR_PICKUP: 'bg-green-100 text-green-700',
      OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-700',
      DELIVERED: 'bg-green-100 text-green-700',
      COMPLETED: 'bg-gray-100 text-gray-700',
      CANCELLED: 'bg-red-100 text-red-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getPaymentBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      PROCESSING: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-100 text-green-700',
      FAILED: 'bg-red-100 text-red-700',
      REFUNDED: 'bg-gray-100 text-gray-700',
      CANCELLED: 'bg-gray-100 text-gray-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getNextStatus = (currentStatus: string) => {
    const statusFlow: Record<string, string> = {
      PENDING: 'CONFIRMED',
      CONFIRMED: 'PREPARING',
      PREPARING: 'READY_FOR_PICKUP', // or OUT_FOR_DELIVERY
      READY_FOR_PICKUP: 'COMPLETED',
      OUT_FOR_DELIVERY: 'DELIVERED',
      DELIVERED: 'COMPLETED',
    }
    return statusFlow[currentStatus] || null
  }

  return (
    <div>
      <AdminHeader title="Farm Products - Orders" />

      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <p className="text-gray-600 mt-1">{filteredOrders.length} orders found</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                >
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PREPARING">Preparing</option>
                  <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Payment Filter */}
              <div>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                >
                  <option value="all">All Payments</option>
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#15803D] mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Orders will appear here once customers start placing them'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrder === order.id

              return (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{order.orderNumber}</h3>
                        <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusBadge(order.status)}>
                          {order.status.replace(/_/g, ' ')}
                        </Badge>
                        <Badge className={getPaymentBadge(order.paymentStatus)}>
                          {order.paymentStatus}
                        </Badge>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600">Customer</p>
                        <p className="font-semibold text-gray-900">{order.guestName}</p>
                        <p className="text-sm text-gray-600">{order.guestPhone}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-600">Fulfillment</p>
                        <p className="font-semibold text-gray-900 flex items-center gap-2">
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

                      <div>
                        <p className="text-xs text-gray-600">Items</p>
                        <p className="font-semibold text-gray-900">{order.items.length} items</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-600">Total</p>
                        <p className="font-semibold text-[#15803D] text-lg">
                          {formatPrice(order.totalAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-2" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-2" />
                            View Details
                          </>
                        )}
                      </Button>

                      {getNextStatus(order.status) && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                          className="bg-[#15803D] hover:bg-[#166534]"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Mark as {getNextStatus(order.status).replace(/_/g, ' ')}
                        </Button>
                      )}

                      {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                          {/* Customer Details */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                {order.guestPhone}
                              </p>
                              {order.guestEmail && (
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  {order.guestEmail}
                                </p>
                              )}
                              {order.fulfillmentType === 'DELIVERY' && order.deliveryAddress && (
                                <p className="text-sm text-gray-600 flex items-start gap-2">
                                  <MapPin className="h-4 w-4 mt-0.5" />
                                  {order.deliveryAddress}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Payment Details */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Payment Details</h4>
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
                              <div className="flex justify-between font-semibold pt-2 border-t">
                                <span>Total</span>
                                <span className="text-[#15803D]">{formatPrice(order.totalAmount)}</span>
                              </div>
                              {order.paymentReference && (
                                <p className="text-xs text-gray-600 mt-2">
                                  Ref: {order.paymentReference}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                          <div className="space-y-2">
                            {order.items.map((item: any) => (
                              <div
                                key={item.id}
                                className="flex justify-between items-center py-2 border-b last:border-0"
                              >
                                <div>
                                  <p className="font-medium text-gray-900">{item.productName}</p>
                                  <p className="text-sm text-gray-600">
                                    {item.purchaseType} • {parseFloat(item.quantity).toLocaleString()} {item.unit}
                                  </p>
                                </div>
                                <p className="font-semibold text-gray-900">
                                  {formatPrice(item.totalPrice)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
