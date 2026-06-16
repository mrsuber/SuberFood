'use client'

import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package, Save } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NewInventoryItemPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: 'PCS',
    rawStock: 0,
    minimumStock: 0,
    maximumStock: 0,
    reorderPoint: 0,
    reorderQuantity: 0,
    costPerUnit: 0,
    supplier: '',
    storageLocation: '',
    description: '',
    isCompound: false,
    imageUrl: '',
    size: '',
  })

  const categories = [
    { value: 'FLOUR_GRAIN', label: 'Flour & Grain' },
    { value: 'SUGAR_SWEETENER', label: 'Sugar & Sweeteners' },
    { value: 'DAIRY', label: 'Dairy Products' },
    { value: 'EGGS', label: 'Eggs' },
    { value: 'CHOCOLATE_COCOA', label: 'Chocolate & Cocoa' },
    { value: 'BAKING_SUPPLIES', label: 'Baking Supplies' },
    { value: 'OILS_FATS', label: 'Oils & Fats' },
    { value: 'SPICES_HERBS', label: 'Spices & Herbs' },
    { value: 'VEGETABLES', label: 'Vegetables' },
    { value: 'FRUITS', label: 'Fruits' },
    { value: 'MEAT', label: 'Meat' },
    { value: 'SEAFOOD', label: 'Seafood' },
    { value: 'POULTRY', label: 'Poultry' },
    { value: 'NUTS_SEEDS', label: 'Nuts & Seeds' },
    { value: 'CONDIMENTS', label: 'Condiments' },
    { value: 'BEVERAGES', label: 'Beverages' },
    { value: 'CANNED_GOODS', label: 'Canned Goods' },
    { value: 'FROZEN', label: 'Frozen' },
    { value: 'OTHER', label: 'Other' },
  ]

  const units = [
    { value: 'PCS', label: 'Pieces (PCS)' },
    { value: 'DOZEN', label: 'Dozen' },
    { value: 'KG', label: 'Kilograms (KG)' },
    { value: 'G', label: 'Grams (G)' },
    { value: 'L', label: 'Liters (L)' },
    { value: 'ML', label: 'Milliliters (ML)' },
    { value: 'LBS', label: 'Pounds (LBS)' },
    { value: 'OZ', label: 'Ounces (OZ)' },
    { value: 'CUPS', label: 'Cups' },
    { value: 'TBSP', label: 'Tablespoons (TBSP)' },
    { value: 'TSP', label: 'Teaspoons (TSP)' },
  ]

  const sizes = [
    { value: 'EXTRA_SMALL', label: 'Extra Small (XS)' },
    { value: 'SMALL', label: 'Small (S)' },
    { value: 'MEDIUM', label: 'Medium (M)' },
    { value: 'LARGE', label: 'Large (L)' },
    { value: 'EXTRA_LARGE', label: 'Extra Large (XL)' },
    { value: 'JUMBO', label: 'Jumbo (XXL)' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/inventory/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rawStock: Number(formData.rawStock),
          minimumStock: Number(formData.minimumStock),
          maximumStock: Number(formData.maximumStock) || null,
          reorderPoint: Number(formData.reorderPoint) || null,
          reorderQuantity: Number(formData.reorderQuantity) || null,
          costPerUnit: Number(formData.costPerUnit) || null,
          totalPurchased: Number(formData.rawStock), // Initial stock = total purchased
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('✅ Ingredient added successfully!')
        router.push('/admin/inventory')
      } else {
        alert(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error adding ingredient:', error)
      alert('❌ Failed to add ingredient')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        const fullUrl = `${window.location.origin}${data.url}`
        setFormData((prev) => ({ ...prev, imageUrl: fullUrl }))
        alert('✅ Image uploaded successfully!')
      } else {
        alert(`❌ Upload failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('❌ Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: '' }))
  }

  return (
    <div>
      <AdminHeader title="Add Ingredient" />

      <div className="p-8">
        {/* Back Button */}
        <Link href="/admin/inventory">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Inventory
          </Button>
        </Link>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Ingredient Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ingredient Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., All-Purpose Flour"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      list="category-suggestions"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Eggs, Vegetables, or create your own..."
                    />
                    <datalist id="category-suggestions">
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.label} />
                      ))}
                    </datalist>
                    <p className="text-xs text-gray-500 mt-1">
                      Choose from suggestions or type your own custom category
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit of Measurement *
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {units.map((unit) => (
                        <option key={unit.value} value={unit.value}>
                          {unit.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-600 mt-1 bg-blue-50 p-2 rounded border border-blue-200">
                      <strong>Important:</strong> This is how you'll track stock. Stock quantities and prices will be in this unit.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      name="isCompound"
                      id="isCompound"
                      checked={formData.isCompound}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="isCompound" className="text-sm font-medium text-gray-700">
                      This is a compound/pre-prepared ingredient
                    </label>
                  </div>
                </div>

                {/* Size/Grade - Universal for all ingredients */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size / Grade (Optional)
                  </label>
                  <select
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select size...</option>
                    {sizes.map((size) => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-600 mt-2">
                    Select the size/grade for this ingredient (e.g., small eggs, large potatoes, jumbo shrimp). This helps with recipe calculations and consistency.
                  </p>
                </div>
              </div>

              {/* Stock Levels */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Stock Levels</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-amber-900">
                    <strong>📦 How stock works:</strong> Quantities are measured in the <strong>Unit</strong> you selected above.
                    <br />
                    <span className="text-xs">
                      Example: If Unit = <strong>DOZEN</strong> and Stock = <strong>12</strong>, you have <strong>12 dozens</strong> (144 individual eggs).
                    </span>
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Initial Stock (Raw) *
                    </label>
                    <input
                      type="number"
                      name="rawStock"
                      value={formData.rawStock}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      In {formData.unit} units
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Stock *
                    </label>
                    <input
                      type="number"
                      name="minimumStock"
                      value={formData.minimumStock}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Stock
                    </label>
                    <input
                      type="number"
                      name="maximumStock"
                      value={formData.maximumStock}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reorder Point
                    </label>
                    <input
                      type="number"
                      name="reorderPoint"
                      value={formData.reorderPoint}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reorder Quantity
                    </label>
                    <input
                      type="number"
                      name="reorderQuantity"
                      value={formData.reorderQuantity}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Supplier & Storage */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Supplier & Storage</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supplier
                    </label>
                    <input
                      type="text"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., ABC Suppliers Inc"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost Per Unit (FCFA)
                    </label>
                    <input
                      type="number"
                      name="costPerUnit"
                      value={formData.costPerUnit}
                      onChange={handleChange}
                      min="0"
                      step="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0"
                    />
                    <div className="mt-2 bg-green-50 border border-green-200 rounded p-2">
                      <p className="text-xs text-green-900">
                        <strong>💰 Price per {formData.unit}:</strong> This is the cost for <strong>ONE {formData.unit}</strong>, not per individual item.
                      </p>
                      <p className="text-xs text-green-800 mt-1">
                        {formData.unit === 'DOZEN' && (
                          <>Example: If a dozen eggs costs 1500 FCFA, enter <strong>1500</strong> (not 125 for one egg)</>
                        )}
                        {formData.unit === 'KG' && (
                          <>Example: If 1 kilogram costs 800 FCFA, enter <strong>800</strong> (not per gram)</>
                        )}
                        {formData.unit === 'PCS' && (
                          <>Example: If 1 piece costs 200 FCFA, enter <strong>200</strong></>
                        )}
                        {!['DOZEN', 'KG', 'PCS'].includes(formData.unit) && (
                          <>Example: Enter the price for 1 {formData.unit}</>
                        )}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Storage Location
                    </label>
                    <input
                      type="text"
                      name="storageLocation"
                      value={formData.storageLocation}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Pantry A, Freezer 1"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Optional notes about this ingredient..."
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Ingredient Image</h3>

                {/* Current Image */}
                {formData.imageUrl && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Image
                    </label>
                    <div className="relative inline-block">
                      <img
                        src={formData.imageUrl}
                        alt="Ingredient preview"
                        className="w-48 h-48 object-cover rounded-lg border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload Options */}
                <div className="space-y-4">
                  {/* URL Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="text-center text-gray-500 text-sm font-medium">OR</div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload from Computer
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      />
                      {uploading && (
                        <span className="text-sm text-gray-600">Uploading...</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: JPG, PNG, WebP, GIF. Max size: 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="border-t pt-6 flex gap-3">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Add Ingredient
                    </>
                  )}
                </Button>
                <Link href="/admin/inventory" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Info Card */}
        {formData.isCompound && (
          <Card className="mt-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Compound Ingredient</p>
                  <p>
                    After creating this ingredient, go to <strong>Bulk Preparation</strong> to define
                    the recipe for how this compound ingredient is made from raw ingredients.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
