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
import { useState } from 'react'
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

  // Mock data - will be replaced with API
  const inventoryItems: InventoryItem[] = [
    {
      id: '1',
      name: 'All-Purpose Flour',
      category: 'FLOUR_GRAIN',
      rawStock: 25,
      wipStock: 0,
      consumedStock: 0,
      unit: 'KG',
      minimumStock: 50,
      costPerUnit: 2.50,
      supplier: 'Grain Mills Inc',
      storageLocation: 'Pantry A',
      isCompound: false,
      status: 'LOW',
    },
    {
      id: '2',
      name: 'Granulated Sugar',
      category: 'SUGAR_SWEETENER',
      rawStock: 80,
      wipStock: 0,
      consumedStock: 0,
      unit: 'KG',
      minimumStock: 30,
      costPerUnit: 1.80,
      supplier: 'Sweet Supply Co',
      storageLocation: 'Pantry A',
      isCompound: false,
      status: 'OK',
    },
    {
      id: '3',
      name: 'Dark Chocolate (70%)',
      category: 'CHOCOLATE_COCOA',
      rawStock: 5,
      wipStock: 0,
      consumedStock: 0,
      unit: 'KG',
      minimumStock: 10,
      costPerUnit: 12.50,
      supplier: 'Cocoa Traders',
      storageLocation: 'Pantry B',
      isCompound: false,
      status: 'CRITICAL',
    },
    {
      id: '4',
      name: 'Fresh Eggs',
      category: 'EGGS',
      rawStock: 120,
      wipStock: 0,
      consumedStock: 0,
      unit: 'PCS',
      minimumStock: 100,
      costPerUnit: 0.30,
      supplier: 'Farm Fresh Eggs',
      storageLocation: 'Fridge 1',
      isCompound: false,
      status: 'OK',
    },
    {
      id: '5',
      name: 'Whole Milk',
      category: 'DAIRY',
      rawStock: 15,
      wipStock: 0,
      consumedStock: 0,
      unit: 'L',
      minimumStock: 20,
      costPerUnit: 1.50,
      supplier: 'Dairy Best',
      storageLocation: 'Fridge 2',
      isCompound: false,
      status: 'LOW',
    },
    {
      id: '6',
      name: 'Vanilla Extract',
      category: 'BAKING_SUPPLIES',
      rawStock: 0,
      wipStock: 0,
      consumedStock: 0,
      unit: 'ML',
      minimumStock: 500,
      costPerUnit: 0.05,
      supplier: 'Flavor House',
      storageLocation: 'Pantry B',
      isCompound: false,
      status: 'OUT',
    },
    {
      id: '7',
      name: 'Dry Beans',
      category: 'VEGETABLES',
      rawStock: 10,
      wipStock: 0,
      consumedStock: 0,
      unit: 'KG',
      minimumStock: 5,
      costPerUnit: 3.50,
      supplier: 'Grain & Bean Co',
      storageLocation: 'Pantry A',
      isCompound: false,
      status: 'OK',
    },
    {
      id: '8',
      name: 'Table Salt',
      category: 'SPICES_HERBS',
      rawStock: 1000,
      wipStock: 0,
      consumedStock: 0,
      unit: 'G',
      minimumStock: 500,
      costPerUnit: 0.002,
      supplier: 'Spice Traders',
      storageLocation: 'Pantry A',
      isCompound: false,
      status: 'OK',
    },
    {
      id: '9',
      name: 'Pre-boiled Salted Beans',
      category: 'VEGETABLES',
      rawStock: 0,
      wipStock: 0,
      consumedStock: 0,
      unit: 'KG',
      minimumStock: 2,
      costPerUnit: 0,
      supplier: '-',
      storageLocation: 'Freezer 1',
      isCompound: true,
      status: 'OUT',
    },
  ]

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

  const stats = [
    {
      title: 'Total Items',
      value: inventoryItems.length.toString(),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Low Stock',
      value: inventoryItems.filter(item => item.status === 'LOW').length.toString(),
      icon: TrendingDown,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Critical/Out',
      value: inventoryItems.filter(item => item.status === 'CRITICAL' || item.status === 'OUT').length.toString(),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Total Value (Raw)',
      value: `$${inventoryItems.reduce((sum, item) => sum + (item.rawStock * item.costPerUnit), 0).toFixed(2)}`,
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
                  {inventoryItems.map((item) => (
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
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
