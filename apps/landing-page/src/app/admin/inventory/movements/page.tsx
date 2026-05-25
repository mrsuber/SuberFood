'use client'

import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowUp,
  ArrowDown,
  Package,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Download,
  Loader2,
} from 'lucide-react'
import { useState, useEffect } from 'react'

type StockMovement = {
  id: string
  inventoryItemName: string
  type: string
  quantity: number
  unit: string
  affectedState: string
  previousRaw?: number
  newRaw?: number
  previousWip?: number
  newWip?: number
  previousConsumed?: number
  newConsumed?: number
  referenceType?: string
  referenceId?: string
  notes?: string
  createdAt: string
}

export default function StockMovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [filterState, setFilterState] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchMovements()
  }, [])

  const fetchMovements = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/inventory/movements')
      const result = await response.json()
      if (result.success) {
        setMovements(result.data)
      }
    } catch (error) {
      console.error('Error fetching movements:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return 'bg-green-100 text-green-700'
      case 'PRODUCTION':
        return 'bg-blue-100 text-blue-700'
      case 'USAGE':
        return 'bg-purple-100 text-purple-700'
      case 'WASTE':
        return 'bg-red-100 text-red-700'
      case 'ADJUSTMENT':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return <ArrowUp className="w-4 h-4" />
      case 'PRODUCTION':
        return <Package className="w-4 h-4" />
      case 'USAGE':
        return <TrendingDown className="w-4 h-4" />
      case 'WASTE':
        return <ArrowDown className="w-4 h-4" />
      case 'ADJUSTMENT':
        return <TrendingUp className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const filteredMovements = movements.filter((movement) => {
    const matchesType = filterType === 'all' || movement.type === filterType
    const matchesState = filterState === 'all' || movement.affectedState === filterState
    const matchesSearch =
      searchQuery === '' ||
      movement.inventoryItemName.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesType && matchesState && matchesSearch
  })

  return (
    <div>
      <AdminHeader title="Stock Movements" />

      <div className="p-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  placeholder="Search by ingredient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Movement Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Types</option>
                <option value="PURCHASE">Purchase</option>
                <option value="PRODUCTION">Production</option>
                <option value="USAGE">Usage</option>
                <option value="WASTE">Waste</option>
                <option value="ADJUSTMENT">Adjustment</option>
              </select>

              {/* State Filter */}
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All States</option>
                <option value="RAW">Raw</option>
                <option value="WIP">WIP</option>
                <option value="CONSUMED">Consumed</option>
              </select>

              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="w-12 h-12 text-primary-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading stock movements...</p>
            </CardContent>
          </Card>
        )}

        {/* Movements Table */}
        {!loading && (
          <Card>
            <CardHeader>
              <CardTitle>Movement History ({filteredMovements.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ingredient</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Quantity</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Affected State</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Stock Change</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredMovements.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          No stock movements found
                        </td>
                      </tr>
                    ) : (
                      filteredMovements.map((movement) => (
                        <tr key={movement.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(movement.createdAt).toLocaleDateString()}{' '}
                            {new Date(movement.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">{movement.inventoryItemName}</p>
                            {movement.notes && (
                              <p className="text-xs text-gray-500 mt-1">{movement.notes}</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getMovementTypeColor(
                                movement.type
                              )}`}
                            >
                              {getMovementIcon(movement.type)}
                              {movement.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-gray-900">
                              {movement.quantity > 0 ? '+' : ''}
                              {movement.quantity} {movement.unit}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                movement.affectedState === 'RAW'
                                  ? 'bg-green-100 text-green-700'
                                  : movement.affectedState === 'WIP'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {movement.affectedState}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="space-y-1">
                              {movement.previousRaw !== undefined && movement.newRaw !== undefined && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500 text-xs w-12">Raw:</span>
                                  <span className="text-gray-600">
                                    {movement.previousRaw} → {movement.newRaw}
                                  </span>
                                </div>
                              )}
                              {movement.previousWip !== undefined && movement.newWip !== undefined && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500 text-xs w-12">WIP:</span>
                                  <span className="text-gray-600">
                                    {movement.previousWip} → {movement.newWip}
                                  </span>
                                </div>
                              )}
                              {movement.previousConsumed !== undefined &&
                                movement.newConsumed !== undefined && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500 text-xs w-12">Used:</span>
                                    <span className="text-gray-600">
                                      {movement.previousConsumed} → {movement.newConsumed}
                                    </span>
                                  </div>
                                )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {movement.referenceType && (
                              <div>
                                <p className="font-medium">{movement.referenceType}</p>
                                {movement.referenceId && (
                                  <p className="text-xs text-gray-500">{movement.referenceId}</p>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
