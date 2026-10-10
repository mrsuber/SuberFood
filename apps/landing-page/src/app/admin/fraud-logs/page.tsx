'use client'

import { useEffect, useState } from 'react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ShieldAlert,
  Ban,
  TrendingUp,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Calendar,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
} from 'lucide-react'

interface FraudLog {
  id: string
  referrerUserId: string
  referrerName: string
  referrerEmail: string
  referrerPhone: string
  referralCode: string
  referralCodeId: string
  guestPhone: string | null
  guestEmail: string | null
  ipAddress: string | null
  fraudScore: number
  confidence: 'LOW' | 'MEDIUM' | 'HIGH' | 'CERTAIN'
  reason: string
  details: string[]
  wasBlocked: boolean
  strikeNumber: number | null
  causedAutoBan: boolean
  createdAt: string
}

interface FraudStats {
  totalFraudAttempts: number
  averageFraudScore: number
  bannedCodes: number
  recentBans: number
}

export default function FraudLogsPage() {
  const [fraudLogs, setFraudLogs] = useState<FraudLog[]>([])
  const [stats, setStats] = useState<FraudStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLog, setSelectedLog] = useState<FraudLog | null>(null)

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('filter', filter)
      if (searchQuery) params.append('search', searchQuery)

      const response = await fetch(`/api/admin/fraud-logs?${params}`)
      const data = await response.json()

      if (data.success) {
        setFraudLogs(data.fraudLogs)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching fraud logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getConfidenceBadge = (confidence: string) => {
    const colors = {
      LOW: 'bg-blue-100 text-blue-700',
      MEDIUM: 'bg-yellow-100 text-yellow-700',
      HIGH: 'bg-orange-100 text-orange-700',
      CERTAIN: 'bg-red-100 text-red-700',
    }
    return <Badge className={colors[confidence as keyof typeof colors] || colors.LOW}>{confidence}</Badge>
  }

  const getStrikeBadge = (strikeNumber: number | null, causedAutoBan: boolean) => {
    if (causedAutoBan) {
      return <Badge className="bg-red-500 text-white">STRIKE 3 - BANNED</Badge>
    }
    if (strikeNumber === 2) {
      return <Badge className="bg-orange-500 text-white">STRIKE 2</Badge>
    }
    if (strikeNumber === 1) {
      return <Badge className="bg-yellow-500 text-white">STRIKE 1</Badge>
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Fraud Detection Logs</h1>
          <p className="text-gray-600">Monitor and investigate referral fraud attempts</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Fraud Attempts</CardTitle>
                <ShieldAlert className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFraudAttempts}</div>
                <p className="text-xs text-gray-500 mt-1">All-time detections</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Fraud Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageFraudScore}/100</div>
                <p className="text-xs text-gray-500 mt-1">Detection accuracy</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Banned Codes</CardTitle>
                <Ban className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.bannedCodes}</div>
                <p className="text-xs text-gray-500 mt-1">Auto-banned (3 strikes)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Bans</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.recentBans}</div>
                <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by phone, email, or referral code..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803D] focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && fetchData()}
                  />
                </div>
              </div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803D]"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Attempts</option>
                <option value="high-risk">High Risk (60+)</option>
                <option value="banned">Caused Ban</option>
              </select>
              <Button onClick={fetchData} className="bg-[#15803D] hover:bg-[#166534]">
                <Filter className="h-4 w-4 mr-2" />
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Fraud Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Fraud Detection History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#15803D] mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading fraud logs...</p>
              </div>
            ) : fraudLogs.length === 0 ? (
              <div className="text-center py-12">
                <ShieldAlert className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No fraud attempts detected</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Referral Code
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Referrer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guest Info
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fraud Score
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Strike
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {fraudLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{log.referralCode}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{log.referrerName}</div>
                          <div className="text-xs text-gray-500">{log.referrerPhone}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{log.guestPhone || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{log.guestEmail || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">{log.fraudScore}</span>
                            {getConfidenceBadge(log.confidence)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getStrikeBadge(log.strikeNumber, log.causedAutoBan)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Fraud Detection Details</CardTitle>
                  <Button variant="ghost" onClick={() => setSelectedLog(null)}>✕</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Fraud Info */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    Detection Summary
                  </h3>
                  <div className="bg-red-50 p-4 rounded-lg space-y-2">
                    <p className="text-sm"><strong>Fraud Score:</strong> {selectedLog.fraudScore}/100</p>
                    <p className="text-sm"><strong>Confidence:</strong> {selectedLog.confidence}</p>
                    <p className="text-sm"><strong>Strike Number:</strong> {selectedLog.strikeNumber}/3</p>
                    <p className="text-sm"><strong>Caused Auto-Ban:</strong> {selectedLog.causedAutoBan ? 'Yes' : 'No'}</p>
                    <p className="text-sm"><strong>Reason:</strong> {selectedLog.reason}</p>
                  </div>
                </div>

                {/* Detection Details */}
                <div>
                  <h3 className="font-semibold mb-2">Detection Indicators</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {selectedLog.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                </div>

                {/* Referrer Info */}
                <div>
                  <h3 className="font-semibold mb-2">Referrer Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <p><strong>Code:</strong> {selectedLog.referralCode}</p>
                    <p><strong>Name:</strong> {selectedLog.referrerName}</p>
                    <p><strong>Email:</strong> {selectedLog.referrerEmail}</p>
                    <p><strong>Phone:</strong> {selectedLog.referrerPhone}</p>
                  </div>
                </div>

                {/* Guest Info */}
                <div>
                  <h3 className="font-semibold mb-2">Guest Order Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <p><strong>Phone:</strong> {selectedLog.guestPhone || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedLog.guestEmail || 'N/A'}</p>
                    <p><strong>IP Address:</strong> {selectedLog.ipAddress || 'N/A'}</p>
                  </div>
                </div>

                {/* Timestamp */}
                <div>
                  <h3 className="font-semibold mb-2">Timestamp</h3>
                  <p className="text-sm text-gray-700">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
