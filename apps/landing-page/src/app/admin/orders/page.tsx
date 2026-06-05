'use client'

import { useQuery } from '@tanstack/react-query'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Package, DollarSign, Calendar, User, MapPin, Eye, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useCallback } from 'react'

interface OrderItem {
  id: string
  quantity: number
  price: number
  menuItem?: {
    id: string
    name: string
    price: number
  }
  product?: {
    id: string
    name: string
    price: number
  }
}

interface Order {
  id: string
  orderNumber: string
  type: string
  status: string
  total: number
  createdAt: string
  customerName: string | null
  phoneNumber: string | null
  deliveryAddress: string | null
  shippingAddress: string | null
  tableNumber: string | null
  user: {
    id: string
    name: string | null
    email: string | null
  }
  restaurant?: {
    id: string
    name: string
    address: string
    city: string
    state: string
  }
  items: OrderItem[]
}

interface OrdersResponse {
  orders: Order[]
  stats: {
    totalOrders: number
    pending: number
    processing: number
    delivered: number
    totalRevenue: number
  }
  pagination: {
    page: number
    limit: number
    totalPages: number
    totalCount: number
  }
}

export default function OrdersPage() {
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading, error } = useQuery<OrdersResponse>({
    queryKey: ['admin-orders', typeFilter, statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (typeFilter !== 'all') params.set('type', typeFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      params.set('page', page.toString())
      params.set('limit', limit.toString())

      const res = await fetch(`/api/admin/orders?${params}`)
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to fetch orders')
      }
      return res.json()
    },
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
  })

  // Fetch order details only when dialog opens
  const { data: orderDetails, isLoading: isLoadingDetails } = useQuery<Order>({
    queryKey: ['admin-order-details', selectedOrderId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/orders/${selectedOrderId}`)
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to fetch order details')
      }
      return res.json()
    },
    enabled: !!selectedOrderId && isDetailsOpen,
    staleTime: 60000, // Cache for 1 minute
  })

  // Reset to page 1 when filters change
  const handleTypeFilterChange = useCallback((value: string) => {
    setTypeFilter(value)
    setPage(1)
  }, [])

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value)
    setPage(1)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'DELIVERED':
        return 'bg-green-100 text-green-700'
      case 'CONFIRMED':
      case 'PREPARING':
      case 'READY':
        return 'bg-blue-100 text-blue-700'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700'
      case 'CANCELLED':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getOrderTypeLabel = (type: string) => {
    switch (type) {
      case 'DINE_IN':
        return 'Dine In'
      case 'TAKEAWAY':
        return 'Takeaway'
      case 'DELIVERY':
        return 'Delivery'
      case 'ONLINE_RETAIL':
        return 'Online Retail'
      case 'B2B_WHOLESALE':
        return 'B2B Wholesale'
      default:
        return type
    }
  }

  const getOrderAddress = (order: Order) => {
    if (order.type === 'DINE_IN' && order.restaurant) {
      return `Table ${order.tableNumber} - ${order.restaurant.name}, ${order.restaurant.city}`
    }
    if (order.type === 'DELIVERY' && order.deliveryAddress) {
      return order.deliveryAddress
    }
    if (order.shippingAddress) {
      return order.shippingAddress
    }
    if (order.restaurant) {
      return `${order.restaurant.address}, ${order.restaurant.city}`
    }
    return 'N/A'
  }

  if (isLoading) {
    return (
      <div>
        <AdminHeader title="Orders" />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <AdminHeader title="Orders" />
        <div className="p-8">
          <Card>
            <CardContent className="p-6 text-center text-red-600">
              Error loading orders: {error.message}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const orders = data?.orders || []
  const stats = data?.stats || {
    totalOrders: 0,
    pending: 0,
    processing: 0,
    delivered: 0,
    totalRevenue: 0,
  }
  const pagination = data?.pagination || {
    page: 1,
    limit: 20,
    totalPages: 1,
    totalCount: 0,
  }

  return (
    <div>
      <AdminHeader title="Orders" />

      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Processing</p>
              <p className="text-3xl font-bold text-blue-600">{stats.processing}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Revenue</p>
              <p className="text-3xl font-bold text-green-600">
                ${(stats.totalRevenue / 1000).toFixed(1)}K
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg"
              value={typeFilter}
              onChange={(e) => handleTypeFilterChange(e.target.value)}
            >
              <option value="all">All Orders</option>
              <option value="DINE_IN">Dine In</option>
              <option value="TAKEAWAY">Takeaway</option>
              <option value="DELIVERY">Delivery</option>
              <option value="ONLINE_RETAIL">Online Retail</option>
              <option value="B2B_WHOLESALE">B2B Wholesale</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg"
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY">Ready</option>
              <option value="COMPLETED">Completed</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, pagination.totalCount)} of {pagination.totalCount}
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              No orders found
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{order.orderNumber}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                          {getOrderTypeLabel(order.type)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {order.customerName || order.user.name || 'Guest'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {(order as any).itemCount || order.items?.length || 0} items
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{getOrderAddress(order)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      {order.user.email || order.phoneNumber || 'No contact info'}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedOrderId(order.id)
                          setIsDetailsOpen(true)
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Page {page} of {pagination.totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              {orderDetails?.orderNumber || 'Loading...'}
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : orderDetails ? (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderDetails.status)}`}>
                    {orderDetails.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <p className="mt-1">{getOrderTypeLabel(orderDetails.type)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="mt-1">{new Date(orderDetails.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total</p>
                  <p className="mt-1 text-lg font-bold">${orderDetails.total.toFixed(2)}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="mt-1">{orderDetails.customerName || orderDetails.user.name || 'Guest'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1">{orderDetails.user.email || 'N/A'}</p>
                  </div>
                  {orderDetails.phoneNumber && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="mt-1">{orderDetails.phoneNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">
                  {orderDetails.type === 'DINE_IN' ? 'Location' : 'Address'}
                </h3>
                <p className="text-gray-700">{getOrderAddress(orderDetails)}</p>
              </div>

              {/* Items */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-3">
                  {orderDetails.items.map((item) => {
                    const itemName = item.menuItem?.name || item.product?.name || 'Unknown Item'
                    const itemPrice = item.menuItem?.price || item.product?.price || item.price

                    return (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex-1">
                          <p className="font-medium">{itemName}</p>
                          <p className="text-sm text-gray-500">
                            ${itemPrice.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">
                          ${(itemPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <p className="font-bold text-lg">Total</p>
                  <p className="font-bold text-lg">${orderDetails.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
