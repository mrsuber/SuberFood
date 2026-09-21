'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertCircle,
  Leaf,
  Eye,
} from 'lucide-react'

export default function FarmProductsListPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchProducts()
  }, [categoryFilter, statusFilter])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      let url = '/api/admin/farm-products/products?'

      if (categoryFilter !== 'all') {
        url += `category=${categoryFilter}&`
      }

      if (statusFilter !== 'all') {
        url += `status=${statusFilter}&`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setProducts(data.data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/farm-products/products/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        fetchProducts()
      } else {
        alert(data.message || 'Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStockStatus = (product: any) => {
    const stock = parseFloat(product.stockQuantity)
    const threshold = parseFloat(product.lowStockThreshold || 0)

    if (stock === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-700' }
    } else if (threshold && stock <= threshold) {
      return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-700' }
    } else {
      return { label: 'In Stock', color: 'bg-green-100 text-green-700' }
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700',
      INACTIVE: 'bg-gray-100 text-gray-700',
      OUT_OF_STOCK: 'bg-red-100 text-red-700',
      DISCONTINUED: 'bg-gray-100 text-gray-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const categories = [
    'LEAFY_GREENS',
    'ROOT_VEGETABLES',
    'FRUITS',
    'LEGUMES',
    'GRAINS_CEREALS',
    'SEEDS_NUTS',
    'TUBERS',
    'HERBS_SPICES',
    'FRESH_VEGETABLES',
    'DAIRY_EGGS',
    'LIVESTOCK_MEAT',
    'FISH_SEAFOOD',
  ]

  return (
    <div>
      <AdminHeader title="Farm Products - Products" />

      <div className="p-8">
        {/* Header Actions */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Products</h2>
            <p className="text-gray-600 mt-1">{filteredProducts.length} products found</p>
          </div>
          <Link href="/admin/farm-products/products/new">
            <Button className="bg-[#15803D] hover:bg-[#166534]">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
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
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                >
                  <option value="all">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                  <option value="DISCONTINUED">Discontinued</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#15803D] mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first product'}
              </p>
              <Link href="/admin/farm-products/products/new">
                <Button className="bg-[#15803D] hover:bg-[#166534]">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product)

              return (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="relative h-24 w-24 flex-shrink-0 bg-gradient-to-br from-green-50 to-green-100 rounded-lg overflow-hidden">
                        {product.thumbnail ? (
                          <Image
                            src={product.thumbnail}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Leaf className="h-12 w-12 text-green-300" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
                            <p className="text-sm text-gray-600">
                              SKU: {product.sku} • {product.category.replace(/_/g, ' ')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusBadge(product.status)}>
                              {product.status}
                            </Badge>
                            <Badge className={stockStatus.color}>
                              {stockStatus.label}
                            </Badge>
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="flex items-center gap-6 mb-3">
                          {product.priceType === 'RETAIL_ONLY' || product.priceType === 'BOTH' ? (
                            <div>
                              <p className="text-xs text-gray-600">Retail Price</p>
                              <p className="font-semibold text-gray-900">
                                {parseFloat(product.retailPrice).toLocaleString()} XAF/{product.retailUnit}
                              </p>
                            </div>
                          ) : null}

                          {product.priceType === 'BULK_ONLY' || product.priceType === 'BOTH' ? (
                            <div>
                              <p className="text-xs text-gray-600">Bulk Price</p>
                              <p className="font-semibold text-gray-900">
                                {parseFloat(product.bulkPrice).toLocaleString()} XAF/{product.bulkUnit}
                              </p>
                            </div>
                          ) : null}

                          <div>
                            <p className="text-xs text-gray-600">Stock</p>
                            <p className="font-semibold text-gray-900">
                              {parseFloat(product.stockQuantity).toLocaleString()} {product.stockUnit}
                            </p>
                          </div>

                          {product.isOrganic && (
                            <Badge variant="outline" className="border-green-600 text-green-600">
                              Organic
                            </Badge>
                          )}
                          {product.isCertified && (
                            <Badge variant="outline" className="border-blue-600 text-blue-600">
                              Certified
                            </Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Link href={`/distribution/farm-products/${product.slug}`} target="_blank">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/admin/farm-products/products/${product.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </Link>
                          <Link href={`/admin/farm-products/products/${product.id}/stock`}>
                            <Button variant="outline" size="sm">
                              <Package className="h-4 w-4 mr-2" />
                              Manage Stock
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
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
