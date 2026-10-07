'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Loader2, Upload, X, Image as ImageIcon, Plus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function EditFarmProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [thumbnail, setThumbnail] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // New category dialog state
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [customCategories, setCustomCategories] = useState<string[]>([])
  const [addingCategory, setAddingCategory] = useState(false)

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    slug: '',
    description: '',
    category: 'FRESH_VEGETABLES',
    subcategory: '',
    priceType: 'RETAIL_ONLY',
    farmCostRetail: '',
    farmCostBulk: '',
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

  // Fetch product data on mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/farm-products/products/${params.id}`)
        const data = await response.json()

        if (data.success) {
          const product = data.data

          // Populate form data
          setFormData({
            sku: product.sku || '',
            name: product.name || '',
            slug: product.slug || '',
            description: product.description || '',
            category: product.category || 'FRESH_VEGETABLES',
            subcategory: product.subcategory || '',
            priceType: product.priceType || 'RETAIL_ONLY',
            farmCostRetail: product.farmCostRetail ? product.farmCostRetail.toString() : '',
            farmCostBulk: product.farmCostBulk ? product.farmCostBulk.toString() : '',
            retailPrice: product.retailPrice ? product.retailPrice.toString() : '',
            retailUnit: product.retailUnit || 'kg',
            retailMinQty: product.retailMinQty ? product.retailMinQty.toString() : '1',
            bulkPrice: product.bulkPrice ? product.bulkPrice.toString() : '',
            bulkUnit: product.bulkUnit || '',
            bulkQtyPerUnit: product.bulkQtyPerUnit ? product.bulkQtyPerUnit.toString() : '',
            bulkMinOrder: product.bulkMinOrder ? product.bulkMinOrder.toString() : '',
            stockQuantity: product.stockQuantity ? product.stockQuantity.toString() : '',
            stockUnit: product.stockUnit || 'kg',
            lowStockThreshold: product.lowStockThreshold ? product.lowStockThreshold.toString() : '',
            reorderPoint: product.reorderPoint ? product.reorderPoint.toString() : '',
            farmSource: product.farmSource || '',
            harvestDate: product.harvestDate ? product.harvestDate.split('T')[0] : '',
            expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : '',
            batchNumber: product.batchNumber || '',
            isOrganic: product.isOrganic || false,
            isCertified: product.isCertified || false,
            isInSeason: product.isInSeason !== undefined ? product.isInSeason : true,
            isFeatured: product.isFeatured || false,
            weight: product.weight ? product.weight.toString() : '',
            weightUnit: product.weightUnit || 'kg',
            metaTitle: product.metaTitle || '',
            metaDescription: product.metaDescription || '',
            status: product.status || 'ACTIVE',
          })

          // Set images
          if (product.thumbnail) {
            setThumbnail(product.thumbnail)
          }
          if (product.images && Array.isArray(product.images)) {
            setImages(product.images)
          }
        } else {
          alert(data.message || 'Failed to fetch product')
          router.push('/admin/farm-products/products')
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        alert('Failed to fetch product')
        router.push('/admin/farm-products/products')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id, router])

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'farm-products')

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        const imageUrl = data.url
        if (!thumbnail) {
          setThumbnail(imageUrl)
        }
        if (!images.includes(imageUrl)) {
          setImages([...images, imageUrl])
        }
      } else {
        alert(data.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    // Check if "OTHER" was selected in category dropdown
    if (name === 'category' && value === 'OTHER') {
      setShowCategoryDialog(true)
      return // Don't update formData yet
    }

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }

      // Auto-calculate retail price from farm cost (farmCost * 1.4)
      if (name === 'farmCostRetail' && value) {
        const farmCost = parseFloat(value)
        if (!isNaN(farmCost)) {
          updated.retailPrice = (farmCost * 1.4).toFixed(2)
        }
      }

      // Auto-calculate bulk price from farm cost (farmCost * 1.4)
      if (name === 'farmCostBulk' && value) {
        const farmCost = parseFloat(value)
        if (!isNaN(farmCost)) {
          updated.bulkPrice = (farmCost * 1.4).toFixed(2)
        }
      }

      return updated
    })

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

    setSaving(true)

    try {
      const response = await fetch(`/api/admin/farm-products/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          thumbnail,
          images,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert('Product updated successfully')
        router.push('/admin/farm-products/products')
      } else {
        alert(data.message || 'Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      alert('Please enter a category name')
      return
    }

    const categoryValue = newCategoryName
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/(^_|_$)/g, '')

    if (!categoryValue) {
      alert('Invalid category name')
      return
    }

    // Add to custom categories
    setCustomCategories([...customCategories, categoryValue])

    // Update form data with new category
    setFormData({ ...formData, category: categoryValue })

    // Close dialog and reset
    setShowCategoryDialog(false)
    setNewCategoryName('')
  }

  const baseCategories = [
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

  const categories = [...baseCategories, ...customCategories, 'OTHER']

  return (
    <div>
      <AdminHeader title="Farm Products - Edit Product" />

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

          {/* Images */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drag and Drop Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Product Images
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-[#15803D] bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-12 w-12 text-[#15803D] animate-spin mb-2" />
                        <p className="text-gray-600">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-gray-600 mb-1">
                          <span className="text-[#15803D] font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-sm text-gray-500">PNG, JPG, WebP or GIF (max. 5MB)</p>
                      </>
                    )}
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  First image uploaded will be the thumbnail. Images are saved to your VPS.
                </p>
              </div>

              {/* Thumbnail Preview */}
              {thumbnail && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail
                  </label>
                  <div className="relative w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={thumbnail}
                      alt="Thumbnail"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setThumbnail('')
                        setImages(images.filter(img => img !== thumbnail))
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Additional Images */}
              {images.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gallery Images ({images.length})
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((img, index) => (
                      <div key={index} className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={img}
                          alt={`Image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = images.filter((_, i) => i !== index)
                            setImages(newImages)
                            if (img === thumbnail && newImages.length > 0) {
                              setThumbnail(newImages[0])
                            } else if (img === thumbnail) {
                              setThumbnail('')
                            }
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {img === thumbnail && (
                          <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                            Thumbnail
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {images.length === 0 && !thumbnail && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-1">No images added yet</p>
                  <p className="text-sm text-gray-500">Add image URLs above to display product images</p>
                </div>
              )}
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
                <>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Farm Cost per Retail Unit (What we pay farmer) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="farmCostRetail"
                      value={formData.farmCostRetail}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                      placeholder="e.g., 1000"
                    />
                    {formData.farmCostRetail && (
                      <div className="mt-3 text-sm space-y-1">
                        <div className="flex justify-between text-gray-700">
                          <span>Farm Cost:</span>
                          <span className="font-semibold">{parseFloat(formData.farmCostRetail).toLocaleString()} XAF</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                          <span>Transport (20%):</span>
                          <span className="font-semibold">{(parseFloat(formData.farmCostRetail) * 0.2).toLocaleString()} XAF</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                          <span>Our Profit (20%):</span>
                          <span className="font-semibold">{(parseFloat(formData.farmCostRetail) * 0.2).toLocaleString()} XAF</span>
                        </div>
                        <div className="flex justify-between text-green-800 font-bold text-base pt-2 border-t">
                          <span>Customer Pays:</span>
                          <span>{formData.retailPrice ? parseFloat(formData.retailPrice).toLocaleString() : '0'} XAF</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Retail Price (XAF) * (Auto-calculated)
                      </label>
                      <input
                        type="number"
                        name="retailPrice"
                        value={formData.retailPrice}
                        readOnly
                        className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed border-gray-300"
                        placeholder="Auto-calculated from farm cost"
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
                </>
              )}

              {(formData.priceType === 'BULK_ONLY' || formData.priceType === 'BOTH') && (
                <>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Farm Cost per Bulk Unit (What we pay farmer) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="farmCostBulk"
                      value={formData.farmCostBulk}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                      placeholder="e.g., 20000"
                    />
                    {formData.farmCostBulk && (
                      <div className="mt-3 text-sm space-y-1">
                        <div className="flex justify-between text-gray-700">
                          <span>Farm Cost:</span>
                          <span className="font-semibold">{parseFloat(formData.farmCostBulk).toLocaleString()} XAF</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                          <span>Transport (20%):</span>
                          <span className="font-semibold">{(parseFloat(formData.farmCostBulk) * 0.2).toLocaleString()} XAF</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                          <span>Our Profit (20%):</span>
                          <span className="font-semibold">{(parseFloat(formData.farmCostBulk) * 0.2).toLocaleString()} XAF</span>
                        </div>
                        <div className="flex justify-between text-green-800 font-bold text-base pt-2 border-t">
                          <span>Customer Pays:</span>
                          <span>{formData.bulkPrice ? parseFloat(formData.bulkPrice).toLocaleString() : '0'} XAF</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bulk Price (XAF) * (Auto-calculated)
                      </label>
                      <input
                        type="number"
                        name="bulkPrice"
                        value={formData.bulkPrice}
                        readOnly
                        className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed border-gray-300"
                        placeholder="Auto-calculated from farm cost"
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
                </>
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
              disabled={saving || loading}
              className="bg-[#15803D] hover:bg-[#166534]"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Product
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

      {/* Add Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new product category. The category name will be automatically formatted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Processed Foods, Beverages, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCategory()
                  }
                }}
              />
              {newCategoryName && (
                <p className="text-sm text-gray-500 mt-2">
                  Will be saved as: <span className="font-mono font-semibold">
                    {newCategoryName.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/(^_|_$)/g, '')}
                  </span>
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCategoryDialog(false)
                setNewCategoryName('')
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddCategory}
              disabled={!newCategoryName.trim()}
              className="bg-[#15803D] hover:bg-[#166534]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
