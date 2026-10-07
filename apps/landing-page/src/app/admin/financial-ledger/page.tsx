'use client'

import { useEffect, useState } from 'react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Truck,
  Users,
  Search,
  Download,
  Calendar,
  Filter,
} from 'lucide-react'

interface FinancialStats {
  totalRevenue: number
  totalFarmCosts: number
  totalTransportCosts: number
  totalReferrerCommissions: number
  totalProfit: number
  transactionCount: number
}

interface FinancialTransaction {
  id: string
  orderId: string
  order: {
    orderNumber: string
    guestName: string
    status: string
  }
  totalAmount: number
  farmCost: number
  transportCost: number
  profit: number
  referrerCommission: number
  paymentMethod: string
  createdAt: string
}

export default function FinancialLedgerPage() {
  const [stats, setStats] = useState<FinancialStats | null>(null)
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPeriod, setFilterPeriod] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [filterPeriod])

  const fetchData = async () => {
    setLoading(true)
    try {
      const url = `/api/admin/financial-ledger?period=${filterPeriod}`
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
        setTransactions(data.transactions)
      }
    } catch (error) {
      console.error('Error fetching financial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.order.guestName.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const profitMargin = stats?.totalRevenue
    ? ((stats.totalProfit / stats.totalRevenue) * 100).toFixed(1)
    : '0.0'

  return (
    <div>
      <AdminHeader title="Financial Ledger" />

      <div className="p-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#15803D] mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading financial data...</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="col-span-1">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-3xl font-bold text-green-600">
                        {(stats?.totalRevenue || 0).toLocaleString()} XAF
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {stats?.transactionCount || 0} transactions
                      </p>
                    </div>
                    <div className="h-14 w-14 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-7 w-7 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Costs</p>
                      <p className="text-3xl font-bold text-red-600">
                        {((stats?.totalFarmCosts || 0) + (stats?.totalTransportCosts || 0)).toLocaleString()} XAF
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Farm + Transport
                      </p>
                    </div>
                    <div className="h-14 w-14 bg-red-100 rounded-lg flex items-center justify-center">
                      <TrendingDown className="h-7 w-7 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Net Profit</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {(stats?.totalProfit || 0).toLocaleString()} XAF
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Margin: {profitMargin}%
                      </p>
                    </div>
                    <div className="h-14 w-14 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-7 w-7 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cost Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Farm Costs</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(stats?.totalFarmCosts || 0).toLocaleString()} XAF
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Transport Costs</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(stats?.totalTransportCosts || 0).toLocaleString()} XAF
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Truck className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Referrer Commissions</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(stats?.totalReferrerCommissions || 0).toLocaleString()} XAF
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by order number or customer..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                    />
                  </div>
                  <select
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Transactions ({filteredTransactions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Order</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Farm Cost</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Transport</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Commission</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Profit</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((tx) => (
                        <tr key={tx.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{tx.order.orderNumber}</p>
                              <Badge variant="outline" className="text-xs mt-1">
                                {tx.order.status}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-gray-900">{tx.order.guestName}</p>
                          </td>
                          <td className="text-right py-3 px-4">
                            <span className="font-semibold text-green-600">
                              +{Number(tx.totalAmount).toLocaleString()} XAF
                            </span>
                          </td>
                          <td className="text-right py-3 px-4">
                            <span className="font-medium text-red-600">
                              -{Number(tx.farmCost).toLocaleString()} XAF
                            </span>
                          </td>
                          <td className="text-right py-3 px-4">
                            <span className="font-medium text-orange-600">
                              -{Number(tx.transportCost).toLocaleString()} XAF
                            </span>
                          </td>
                          <td className="text-right py-3 px-4">
                            <span className="font-medium text-purple-600">
                              -{Number(tx.referrerCommission).toLocaleString()} XAF
                            </span>
                          </td>
                          <td className="text-right py-3 px-4">
                            <span className="font-bold text-blue-600">
                              ={Number(tx.profit).toLocaleString()} XAF
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <p className="text-gray-900">
                                {new Date(tx.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-gray-600 text-xs">
                                {new Date(tx.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredTransactions.length === 0 && (
                    <div className="text-center py-12">
                      <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No financial transactions found
                      </h3>
                      <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
