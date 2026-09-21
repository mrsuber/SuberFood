'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function NewFarmProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    slug: '',
    description: '',
    category: 'FRESH_VEGETABLES',
    subcategory: '',
    priceType: 'RETAIL_ONLY',
    retailPrice: '',
    retailUnit: 'kg',
    retailMinQty: '1',
    bulkPrice: '',
    bulkUnit: '',
    bulkQtyPerUnit: '',
    bulkMinOrder: '',
    stockQuantity: '',
    stockUnit: 'kg',
    lowStockThreshold: '',
    reorderPoint: '',
    farmSource: '',
    harvestDate: '',
    expiryDate: '',
    batchNumber: '',
    isOrganic: false,
    isCertified: false,
    isInSeason: true,
    isFeatured: false,
    weight: '',
    weightUnit: 'kg',
    metaTitle: '',
    metaDescription: '',
    status: 'ACTIVE',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // Auto-generate slug from name
    if (name === 'name' && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData((prev) => ({ ...prev, slug }))
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.sku.trim()) newErrors.sku = 'SKU is required'
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required'
    if (!formData.stockQuantity) newErrors.stockQuantity = 'Stock quantity is required'

    if (formData.priceType === 'RETAIL_ONLY' || formData.priceType === 'BOTH') {
      if (!formData.retailPrice) newErrors.retailPrice = 'Retail price is required'
      if (!formData.retailUnit.trim()) newErrors.retailUnit = 'Retail unit is required'
    }

    if (formData.priceType === 'BULK_ONLY' || formData.priceType === 'BOTH') {
      if (!formData.bulkPrice) newErrors.bulkPrice = 'Bulk price is required'
      if (!formData.bulkUnit.trim()) newErrors.bulkUnit = 'Bulk unit is required'
      if (!formData.bulkQtyPerUnit) newErrors.bulkQtyPerUnit = 'Bulk quantity per unit is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/farm-products/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        router.push('/admin/farm-products/products')
      } else {
        alert(data.message || 'Failed to create product')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Failed to create product')
    } finally {
      setLoading(false)
    }
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
      <AdminHeader title="Farm Products - New Product" />

      <div className="p-8 max-w-5xl">
        <div className="mb-6">
          <Link href="/admin/farm-products/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D] ${
                      errors.sku ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., FP-001"
                  />
                  {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D] ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Fresh Spinach"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D] ${
                      errors.slug ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., fresh-spinach"
                  />
                  {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  placeholder="Product description..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Type *
                </label>
                <select
                  name="priceType"
                  value={formData.priceType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                >
                  <option value="RETAIL_ONLY">Retail Only</option>
                  <option value="BULK_ONLY">Bulk Only</option>
                  <option value="BOTH">Both Retail and Bulk</option>
                </select>
              </div>

              {(formData.priceType === 'RETAIL_ONLY' || formData.priceType === 'BOTH') && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Retail Price (XAF) *
                    </label>
                    <input
                      type="number"
                      name="retailPrice"
                      value={formData.retailPrice}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D] ${
                        errors.retailPrice ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="500"
                    />
                    {errors.retailPrice && <p className="text-red-500 text-sm mt-1">{errors.retailPrice}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Retail Unit *
                    </label>
                    <input
                      type="text"
                      name="retailUnit"
                      value={formData.retailUnit}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D] ${
                        errors.retailUnit ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="kg"
                    />
                    {errors.retailUnit && <p className="text-red-500 text-sm mt-1">{errors.retailUnit}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Quantity
                    </label>
                    <input
                      type="number"
                      name="retailMinQty"
                      value={formData.retailMinQty}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                      placeholder="1"
                    />
                  </div>
                </div>
              )}

              {(formData.priceType === 'BULK_ONLY' || formData.priceType === 'BOTH') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bulk Price (XAF) *
                    </label>
                    <input
                      type="number"
                      name="bulkPrice"
                      value={formData.bulkPrice}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D] ${
                        errors.bulkPrice ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="10000"
                    />
                    {errors.bulkPrice && <p className="text-red-500 text-sm mt-1">{errors.bulkPrice}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bulk Unit *
                    </label>
                    <input
                      type="text"
                      name="bulkUnit"
                      value={formData.bulkUnit}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D] ${
                        errors.bulkUnit ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="25kg bag"
                    />
                    {errors.bulkUnit && <p className="text-red-500 text-sm mt-1">{errors.bulkUnit}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Qty Per Unit *
                    </label>
                    <input
                      type="number"
                      name="bulkQtyPerUnit"
                      value={formData.bulkQtyPerUnit}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D] ${
                        errors.bulkQtyPerUnit ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="25"
                    />
                    {errors.bulkQtyPerUnit && <p className="text-red-500 text-sm mt-1">{errors.bulkQtyPerUnit}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Order
                    </label>
                    <input
                      type="number"
                      name="bulkMinOrder"
                      value={formData.bulkMinOrder}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                      placeholder="1"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D] ${
                      errors.stockQuantity ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="100"
                  />
                  {errors.stockQuantity && <p className="text-red-500 text-sm mt-1">{errors.stockQuantity}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Unit *
                  </label>
                  <input
                    type="text"
                    name="stockUnit"
                    value={formData.stockUnit}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                    placeholder="kg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    name="lowStockThreshold"
                    value={formData.lowStockThreshold}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                    placeholder="20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Traceability */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Traceability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Farm Source
                  </label>
                  <input
                    type="text"
                    name="farmSource"
                    value={formData.farmSource}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                    placeholder="e.g., Green Valley Farm, Douala"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                    placeholder="e.g., BATCH-2026-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harvest Date
                  </label>
                  <input
                    type="date"
                    name="harvestDate"
                    value={formData.harvestDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Attributes */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Product Attributes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isOrganic"
                    checked={formData.isOrganic}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#15803D] border-gray-300 rounded focus:ring-[#15803D]"
                  />
                  <span className="text-sm text-gray-700">Organic</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isCertified"
                    checked={formData.isCertified}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#15803D] border-gray-300 rounded focus:ring-[#15803D]"
                  />
                  <span className="text-sm text-gray-700">Certified</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isInSeason"
                    checked={formData.isInSeason}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#15803D] border-gray-300 rounded focus:ring-[#15803D]"
                  />
                  <span className="text-sm text-gray-700">In Season</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#15803D] border-gray-300 rounded focus:ring-[#15803D]"
                  />
                  <span className="text-sm text-gray-700">Featured</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="DISCONTINUED">Discontinued</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#15803D] hover:bg-[#166534]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Product
                </>
              )}
            </Button>

            <Link href="/admin/farm-products/products">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
