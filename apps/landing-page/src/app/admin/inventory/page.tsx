'use client'

import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Package,
  TrendingDown,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type InventoryItem = {
  id: string
  name: string
  category: string
  rawStock: number
  wipStock: number
  consumedStock: number
  unit: string
  minimumStock: number
  costPerUnit: number
  supplier: string
  storageLocation: string
  isCompound: boolean
  status: 'OK' | 'LOW' | 'CRITICAL' | 'OUT'
}

export default function InventoryPage() {
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [filteredInventoryItems, setFilteredInventoryItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInventoryItems()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filterCategory, filterStatus, searchQuery, inventoryItems])

  const fetchInventoryItems = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/inventory/items')
      const result = await response.json()

      if (result.success) {
        // Map API data to match component structure
        const items = result.data.map((item: any) => ({
          ...item,
          status: getStockStatus(item.rawStock, item.minimumStock),
        }))
        setInventoryItems(items)
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStockStatus = (rawStock: number, minimumStock: number): 'OK' | 'LOW' | 'CRITICAL' | 'OUT' => {
    if (rawStock === 0) return 'OUT'
    if (rawStock < minimumStock * 0.5) return 'CRITICAL'
    if (rawStock < minimumStock) return 'LOW'
    return 'OK'
  }

  const applyFilters = () => {
    let filtered = inventoryItems

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory)
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.supplier.toLowerCase().includes(query) ||
        item.storageLocation.toLowerCase().includes(query)
      )
    }

    setFilteredInventoryItems(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK':
        return 'bg-green-100 text-green-700'
      case 'LOW':
        return 'bg-yellow-100 text-yellow-700'
      case 'CRITICAL':
        return 'bg-orange-100 text-orange-700'
      case 'OUT':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    if (status === 'CRITICAL' || status === 'OUT') {
      return <AlertTriangle className="w-4 h-4 text-red-600" />
    }
    if (status === 'LOW') {
      return <TrendingDown className="w-4 h-4 text-yellow-600" />
    }
    return null
  }

  const handleDelete = async (itemId: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/inventory/items/${itemId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        alert('✅ Ingredient deleted successfully!')
        fetchInventoryItems() // Refresh the list
      } else {
        alert(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error deleting ingredient:', error)
      alert('❌ Failed to delete ingredient')
    }
  }

  const stats = [
    {
      title: 'Total Items',
      value: filteredInventoryItems.length.toString(),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Low Stock',
      value: filteredInventoryItems.filter(item => item.status === 'LOW').length.toString(),
      icon: TrendingDown,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Critical/Out',
      value: filteredInventoryItems.filter(item => item.status === 'CRITICAL' || item.status === 'OUT').length.toString(),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Total Value (Raw)',
      value: `${filteredInventoryItems.reduce((sum, item) => sum + (item.rawStock * item.costPerUnit), 0).toLocaleString('fr-FR')} FCFA`,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ]

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'FLOUR_GRAIN', label: 'Flour & Grain' },
    { value: 'SUGAR_SWEETENER', label: 'Sugar & Sweeteners' },
    { value: 'DAIRY', label: 'Dairy Products' },
    { value: 'EGGS', label: 'Eggs' },
    { value: 'CHOCOLATE_COCOA', label: 'Chocolate & Cocoa' },
    { value: 'BAKING_SUPPLIES', label: 'Baking Supplies' },
    { value: 'OILS_FATS', label: 'Oils & Fats' },
    { value: 'SPICES_HERBS', label: 'Spices & Herbs' },
  ]

  if (loading) {
    return (
      <div>
        <AdminHeader title="Kitchen Inventory" />
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading inventory...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AdminHeader title="Kitchen Inventory" />

      <div className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    placeholder="Search ingredients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Status</option>
                  <option value="OK">In Stock</option>
                  <option value="LOW">Low Stock</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="OUT">Out of Stock</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Link href="/admin/inventory/receive">
                  <Button variant="outline" className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100">
                    <Package className="w-4 h-4 mr-2" />
                    Receive Stock
                  </Button>
                </Link>
                <Link href="/admin/inventory/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Item Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      <div>Stock Breakdown</div>
                      <div className="text-xs font-normal text-gray-500">Raw / WIP / Consumed</div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Min Stock</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredInventoryItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Package className="w-16 h-16 text-gray-300 mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {inventoryItems.length === 0 ? 'No Inventory Items' : 'No Items Match Your Filters'}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {inventoryItems.length === 0
                              ? 'Get started by adding your first ingredient'
                              : 'Try adjusting your search or filter criteria'}
                          </p>
                          {inventoryItems.length === 0 && (
                            <Link href="/admin/inventory/new">
                              <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Item
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredInventoryItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.supplier}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div>{item.category.replace('_', ' ')}</div>
                        {item.isCompound && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                            Compound
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-20">Raw:</span>
                            <span className={`font-semibold ${
                              item.rawStock < item.minimumStock ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {item.rawStock} {item.unit}
                            </span>
                          </div>
                          {item.wipStock > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 w-20">WIP:</span>
                              <span className="font-semibold text-yellow-600">
                                {item.wipStock} {item.unit}
                              </span>
                            </div>
                          )}
                          {item.consumedStock > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 w-20">Consumed:</span>
                              <span className="text-sm text-gray-500">
                                {item.consumedStock} {item.unit}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.minimumStock} {item.unit}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.storageLocation}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/inventory/${item.id}`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(item.id, item.name)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        {inventoryItems.filter(item => item.status !== 'OK').length > 0 && (
          <Card className="mt-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Stock Alerts</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    You have {inventoryItems.filter(item => item.status !== 'OK').length} items that need attention:
                  </p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {inventoryItems
                      .filter(item => item.status !== 'OK')
                      .map(item => (
                        <li key={item.id}>
                          • <strong>{item.name}</strong>: {item.rawStock} {item.unit} raw ({item.status})
                        </li>
                      ))}
                  </ul>
                  <Button size="sm" className="mt-4">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Generate Purchase Order
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
