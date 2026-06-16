'use client'

import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type InventoryItem = {
  id: string
  name: string
  unit: string
  rawStock: number
  category: string
}

export default function ReceiveStockPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [formData, setFormData] = useState({
    inventoryItemId: '',
    quantity: 0,
    notes: '',
  })
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  useEffect(() => {
    fetchInventoryItems()
  }, [])

  const fetchInventoryItems = async () => {
    try {
      const response = await fetch('/api/inventory/items')
      const result = await response.json()
      if (result.success) {
        setInventoryItems(result.data)
      }
    } catch (error) {
      console.error('Error fetching inventory items:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.inventoryItemId) {
      alert('❌ Please select an ingredient')
      return
    }

    if (formData.quantity <= 0) {
      alert('❌ Quantity must be greater than 0')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/inventory/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryItemId: formData.inventoryItemId,
          type: 'PURCHASE',
          affectedState: 'RAW',
          quantity: Number(formData.quantity),
          notes: formData.notes || `Stock received${formData.notes ? ': ' + formData.notes : ''}`,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('✅ Stock received successfully!')
        router.push('/admin/inventory')
      } else {
        alert(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error receiving stock:', error)
      alert('❌ Failed to receive stock')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === 'inventoryItemId') {
      const item = inventoryItems.find(i => i.id === value)
      setSelectedItem(item || null)
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div>
      <AdminHeader title="Receive Stock" />

      <div className="p-8">
        {/* Back Button */}
        <Link href="/admin/inventory">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Inventory
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Add Stock to Inventory</CardTitle>
                  <p className="text-sm text-gray-600">
                    Record incoming stock from purchases or deliveries
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Ingredient Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Ingredient *
                    </label>
                    <select
                      name="inventoryItemId"
                      value={formData.inventoryItemId}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Choose an ingredient...</option>
                      {inventoryItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.category}) - Current: {item.rawStock} {item.unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity Received *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        required
                        min="0.01"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="0"
                      />
                      {selectedItem && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                          {selectedItem.unit}
                        </div>
                      )}
                    </div>
                    {selectedItem && (
                      <p className="text-xs text-gray-600 mt-1 bg-blue-50 p-2 rounded">
                        <strong>Current stock:</strong> {selectedItem.rawStock} {selectedItem.unit}
                        <br />
                        <strong>After receiving:</strong> {(selectedItem.rawStock + Number(formData.quantity)).toFixed(2)} {selectedItem.unit}
                      </p>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Supplier name, invoice number, delivery date..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? (
                        'Processing...'
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Receive Stock
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
          </div>

          {/* Info Card */}
          <div className="lg:col-span-1">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Package className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-900">
                    <p className="font-semibold mb-2">📦 Receiving Stock</p>
                    <ul className="space-y-2 text-xs">
                      <li>✓ Use this when you receive new deliveries</li>
                      <li>✓ Stock is added to "Raw" state</li>
                      <li>✓ Records are tracked in Stock Movements</li>
                      <li>✓ Add notes for traceability (supplier, invoice, etc.)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            {selectedItem && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-base">Selected Item Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{selectedItem.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{selectedItem.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unit:</span>
                    <span className="font-medium">{selectedItem.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Stock:</span>
                    <span className="font-semibold text-primary-600">
                      {selectedItem.rawStock} {selectedItem.unit}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
