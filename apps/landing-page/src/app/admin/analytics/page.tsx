'use client'

import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { useState } from 'react'

type TimeRange = '7d' | '30d' | '90d' | '1y'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')

  // Mock data - will be replaced with real API data
  const kpiData = {
    revenue: {
      current: 245231,
      previous: 204358,
      change: 20.0,
      trend: 'up' as const,
    },
    orders: {
      current: 3456,
      previous: 3102,
      change: 11.4,
      trend: 'up' as const,
    },
    customers: {
      current: 1892,
      previous: 1654,
      change: 14.4,
      trend: 'up' as const,
    },
    avgOrderValue: {
      current: 70.95,
      previous: 65.88,
      change: 7.7,
      trend: 'up' as const,
    },
    inventory: {
      current: 892,
      previous: 945,
      change: -5.6,
      trend: 'down' as const,
    },
    fulfillmentRate: {
      current: 97.5,
      previous: 95.2,
      change: 2.4,
      trend: 'up' as const,
    },
  }

  const topProducts = [
    { name: 'Organic Chicken Breast', sales: 1234, revenue: 12450, growth: 15.2 },
    { name: 'Grass-Fed Beef', sales: 892, revenue: 11896, growth: 8.5 },
    { name: 'Fresh Salmon Fillet', sales: 756, revenue: 10584, growth: 22.1 },
    { name: 'Organic Tomatoes', sales: 1450, revenue: 7250, growth: 5.3 },
    { name: 'Farm Fresh Eggs', sales: 2100, revenue: 6300, growth: 12.8 },
  ]

  const revenueByChannel = [
    { channel: 'Restaurant (Dine-in)', revenue: 98450, percentage: 40 },
    { channel: 'Online Orders', revenue: 73672, percentage: 30 },
    { channel: 'Retail Partners', revenue: 49115, percentage: 20 },
    { channel: 'Catering', revenue: 24557, percentage: 10 },
  ]

  const customerSegments = [
    { segment: 'Frequent Buyers', count: 456, percentage: 24, avgSpend: 125 },
    { segment: 'Regular Customers', count: 892, percentage: 47, avgSpend: 68 },
    { segment: 'Occasional', count: 389, percentage: 21, avgSpend: 42 },
    { segment: 'New Customers', count: 155, percentage: 8, avgSpend: 55 },
  ]

  return (
    <div>
      <AdminHeader title="Analytics & Insights" />

      <div className="p-8">
        {/* Time Range Selector */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">Business performance metrics and insights</p>
          <div className="flex gap-2">
            {(['7d', '30d', '90d', '1y'] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === '7d' && 'Last 7 Days'}
                {range === '30d' && 'Last 30 Days'}
                {range === '90d' && 'Last 90 Days'}
                {range === '1y' && 'Last Year'}
              </Button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Object.entries(kpiData).map(([key, data]) => (
            <Card key={key}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                      {key.includes('revenue') || key.includes('Value')
                        ? `$${data.current.toLocaleString()}`
                        : key.includes('Rate')
                        ? `${data.current}%`
                        : data.current.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2">
                      {data.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          data.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {data.change > 0 ? '+' : ''}
                        {data.change}%
                      </span>
                      <span className="text-sm text-gray-500">vs prev period</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    {key === 'revenue' && <DollarSign className="w-5 h-5 text-primary-600" />}
                    {key === 'orders' && <ShoppingCart className="w-5 h-5 text-primary-600" />}
                    {key === 'customers' && <Users className="w-5 h-5 text-primary-600" />}
                    {key === 'avgOrderValue' && <TrendingUp className="w-5 h-5 text-primary-600" />}
                    {key === 'inventory' && <Package className="w-5 h-5 text-primary-600" />}
                    {key === 'fulfillmentRate' && <TrendingUp className="w-5 h-5 text-primary-600" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue by Channel */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Channel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueByChannel.map((item) => (
                  <div key={item.channel}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{item.channel}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        ${item.revenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{item.percentage}% of total</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.sales} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${product.revenue.toLocaleString()}</p>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600">+{product.growth}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Segments */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {customerSegments.map((segment) => (
                <div key={segment.segment} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-2">{segment.segment}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{segment.count}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{segment.percentage}% of total</span>
                    <span className="font-semibold text-primary-600">
                      ${segment.avgSpend} avg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trend Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Revenue trend chart</p>
                <p className="text-sm text-gray-500 mt-1">
                  Chart library integration (Recharts/Chart.js) coming soon
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
