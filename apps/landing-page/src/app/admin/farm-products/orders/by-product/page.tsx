'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Package,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Download,
} from 'lucide-react'

interface ProductOrderStats {
  productId: string
  productName: string
  productSku: string
  productImage: string
  totalQuantity: number
  totalOrders: number
  totalRevenue: number
  pendingQuantity: number
  completedQuantity: number
  category: string
}

export default function OrdersByProductPage() {
  const [productStats, setProductStats] = useState<ProductOrderStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'quantity' | 'revenue' | 'orders'>('quantity')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [fulfillmentFilter, setFulfillmentFilter] = useState<'ALL' | 'PREORDER' | 'DELIVERY' | 'PICKUP'>('ALL')

  useEffect(() => {
    fetchProductStats()
  }, [fulfillmentFilter])

  const fetchProductStats = async () => {
    setLoading(true)
    try {
      let url = '/api/admin/farm-products/orders/by-product'

      if (fulfillmentFilter !== 'ALL') {
        url += `?fulfillmentType=${fulfillmentFilter}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setProductStats(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching product stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const filteredProducts = productStats.filter((product) =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.productSku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let compareValue = 0

    switch (sortBy) {
      case 'quantity':
        compareValue = a.totalQuantity - b.totalQuantity
        break
      case 'revenue':
        compareValue = a.totalRevenue - b.totalRevenue
        break
      case 'orders':
        compareValue = a.totalOrders - b.totalOrders
        break
    }

    return sortOrder === 'asc' ? compareValue : -compareValue
  })

  const totalStats = productStats.reduce(
    (acc, product) => ({
      totalQuantity: acc.totalQuantity + product.totalQuantity,
      totalOrders: acc.totalOrders + product.totalOrders,
      totalRevenue: acc.totalRevenue + product.totalRevenue,
    }),
    { totalQuantity: 0, totalOrders: 0, totalRevenue: 0 }
  )

  const handleSort = (field: 'quantity' | 'revenue' | 'orders') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Orders by Product" />

      <main className="p-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Products Ordered</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {productStats.length}
                  </p>
                </div>
                <Package className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Units Ordered</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {totalStats.totalQuantity.toLocaleString()}
                  </p>
                </div>
                <ShoppingCart className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    XAF {totalStats.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {/* Fulfillment Type Filter */}
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-gray-700 mr-2">Filter by:</span>
              <button
                onClick={() => setFulfillmentFilter('ALL')}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  fulfillmentFilter === 'ALL'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                All Orders
              </button>
              <button
                onClick={() => setFulfillmentFilter('PREORDER')}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  fulfillmentFilter === 'PREORDER'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Pre-Orders Only
              </button>
              <button
                onClick={() => setFulfillmentFilter('DELIVERY')}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  fulfillmentFilter === 'DELIVERY'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Delivery Only
              </button>
              <button
                onClick={() => setFulfillmentFilter('PICKUP')}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  fulfillmentFilter === 'PICKUP'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Pickup Only
              </button>
              <button
                onClick={handlePrint}
                className="ml-auto px-4 py-2 rounded-lg border text-sm bg-gray-700 text-white border-gray-700 hover:bg-gray-800 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Print List
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSort('quantity')}
                  className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                    sortBy === 'quantity'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Quantity
                  {sortBy === 'quantity' && (
                    sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleSort('revenue')}
                  className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                    sortBy === 'revenue'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Revenue
                  {sortBy === 'revenue' && (
                    sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleSort('orders')}
                  className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                    sortBy === 'orders'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Orders
                  {sortBy === 'orders' && (
                    sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No products found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Quantity
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Orders
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedProducts.map((product) => (
                      <tr key={product.productId} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img
                              src={product.productImage || '/placeholder-product.png'}
                              alt={product.productName}
                              className="w-12 h-12 rounded-lg object-cover mr-4"
                            />
                            <div>
                              <div className="font-medium text-gray-900">{product.productName}</div>
                              <div className="text-sm text-gray-500">SKU: {product.productSku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="font-semibold text-gray-900">
                            {product.totalQuantity.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {product.pendingQuantity > 0 && (
                              <span className="text-yellow-600">
                                {product.pendingQuantity} pending
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="font-medium text-gray-900">{product.totalOrders}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="font-semibold text-gray-900">
                            XAF {product.totalRevenue.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col gap-1">
                            {product.completedQuantity > 0 && (
                              <Badge variant="success" className="text-xs">
                                {product.completedQuantity} completed
                              </Badge>
                            )}
                            {product.pendingQuantity > 0 && (
                              <Badge variant="warning" className="text-xs">
                                {product.pendingQuantity} pending
                              </Badge>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back Link */}
        <div className="mt-6">
          <Link
            href="/admin/farm-products/orders"
            className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
          >
            ← Back to All Orders
          </Link>
        </div>
      </main>
    </div>
  )
}
