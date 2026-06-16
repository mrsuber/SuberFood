'use client'

import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Trash2, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

export default function EditInventoryItemPage() {
  const router = useRouter()
  const params = useParams()
  const itemId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [item, setItem] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'OTHER',
    unit: 'KG',
    minimumStock: 0,
    maximumStock: 0,
    reorderPoint: 0,
    reorderQuantity: 0,
    costPerUnit: 0,
    supplier: '',
    storageLocation: '',
    description: '',
    isCompound: false,
    isActive: true,
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

  useEffect(() => {
    fetchItem()
  }, [itemId])

  const fetchItem = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/inventory/items/${itemId}`)
      const result = await response.json()

      if (result.success) {
        setItem(result.data)
        setFormData({
          name: result.data.name,
          category: result.data.category,
          unit: result.data.unit,
          minimumStock: result.data.minimumStock,
          maximumStock: result.data.maximumStock || 0,
          reorderPoint: result.data.reorderPoint || 0,
          reorderQuantity: result.data.reorderQuantity || 0,
          costPerUnit: result.data.costPerUnit || 0,
          supplier: result.data.supplier || '',
          storageLocation: result.data.storageLocation || '',
          description: result.data.description || '',
          isCompound: result.data.isCompound,
          isActive: result.data.isActive,
        })
      } else {
        alert(`❌ Error: ${result.error}`)
        router.push('/admin/inventory')
      }
    } catch (error) {
      console.error('Error fetching inventory item:', error)
      alert('❌ Failed to load inventory item')
      router.push('/admin/inventory')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/inventory/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          minimumStock: Number(formData.minimumStock),
          maximumStock: Number(formData.maximumStock) || null,
          reorderPoint: Number(formData.reorderPoint) || null,
          reorderQuantity: Number(formData.reorderQuantity) || null,
          costPerUnit: Number(formData.costPerUnit) || null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('✅ Ingredient updated successfully!')
        router.push('/admin/inventory')
      } else {
        alert(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error updating ingredient:', error)
      alert('❌ Failed to update ingredient')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to deactivate this ingredient? It will no longer appear in lists.')) {
      return
    }

    try {
      const response = await fetch(`/api/inventory/items/${itemId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        alert('✅ Ingredient deactivated successfully!')
        router.push('/admin/inventory')
      } else {
        alert(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error deleting ingredient:', error)
      alert('❌ Failed to delete ingredient')
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

  if (loading) {
    return (
      <div>
        <AdminHeader title="Edit Ingredient" />
        <div className="p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading ingredient...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AdminHeader title="Edit Ingredient" />

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
              {/* Current Stock Levels (Read-only) */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Current Stock Levels (Read-only)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Raw Stock</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {item?.rawStock} {item?.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">WIP Stock</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {item?.wipStock} {item?.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Consumed</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {item?.consumedStock} {item?.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Purchased</p>
                    <p className="text-2xl font-bold text-green-600">
                      {item?.totalPurchased} {item?.unit}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-2 text-sm text-gray-600">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>
                    To adjust stock levels, use the stock movement endpoints or bulk preparation feature.
                    These values are automatically calculated.
                  </p>
                </div>
              </div>

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

              {/* Stock Thresholds */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Stock Thresholds</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <p className="text-xs text-gray-500 mt-1">
                      Central African CFA Franc (XAF)
                    </p>
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

              {/* Status Toggle */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active (Ingredient is available for use)
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t pt-6 flex gap-3">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deactivate
                </Button>
                <Link href="/admin/inventory">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
