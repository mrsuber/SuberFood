'use client'

import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  FileText,
  User,
  Settings,
  ShoppingCart,
  Package,
  AlertCircle,
  CheckCircle,
  Info,
  Filter,
  Download,
  Calendar,
} from 'lucide-react'
import { useState } from 'react'

type LogLevel = 'all' | 'info' | 'warning' | 'success' | 'error'
type LogCategory = 'all' | 'user' | 'order' | 'product' | 'system' | 'security'

export default function ActivityLogsPage() {
  const [logLevel, setLogLevel] = useState<LogLevel>('all')
  const [category, setCategory] = useState<LogCategory>('all')
  const [dateRange, setDateRange] = useState('today')

  // Mock activity logs - will be replaced with real API data
  const activityLogs = [
    {
      id: '1',
      timestamp: '2026-05-25 14:32:15',
      user: 'Admin User',
      action: 'Updated product inventory',
      category: 'product',
      level: 'info',
      details: 'Updated stock for "Organic Tomatoes" from 120 to 150 units',
      ip: '192.168.1.100',
    },
    {
      id: '2',
      timestamp: '2026-05-25 14:28:42',
      user: 'John Manager',
      action: 'Created new order',
      category: 'order',
      level: 'success',
      details: 'Order #1234 created for customer Jane Smith - Total: $145.50',
      ip: '192.168.1.102',
    },
    {
      id: '3',
      timestamp: '2026-05-25 14:15:33',
      user: 'System',
      action: 'Database backup completed',
      category: 'system',
      level: 'success',
      details: 'Automated daily backup completed successfully - Size: 2.4GB',
      ip: 'internal',
    },
    {
      id: '4',
      timestamp: '2026-05-25 14:10:12',
      user: 'Sarah Staff',
      action: 'Failed login attempt',
      category: 'security',
      level: 'warning',
      details: 'Failed login with incorrect password - Account: sarah@suberfoods.com',
      ip: '203.0.113.42',
    },
    {
      id: '5',
      timestamp: '2026-05-25 13:58:27',
      user: 'Admin User',
      action: 'Updated user permissions',
      category: 'user',
      level: 'info',
      details: 'Changed role for John Manager from "Staff" to "Manager"',
      ip: '192.168.1.100',
    },
    {
      id: '6',
      timestamp: '2026-05-25 13:45:19',
      user: 'System',
      action: 'Payment processing error',
      category: 'order',
      level: 'error',
      details: 'Payment gateway timeout for Order #1233 - Customer: Mike Johnson',
      ip: 'internal',
    },
    {
      id: '7',
      timestamp: '2026-05-25 13:30:05',
      user: 'Admin User',
      action: 'Added new product',
      category: 'product',
      level: 'success',
      details: 'Created new product "Free-Range Chicken Eggs" - SKU: PRD-045',
      ip: '192.168.1.100',
    },
    {
      id: '8',
      timestamp: '2026-05-25 13:12:44',
      user: 'John Manager',
      action: 'Updated restaurant settings',
      category: 'system',
      level: 'info',
      details: 'Changed operating hours for SuberFood Classical location',
      ip: '192.168.1.102',
    },
  ]

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'user':
        return <User className="w-4 h-4" />
      case 'order':
        return <ShoppingCart className="w-4 h-4" />
      case 'product':
        return <Package className="w-4 h-4" />
      case 'system':
        return <Settings className="w-4 h-4" />
      case 'security':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getLogLevelBadge = (level: string) => {
    const styles = {
      success: 'bg-green-100 text-green-700',
      warning: 'bg-yellow-100 text-yellow-700',
      error: 'bg-red-100 text-red-700',
      info: 'bg-blue-100 text-blue-700',
    }
    return styles[level as keyof typeof styles] || styles.info
  }

  const filteredLogs = activityLogs.filter((log) => {
    const levelMatch = logLevel === 'all' || log.level === logLevel
    const categoryMatch = category === 'all' || log.category === category
    return levelMatch && categoryMatch
  })

  return (
    <div>
      <AdminHeader title="Activity Logs" />

      <div className="p-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900">2,456</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Successful</p>
                  <p className="text-2xl font-bold text-gray-900">2,123</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Warnings</p>
                  <p className="text-2xl font-bold text-gray-900">287</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Errors</p>
                  <p className="text-2xl font-bold text-gray-900">46</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>

              <select
                value={logLevel}
                onChange={(e) => setLogLevel(e.target.value as LogLevel)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Levels</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LogCategory)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Categories</option>
                <option value="user">User Management</option>
                <option value="order">Orders</option>
                <option value="product">Products</option>
                <option value="system">System</option>
                <option value="security">Security</option>
              </select>

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>

              <div className="ml-auto flex gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Custom Date
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Activity History ({filteredLogs.length} events)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getLogIcon(log.level)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{log.action}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLogLevelBadge(log.level)}`}>
                            {log.level}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center gap-1">
                            {getCategoryIcon(log.category)}
                            {log.category}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 whitespace-nowrap">{log.timestamp}</span>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">{log.details}</p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {log.user}
                        </span>
                        <span>IP: {log.ip}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-medium">1-{filteredLogs.length}</span> of{' '}
                  <span className="font-medium">2,456</span> events
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
