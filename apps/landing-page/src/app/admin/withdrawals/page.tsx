'use client'

import { useEffect, useState } from 'react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  Eye,
  Wallet,
  CreditCard,
  Smartphone,
  Building,
  Banknote,
} from 'lucide-react'

interface WithdrawalStats {
  total: number
  pending: number
  completed: number
  rejected: number
  totalPendingAmount: number
  totalCompletedAmount: number
}

interface WithdrawalRequest {
  id: string
  amount: number
  method: string
  phoneNumber: string | null
  accountDetails: any
  status: string
  adminNotes: string | null
  createdAt: string
  reviewedAt: string | null
  user: {
    id: string
    name: string
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  reviewer: {
    id: string
    name: string
    firstName: string
    lastName: string
    email: string
  } | null
  walletBalance: number
}

export default function AdminWithdrawalsPage() {
  const [stats, setStats] = useState<WithdrawalStats | null>(null)
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([])
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    fetchData()
  }, [filterStatus])

  const fetchData = async () => {
    setLoading(true)
    try {
      const url = filterStatus === 'all'
        ? '/api/admin/withdrawals'
        : `/api/admin/withdrawals?status=${filterStatus}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
        setWithdrawalRequests(data.withdrawalRequests)
      }
    } catch (error) {
      console.error('Error fetching withdrawal data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (withdrawalId: string) => {
    if (!confirm('Are you sure you want to approve this withdrawal? This will deduct the amount from the user\'s wallet.')) {
      return
    }

    setProcessing(true)
    try {
      const response = await fetch(`/api/admin/withdrawals/${withdrawalId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true, adminNotes }),
      })

      const data = await response.json()

      if (data.success) {
        alert('Withdrawal approved successfully!')
        setSelectedWithdrawal(null)
        setAdminNotes('')
        fetchData()
      } else {
        alert(data.error || 'Failed to approve withdrawal')
      }
    } catch (error) {
      console.error('Error approving withdrawal:', error)
      alert('Failed to approve withdrawal')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (withdrawalId: string) => {
    const reason = prompt('Please enter a reason for rejection:')
    if (!reason) return

    setProcessing(true)
    try {
      const response = await fetch(`/api/admin/withdrawals/${withdrawalId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: false, adminNotes: reason }),
      })

      const data = await response.json()

      if (data.success) {
        alert('Withdrawal rejected successfully!')
        setSelectedWithdrawal(null)
        setAdminNotes('')
        fetchData()
      } else {
        alert(data.error || 'Failed to reject withdrawal')
      }
    } catch (error) {
      console.error('Error rejecting withdrawal:', error)
      alert('Failed to reject withdrawal')
    } finally {
      setProcessing(false)
    }
  }

  const getUserName = (user: any) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user.name || user.email.split('@')[0]
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'MTN_MOMO':
      case 'ORANGE_MOMO':
        return <Smartphone className="h-4 w-4" />
      case 'BANK_TRANSFER':
        return <Building className="h-4 w-4" />
      case 'CASH':
        return <Banknote className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getMethodName = (method: string) => {
    switch (method) {
      case 'MTN_MOMO':
        return 'MTN Mobile Money'
      case 'ORANGE_MOMO':
        return 'Orange Money'
      case 'BANK_TRANSFER':
        return 'Bank Transfer'
      case 'CASH':
        return 'Cash'
      default:
        return method
    }
  }

  const filteredWithdrawals = withdrawalRequests.filter(withdrawal => {
    const matchesSearch =
      getUserName(withdrawal.user).toLowerCase().includes(searchQuery.toLowerCase()) ||
      withdrawal.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (withdrawal.phoneNumber && withdrawal.phoneNumber.includes(searchQuery))

    return matchesSearch
  })

  return (
    <div>
      <AdminHeader title="Withdrawal Management" />

      <div className="p-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#15803D] mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading withdrawal data...</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Requests</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Wallet className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</p>
                    </div>
                    <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-green-600">{stats?.completed || 0}</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rejected</p>
                      <p className="text-2xl font-bold text-red-600">{stats?.rejected || 0}</p>
                    </div>
                    <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                      <p className="text-xl font-bold text-yellow-600">
                        {(stats?.totalPendingAmount || 0).toLocaleString()}
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
                      <p className="text-sm font-medium text-gray-600">Completed Amount</p>
                      <p className="text-xl font-bold text-green-600">
                        {(stats?.totalCompletedAmount || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">XAF</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
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
                      placeholder="Search by name, email, or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending Only</option>
                    <option value="completed">Completed Only</option>
                    <option value="rejected">Rejected Only</option>
                  </select>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Withdrawals Table */}
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Requests ({filteredWithdrawals.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Method</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWithdrawals.map((withdrawal) => (
                        <tr key={withdrawal.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{getUserName(withdrawal.user)}</p>
                              <p className="text-sm text-gray-600">{withdrawal.user.email}</p>
                              <p className="text-xs text-gray-500">
                                Wallet: {withdrawal.walletBalance.toLocaleString()} XAF
                              </p>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4">
                            <span className="font-bold text-gray-900 text-lg">
                              {withdrawal.amount.toLocaleString()} XAF
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {getMethodIcon(withdrawal.method)}
                              <div>
                                <p className="font-medium text-gray-900">{getMethodName(withdrawal.method)}</p>
                                {withdrawal.phoneNumber && (
                                  <p className="text-sm text-gray-600">{withdrawal.phoneNumber}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-3 px-4">
                            {getStatusBadge(withdrawal.status)}
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-sm text-gray-900">
                                {new Date(withdrawal.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(withdrawal.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedWithdrawal(withdrawal)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredWithdrawals.length === 0 && (
                    <div className="text-center py-12">
                      <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No withdrawal requests found</h3>
                      <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Withdrawal Details Modal */}
            {selectedWithdrawal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                  <div className="p-6 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Withdrawal Request</h2>
                        <p className="text-gray-600 mt-1">{getUserName(selectedWithdrawal.user)}</p>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(selectedWithdrawal.status)}
                        <Button
                          variant="outline"
                          onClick={() => setSelectedWithdrawal(null)}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                      {/* Amount */}
                      <div className="bg-gradient-to-r from-[#15803D] to-[#166534] text-white rounded-lg p-6 text-center">
                        <p className="text-sm opacity-90">Withdrawal Amount</p>
                        <p className="text-4xl font-bold mt-2">{selectedWithdrawal.amount.toLocaleString()} XAF</p>
                      </div>

                      {/* User Details */}
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">User Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Name</p>
                            <p className="font-medium text-gray-900">{getUserName(selectedWithdrawal.user)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Email</p>
                            <p className="font-medium text-gray-900">{selectedWithdrawal.user.email}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Phone</p>
                            <p className="font-medium text-gray-900">{selectedWithdrawal.user.phone || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Wallet Balance</p>
                            <p className="font-bold text-green-600">{selectedWithdrawal.walletBalance.toLocaleString()} XAF</p>
                          </div>
                        </div>
                      </div>

                      {/* Withdrawal Details */}
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Withdrawal Details</h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-2">
                            {getMethodIcon(selectedWithdrawal.method)}
                            <div>
                              <p className="text-gray-600">Method</p>
                              <p className="font-medium text-gray-900">{getMethodName(selectedWithdrawal.method)}</p>
                            </div>
                          </div>
                          {selectedWithdrawal.phoneNumber && (
                            <div>
                              <p className="text-gray-600">Phone Number</p>
                              <p className="font-medium text-gray-900">{selectedWithdrawal.phoneNumber}</p>
                            </div>
                          )}
                          {selectedWithdrawal.accountDetails && (
                            <div>
                              <p className="text-gray-600">Account Details</p>
                              <pre className="font-medium text-gray-900 text-xs bg-gray-50 p-2 rounded mt-1">
                                {JSON.stringify(selectedWithdrawal.accountDetails, null, 2)}
                              </pre>
                            </div>
                          )}
                          <div>
                            <p className="text-gray-600">Requested At</p>
                            <p className="font-medium text-gray-900">
                              {new Date(selectedWithdrawal.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {selectedWithdrawal.reviewedAt && (
                            <div>
                              <p className="text-gray-600">Reviewed At</p>
                              <p className="font-medium text-gray-900">
                                {new Date(selectedWithdrawal.reviewedAt).toLocaleString()}
                              </p>
                            </div>
                          )}
                          {selectedWithdrawal.reviewer && (
                            <div>
                              <p className="text-gray-600">Reviewed By</p>
                              <p className="font-medium text-gray-900">
                                {getUserName(selectedWithdrawal.reviewer)}
                              </p>
                            </div>
                          )}
                          {selectedWithdrawal.adminNotes && (
                            <div>
                              <p className="text-gray-600">Admin Notes</p>
                              <p className="font-medium text-gray-900">{selectedWithdrawal.adminNotes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Admin Actions */}
                      {selectedWithdrawal.status === 'PENDING' && (
                        <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-900 mb-3">Admin Action Required</h3>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Admin Notes (Optional)
                            </label>
                            <textarea
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                              rows={3}
                              placeholder="Enter any notes or instructions..."
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleApprove(selectedWithdrawal.id)}
                              disabled={processing}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {processing ? 'Processing...' : 'Approve & Pay'}
                            </Button>
                            <Button
                              onClick={() => handleReject(selectedWithdrawal.id)}
                              disabled={processing}
                              variant="outline"
                              className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              {processing ? 'Processing...' : 'Reject'}
                            </Button>
                          </div>
                          <p className="text-xs text-yellow-700 mt-3">
                            <AlertCircle className="h-3 w-3 inline mr-1" />
                            Approving will deduct {selectedWithdrawal.amount.toLocaleString()} XAF from the user's wallet.
                          </p>
                        </div>
                      )}
                    </div>
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
