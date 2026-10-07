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
  Gift,
  Bell,
  Send,
  MessageSquare,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function FarmProductsOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  // Notifications state
  const [notifications, setNotifications] = useState<Record<string, any[]>>({})
  const [loadingNotifications, setLoadingNotifications] = useState<Record<string, boolean>>({})
  const [notificationDialog, setNotificationDialog] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<any | null>(null)
  const [notificationData, setNotificationData] = useState({
    step: 1,
    message: '',
    sentVia: 'WHATSAPP' as const,
    response: '',
    useTemplate: true,
    productName: '',
    price: '',
  })
  const [sendingNotification, setSendingNotification] = useState(false)

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

  const fetchNotifications = async (orderId: string) => {
    setLoadingNotifications({ ...loadingNotifications, [orderId]: true })
    try {
      const response = await fetch(`/api/admin/farm-products/orders/${orderId}/notifications`)
      const data = await response.json()

      if (data.success) {
        setNotifications({ ...notifications, [orderId]: data.data.notifications })
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoadingNotifications({ ...loadingNotifications, [orderId]: false })
    }
  }

  const openNotificationDialog = (order: any) => {
    setCurrentOrder(order)
    setNotificationData({
      step: 1,
      message: '',
      sentVia: 'WHATSAPP',
      response: '',
      useTemplate: true,
      productName: order.items[0]?.productName || '',
      price: order.items[0]?.pricePerUnit || '',
    })
    setNotificationDialog(true)

    // Fetch existing notifications if not already loaded
    if (!notifications[order.id]) {
      fetchNotifications(order.id)
    }
  }

  const handleSendNotification = async () => {
    if (!currentOrder) return

    if (!notificationData.useTemplate && !notificationData.message) {
      alert('Please enter a message')
      return
    }

    if (notificationData.step === 1 && notificationData.useTemplate) {
      if (!notificationData.productName || !notificationData.price) {
        alert('Product name and price are required for Step 1 template')
        return
      }
    }

    setSendingNotification(true)

    try {
      const response = await fetch(`/api/admin/farm-products/orders/${currentOrder.id}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: notificationData.step,
          message: notificationData.useTemplate ? undefined : notificationData.message,
          sentVia: notificationData.sentVia,
          response: notificationData.response || undefined,
          productName: notificationData.step === 1 ? notificationData.productName : undefined,
          price: notificationData.step === 1 ? parseFloat(notificationData.price) : undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert('Notification sent successfully')
        // Refresh notifications
        fetchNotifications(currentOrder.id)
        // Reset form
        setNotificationData({
          ...notificationData,
          message: '',
          response: '',
        })
      } else {
        alert(data.message || 'Failed to send notification')
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      alert('Failed to send notification')
    } finally {
      setSendingNotification(false)
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

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openNotificationDialog(order)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Notify
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
                              {order.deliveryLatitude && order.deliveryLongitude && (
                                <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                                  <p className="text-xs font-semibold text-blue-900 mb-1 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    GPS Coordinates
                                  </p>
                                  <p className="text-xs text-blue-700">
                                    Lat: {parseFloat(order.deliveryLatitude).toFixed(6)},
                                    Lng: {parseFloat(order.deliveryLongitude).toFixed(6)}
                                  </p>
                                  <a
                                    href={`https://www.google.com/maps?q=${order.deliveryLatitude},${order.deliveryLongitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                                  >
                                    View on Google Maps →
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Payment Details */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Payment Details</h4>
                            <div className="space-y-2">
                              {order.referralDiscount > 0 ? (
                                <>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Original Subtotal</span>
                                    <span className="font-semibold line-through text-gray-400">
                                      {formatPrice(parseFloat(order.subtotal) + parseFloat(order.referralDiscount))}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm bg-purple-50 -mx-3 px-3 py-1.5 rounded">
                                    <span className="text-purple-700 font-semibold flex items-center gap-1">
                                      <Gift className="h-3 w-3" />
                                      Referral Discount
                                    </span>
                                    <span className="font-bold text-purple-600">- {formatPrice(order.referralDiscount)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm bg-green-50 -mx-3 px-3 py-1.5 rounded">
                                    <span className="text-green-700 font-semibold">New Subtotal</span>
                                    <span className="font-bold text-green-600">{formatPrice(order.subtotal)}</span>
                                  </div>
                                </>
                              ) : (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Subtotal</span>
                                  <span className="font-semibold">{formatPrice(order.subtotal)}</span>
                                </div>
                              )}
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
                              {order.referralDiscount > 0 && (
                                <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-200">
                                  <p className="text-xs text-purple-900 font-semibold">
                                    💜 Customer saved {formatPrice(order.referralDiscount)} with referral code!
                                  </p>
                                </div>
                              )}
                              {order.paymentReference && (
                                <p className="text-xs text-gray-600 mt-2">
                                  Ref: {order.paymentReference}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="mb-6">
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

                        {/* Notifications History */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">Notification History</h4>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => fetchNotifications(order.id)}
                              disabled={loadingNotifications[order.id]}
                            >
                              {loadingNotifications[order.id] ? 'Loading...' : 'Refresh'}
                            </Button>
                          </div>

                          {!notifications[order.id] && !loadingNotifications[order.id] ? (
                            <p className="text-sm text-gray-500 text-center py-4">
                              Click "Notify" to send customer notifications
                            </p>
                          ) : loadingNotifications[order.id] ? (
                            <div className="text-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#15803D] mx-auto"></div>
                            </div>
                          ) : notifications[order.id]?.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">
                              No notifications sent yet
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {notifications[order.id]?.map((notif: any) => (
                                <div
                                  key={notif.id}
                                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Badge className="bg-blue-100 text-blue-700">
                                        Step {notif.step}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {notif.sentVia}
                                      </Badge>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {new Date(notif.sentAt).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="bg-white p-2 rounded border border-gray-200 mb-2">
                                    <p className="text-sm text-gray-900">{notif.message}</p>
                                  </div>
                                  {notif.response && (
                                    <div className="bg-green-50 p-2 rounded border border-green-200">
                                      <p className="text-xs font-semibold text-green-900 mb-1">
                                        Customer Response:
                                      </p>
                                      <p className="text-sm text-green-800">{notif.response}</p>
                                      {notif.respondedAt && (
                                        <p className="text-xs text-green-600 mt-1">
                                          {new Date(notif.respondedAt).toLocaleString()}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
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

      {/* Notification Dialog */}
      <Dialog open={notificationDialog} onOpenChange={setNotificationDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>
              Send a customer notification for order {currentOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Step Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Step <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setNotificationData({ ...notificationData, step })}
                    className={`p-3 rounded-lg border-2 text-center transition-colors ${
                      notificationData.step === step
                        ? 'border-[#15803D] bg-green-50 text-[#15803D]'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <p className="font-semibold">Step {step}</p>
                    <p className="text-xs mt-1">
                      {step === 1 && 'At Farm'}
                      {step === 2 && 'Ready in Buea'}
                      {step === 3 && 'Being Fulfilled'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Template Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useTemplate"
                checked={notificationData.useTemplate}
                onChange={(e) =>
                  setNotificationData({ ...notificationData, useTemplate: e.target.checked })
                }
                className="h-4 w-4 text-[#15803D] border-gray-300 rounded focus:ring-[#15803D]"
              />
              <label htmlFor="useTemplate" className="text-sm font-medium text-gray-700">
                Use template message
              </label>
            </div>

            {/* Step 1 Template Fields */}
            {notificationData.useTemplate && notificationData.step === 1 && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={notificationData.productName}
                    onChange={(e) =>
                      setNotificationData({ ...notificationData, productName: e.target.value })
                    }
                    placeholder="e.g., Tomatoes"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (XAF) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={notificationData.price}
                    onChange={(e) =>
                      setNotificationData({ ...notificationData, price: e.target.value })
                    }
                    placeholder="e.g., 500"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  />
                </div>
                <div className="col-span-2 mt-2">
                  <p className="text-xs text-blue-700 font-medium mb-1">Template Preview:</p>
                  <div className="p-2 bg-white rounded border border-blue-200">
                    <p className="text-sm">
                      Hi! I'm at the farm. {notificationData.productName || '[Product]'} is
                      available at {notificationData.price || '[Price]'} XAF. Should I lock in your
                      order?
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 Template Preview */}
            {notificationData.useTemplate && notificationData.step === 2 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700 font-medium mb-1">Template Preview:</p>
                <div className="p-2 bg-white rounded border border-blue-200">
                  <p className="text-sm">
                    Your order {currentOrder?.orderNumber} is ready in Buea! Would you like to pick
                    it up or should we deliver it to you?
                  </p>
                </div>
              </div>
            )}

            {/* Step 3 Template Preview */}
            {notificationData.useTemplate && notificationData.step === 3 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700 font-medium mb-1">Template Preview:</p>
                <div className="p-2 bg-white rounded border border-blue-200">
                  <p className="text-sm">
                    Order {currentOrder?.orderNumber} is being fulfilled. Please sign upon
                    receipt/delivery.
                  </p>
                </div>
              </div>
            )}

            {/* Custom Message */}
            {!notificationData.useTemplate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={notificationData.message}
                  onChange={(e) =>
                    setNotificationData({ ...notificationData, message: e.target.value })
                  }
                  placeholder="Enter your custom message"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                />
              </div>
            )}

            {/* Sent Via */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Send Via <span className="text-red-500">*</span>
              </label>
              <select
                value={notificationData.sentVia}
                onChange={(e) =>
                  setNotificationData({
                    ...notificationData,
                    sentVia: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
              >
                <option value="WHATSAPP">WhatsApp</option>
                <option value="SMS">SMS</option>
                <option value="CALL">Phone Call</option>
                <option value="MANUAL">Manual/Other</option>
              </select>
            </div>

            {/* Customer Response */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Response <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                value={notificationData.response}
                onChange={(e) =>
                  setNotificationData({ ...notificationData, response: e.target.value })
                }
                placeholder="Record customer's response (optional)"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
              />
            </div>

            {/* Existing Notifications Preview */}
            {notifications[currentOrder?.id]?.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Previous Notifications ({notifications[currentOrder?.id]?.length})
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {notifications[currentOrder?.id]?.map((notif: any) => (
                    <div key={notif.id} className="p-2 bg-gray-50 rounded text-xs">
                      <span className="font-semibold">Step {notif.step}</span> •{' '}
                      {new Date(notif.sentAt).toLocaleDateString()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setNotificationDialog(false)}
              disabled={sendingNotification}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSendNotification}
              disabled={sendingNotification}
              className="bg-[#15803D] hover:bg-[#166534]"
            >
              {sendingNotification ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
