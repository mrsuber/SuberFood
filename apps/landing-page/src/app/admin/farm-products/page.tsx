'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Leaf,
  ArrowRight,
} from 'lucide-react'

export default function FarmProductsAdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockItems: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch products stats
      const productsRes = await fetch('/api/admin/farm-products/products')
      const productsData = await productsRes.json()

      // Fetch orders stats
      const ordersRes = await fetch('/api/admin/farm-products/orders')
      const ordersData = await ordersRes.json()

      if (productsData.success && ordersData.success) {
        const products = productsData.data || []
        const orders = ordersData.data || []

        // Calculate stats
        const activeProducts = products.filter((p: any) => p.status === 'ACTIVE').length
        const lowStockProducts = products.filter(
          (p: any) => p.lowStockThreshold && parseFloat(p.stockQuantity) <= parseFloat(p.lowStockThreshold)
        ).length
        const outOfStockProducts = products.filter(
          (p: any) => parseFloat(p.stockQuantity) === 0
        ).length
        const pendingOrders = orders.filter(
          (o: any) => o.status === 'PENDING' || o.status === 'CONFIRMED'
        ).length
        const totalRevenue = orders
          .filter((o: any) => o.paymentStatus === 'COMPLETED')
          .reduce((sum: number, o: any) => sum + parseFloat(o.totalAmount), 0)

        // Get low stock items
        const lowStockItems = products
          .filter(
            (p: any) => p.lowStockThreshold && parseFloat(p.stockQuantity) <= parseFloat(p.lowStockThreshold)
          )
          .slice(0, 5)

        // Get recent orders
        const recentOrders = orders
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)

        setStats({
          totalProducts: products.length,
          activeProducts,
          lowStockProducts,
          outOfStockProducts,
          totalOrders: orders.length,
          pendingOrders,
          totalRevenue,
          recentOrders,
          lowStockItems,
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} XAF`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-blue-100 text-blue-700',
      PREPARING: 'bg-purple-100 text-purple-700',
      READY_FOR_PICKUP: 'bg-green-100 text-green-700',
      OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-700',
      DELIVERED: 'bg-green-100 text-green-700',
      COMPLETED: 'bg-gray-100 text-gray-700',
      CANCELLED: 'bg-red-100 text-red-700',
    }

    return statusColors[status] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div>
        <AdminHeader title="Farm Products" />
        <div className="p-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#15803D] mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AdminHeader title="Farm Products" />

      <div className="p-8">
        {/* Quick Actions */}
        <div className="mb-8 flex gap-4">
          <Link href="/admin/farm-products/products/new">
            <Button className="bg-[#15803D] hover:bg-[#166534]">
              <Package className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
          </Link>
          <Link href="/admin/farm-products/products">
            <Button variant="outline">
              <Leaf className="h-4 w-4 mr-2" />
              Manage Products
            </Button>
          </Link>
          <Link href="/admin/farm-products/orders">
            <Button variant="outline">
              <ShoppingCart className="h-4 w-4 mr-2" />
              View Orders
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Products</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                  <p className="text-sm text-green-600 mt-2">{stats.activeProducts} active</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-[#15803D]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                  <p className="text-sm text-blue-600 mt-2">{stats.pendingOrders} pending</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatPrice(stats.totalRevenue)}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">All time</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Stock Alerts</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.lowStockProducts}</p>
                  <p className="text-sm text-red-600 mt-2">{stats.outOfStockProducts} out of stock</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Link href="/admin/farm-products/orders">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {stats.recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {stats.recentOrders.map((order: any) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between py-3 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">
                          {order.guestName} • {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatPrice(order.totalAmount)}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(order.status)}`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Low Stock Alert
              </CardTitle>
              <Link href="/admin/farm-products/products?filter=lowStock">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {stats.lowStockItems.length === 0 ? (
                <div className="text-center py-8">
                  <Leaf className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <p className="text-gray-500">All products are well stocked!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.lowStockItems.map((product: any) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between py-3 border-b last:border-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">
                          {parseFloat(product.stockQuantity).toLocaleString()} {product.stockUnit}
                        </p>
                        <p className="text-xs text-gray-500">
                          Min: {parseFloat(product.lowStockThreshold).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
