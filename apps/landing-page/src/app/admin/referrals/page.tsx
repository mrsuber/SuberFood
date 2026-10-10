'use client'

import { useEffect, useState } from 'react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Clock,
  Gift,
  Eye,
  Search,
  Filter,
  Download,
  UserCheck,
  AlertCircle,
  ShoppingCart,
} from 'lucide-react'

interface ReferralStats {
  totalReferralCodes: number
  verifiedReferrers: number
  totalReferrals: number
  totalEarnings: number
  totalPendingEarnings: number
  totalPaidEarnings: number
}

interface ReferralCode {
  id: string
  code: string
  user: {
    id: string
    name: string
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  totalReferrals: number
  activeReferrals: number
  totalEarnings: number
  lifetimeEarnings: number
  pendingEarnings: number
  paidEarnings: number
  isVerified: boolean
  verificationStatus: string | null
  verificationSubmittedAt: string | null
  createdAt: string
  lastUsedAt: string | null
  referralsCount: number
  earningsCount: number
}

interface ReferralDetail {
  id: string
  code: string
  user: any
  verification: any
  referrals: any[]
  earnings: any[]
  totalEarnings: number
  lifetimeEarnings: number
  pendingEarnings: number
  paidEarnings: number
  totalReferrals: number
  activeReferrals: number
}

export default function AdminReferralsPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([])
  const [selectedReferral, setSelectedReferral] = useState<ReferralDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/referrals')
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
        setReferralCodes(data.referralCodes)
      }
    } catch (error) {
      console.error('Error fetching referral data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReferralDetails = async (id: string) => {
    setDetailsLoading(true)
    try {
      const response = await fetch(`/api/admin/referrals/${id}`)
      const data = await response.json()

      if (data.success) {
        setSelectedReferral(data.referralCode)
      }
    } catch (error) {
      console.error('Error fetching referral details:', error)
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleViewReferral = (referralCode: ReferralCode) => {
    fetchReferralDetails(referralCode.id)
  }

  const getUserName = (user: any) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user.name || user.email.split('@')[0]
  }

  const getVerificationBadge = (referral: ReferralCode) => {
    if (referral.isVerified) {
      return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>
    }
    if (referral.verificationStatus === 'PENDING') {
      return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
    }
    if (referral.verificationStatus === 'REJECTED') {
      return <Badge className="bg-red-100 text-red-700"><AlertCircle className="h-3 w-3 mr-1" />Rejected</Badge>
    }
    return <Badge variant="outline">Not Submitted</Badge>
  }

  const filteredReferralCodes = referralCodes.filter(referral => {
    const matchesSearch =
      referral.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getUserName(referral.user).toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterType === 'all' ||
      (filterType === 'verified' && referral.isVerified) ||
      (filterType === 'pending' && referral.verificationStatus === 'PENDING') ||
      (filterType === 'unverified' && !referral.isVerified && !referral.verificationStatus) ||
      (filterType === 'active' && referral.totalReferrals > 0) ||
      (filterType === 'earnings' && referral.pendingEarnings > 0)

    return matchesSearch && matchesFilter
  })

  return (
    <div>
      <AdminHeader title="Referral Management" />

      <div className="p-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#15803D] mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading referral data...</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Codes</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalReferralCodes || 0}</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Gift className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Verified</p>
                      <p className="text-2xl font-bold text-green-600">{stats?.verifiedReferrers || 0}</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalReferrals || 0}</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                      <p className="text-xl font-bold text-gray-900">
                        {(stats?.totalEarnings || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">XAF</p>
                    </div>
                    <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-xl font-bold text-orange-600">
                        {(stats?.totalPendingEarnings || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">XAF</p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Paid Out</p>
                      <p className="text-xl font-bold text-green-600">
                        {(stats?.totalPaidEarnings || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">XAF</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
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
                      placeholder="Search by code, name, or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  >
                    <option value="all">All Referral Codes</option>
                    <option value="verified">Verified Only</option>
                    <option value="pending">Pending Verification</option>
                    <option value="unverified">Unverified</option>
                    <option value="active">Active (Has Referrals)</option>
                    <option value="earnings">Has Pending Earnings</option>
                  </select>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Referral Codes Table */}
            <Card>
              <CardHeader>
                <CardTitle>Referral Codes ({filteredReferralCodes.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Referrer</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Code</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Referrals</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Pending</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Paid</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Earnings</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReferralCodes.map((referral) => (
                        <tr key={referral.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{getUserName(referral.user)}</p>
                              <p className="text-sm text-gray-600">{referral.user.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="font-mono font-bold">
                              {referral.code}
                            </Badge>
                          </td>
                          <td className="text-center py-3 px-4">
                            {getVerificationBadge(referral)}
                          </td>
                          <td className="text-center py-3 px-4">
                            <div className="flex flex-col items-center">
                              <span className="font-semibold text-gray-900">{referral.totalReferrals}</span>
                              <span className="text-xs text-gray-500">{referral.activeReferrals} active</span>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4">
                            <span className="text-orange-600 font-medium">
                              {referral.pendingEarnings.toLocaleString()} XAF
                            </span>
                          </td>
                          <td className="text-right py-3 px-4">
                            <span className="text-green-600 font-medium">
                              {referral.paidEarnings.toLocaleString()} XAF
                            </span>
                          </td>
                          <td className="text-right py-3 px-4">
                            <span className="font-semibold text-gray-900">
                              {referral.totalEarnings.toLocaleString()} XAF
                            </span>
                          </td>
                          <td className="text-right py-3 px-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewReferral(referral)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredReferralCodes.length === 0 && (
                    <div className="text-center py-12">
                      <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No referral codes found</h3>
                      <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Referral Details Modal */}
            {selectedReferral && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                  <div className="p-6 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Referral Details</h2>
                        <p className="text-gray-600 mt-1">
                          Code: <span className="font-mono font-bold">{selectedReferral.code}</span>
                        </p>
                        <p className="text-sm text-gray-500">{getUserName(selectedReferral.user)}</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedReferral(null)}
                      >
                        Close
                      </Button>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">Total Referrals</p>
                        <p className="text-2xl font-bold text-blue-700 mt-1">
                          {selectedReferral.totalReferrals}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          {selectedReferral.activeReferrals} active
                        </p>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-sm text-yellow-600 font-medium">Total Earnings</p>
                        <p className="text-2xl font-bold text-yellow-700 mt-1">
                          {selectedReferral.totalEarnings.toLocaleString()}
                        </p>
                        <p className="text-xs text-yellow-600 mt-1">XAF</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-orange-600 font-medium">Pending</p>
                        <p className="text-2xl font-bold text-orange-700 mt-1">
                          {selectedReferral.pendingEarnings.toLocaleString()}
                        </p>
                        <p className="text-xs text-orange-600 mt-1">XAF</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Paid Out</p>
                        <p className="text-2xl font-bold text-green-700 mt-1">
                          {selectedReferral.paidEarnings.toLocaleString()}
                        </p>
                        <p className="text-xs text-green-600 mt-1">XAF</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    {detailsLoading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#15803D] mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading details...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Referrals List */}
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-4">
                            Referrals ({selectedReferral.referrals.length})
                          </h3>
                          {selectedReferral.referrals.length === 0 ? (
                            <p className="text-gray-600 text-sm">No referrals yet</p>
                          ) : (
                            <div className="space-y-3">
                              {selectedReferral.referrals.map((ref: any) => (
                                <div key={ref.id} className="border rounded-lg p-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {getUserName(ref.referee)}
                                      </p>
                                      <p className="text-sm text-gray-600">{ref.referee.email}</p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        Joined: {new Date(ref.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <Badge variant="outline">
                                      {ref.earnings.length} orders
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Earnings List */}
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-4">
                            Commission Earnings ({selectedReferral.earnings.length})
                          </h3>
                          {selectedReferral.earnings.length === 0 ? (
                            <p className="text-gray-600 text-sm">No earnings yet</p>
                          ) : (
                            <div className="space-y-3">
                              {selectedReferral.earnings.map((earning: any) => (
                                <div key={earning.id} className="border rounded-lg p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        Order #{earning.order.orderNumber}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {new Date(earning.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <Badge className={earning.isPaid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                                      {earning.isPaid ? 'Paid' : 'Pending'}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <p className="text-gray-600">Order Total</p>
                                      <p className="font-medium">{Number(earning.orderTotal).toLocaleString()} XAF</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Commission (50%)</p>
                                      <p className="font-bold text-green-600">
                                        {Number(earning.commissionAmount).toLocaleString()} XAF
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-2">
                                    Profit: {Number(earning.profitAmount).toLocaleString()} XAF
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
