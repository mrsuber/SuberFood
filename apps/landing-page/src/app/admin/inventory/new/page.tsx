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
  const [formData, setFormData] = useState({
    name: '',
    category: 'OTHER',
    unit: 'KG',
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
    { value: 'KG', label: 'Kilograms (KG)' },
    { value: 'G', label: 'Grams (G)' },
    { value: 'L', label: 'Liters (L)' },
    { value: 'ML', label: 'Milliliters (ML)' },
    { value: 'PCS', label: 'Pieces (PCS)' },
    { value: 'DOZEN', label: 'Dozen' },
    { value: 'LBS', label: 'Pounds (LBS)' },
    { value: 'OZ', label: 'Ounces (OZ)' },
    { value: 'CUPS', label: 'Cups' },
    { value: 'TBSP', label: 'Tablespoons (TBSP)' },
    { value: 'TSP', label: 'Teaspoons (TSP)' },
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
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
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
              </div>

              {/* Stock Levels */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Stock Levels</h3>
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
                      Cost Per Unit ($)
                    </label>
                    <input
                      type="number"
                      name="costPerUnit"
                      value={formData.costPerUnit}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0.00"
                    />
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
