'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'

interface InventoryItem {
  id: string
  name: string
  unit: string
  rawStock: number
  category: string
}

interface SelectedIngredient {
  inventoryItemId: string
  name: string
  quantity: number
  unit: string
  notes?: string
}

interface IngredientSelectorProps {
  value: SelectedIngredient[]
  onChange: (ingredients: SelectedIngredient[]) => void
  restaurantId?: string
}

export function IngredientSelector({ value, onChange, restaurantId }: IngredientSelectorProps) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInventoryItems()
  }, [])

  const fetchInventoryItems = async () => {
    try {
      const response = await fetch('/api/inventory/items')
      if (!response.ok) throw new Error('Failed to fetch inventory items')

      const data = await response.json()
      if (data.success) {
        setInventoryItems(data.items)
      }
    } catch (err) {
      setError('Failed to load inventory items')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const addIngredient = () => {
    onChange([
      ...value,
      {
        inventoryItemId: '',
        name: '',
        quantity: 1,
        unit: '',
        notes: '',
      },
    ])
  }

  const removeIngredient = (index: number) => {
    const updated = value.filter((_, i) => i !== index)
    onChange(updated)
  }

  const updateIngredient = (index: number, field: keyof SelectedIngredient, fieldValue: string | number) => {
    const updated = [...value]
    if (field === 'inventoryItemId') {
      const item = inventoryItems.find(i => i.id === fieldValue)
      if (item) {
        updated[index] = {
          ...updated[index],
          inventoryItemId: item.id,
          name: item.name,
          unit: item.unit,
        }
      }
    } else {
      updated[index] = {
        ...updated[index],
        [field]: fieldValue,
      }
    }
    onChange(updated)
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Loading ingredients...</div>
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Recipe Ingredients *
        </label>
        <Button
          type="button"
          onClick={addIngredient}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Ingredient
        </Button>
      </div>

      {value.length === 0 ? (
        <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
          No ingredients added yet. Click "Add Ingredient" to start building your recipe.
        </div>
      ) : (
        <div className="space-y-3">
          {value.map((ingredient, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              {/* Ingredient Select */}
              <div className="col-span-5">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Ingredient
                </label>
                <select
                  value={ingredient.inventoryItemId}
                  onChange={(e) => updateIngredient(index, 'inventoryItemId', e.target.value)}
                  required
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select ingredient...</option>
                  {inventoryItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity Input */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={ingredient.quantity}
                  onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                  required
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Unit Display/Select */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Unit
                </label>
                <input
                  type="text"
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                  required
                  placeholder="kg, L, pcs"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Notes */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={ingredient.notes || ''}
                  onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
                  placeholder="diced, etc."
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Remove Button */}
              <div className="col-span-1 flex items-end justify-center">
                <Button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <div className="text-xs text-gray-500">
          {value.length} ingredient{value.length !== 1 ? 's' : ''} added
        </div>
      )}
    </div>
  )
}
