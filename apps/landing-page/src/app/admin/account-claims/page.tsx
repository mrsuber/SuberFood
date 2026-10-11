'use client'

import { useEffect, useState } from 'react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Phone,
  Mail,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertCircle,
  Download,
} from 'lucide-react'

interface AccountClaim {
  id: string
  phoneNumber: string
  newEmail: string | null
  fullName: string
  reason: string
  idDocumentUrl: string | null
  proofOfOwnership: string | null
  additionalNotes: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW'
  reviewedBy: string | null
  reviewedAt: string | null
  reviewNotes: string | null
  createdAt: string
  existingAccount: {
    id: string
    email: string | null
    name: string | null
    phone: string | null
    createdAt: string
  } | null
}

interface ClaimStats {
  pending: number
  underReview: number
  approved: number
  rejected: number
  total: number
}

export default function AccountClaimsPage() {
  const [claims, setClaims] = useState<AccountClaim[]>([])
  const [stats, setStats] = useState<ClaimStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selectedClaim, setSelectedClaim] = useState<AccountClaim | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchClaims()
  }, [filter])

  const fetchClaims = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter)

      const response = await fetch(`/api/admin/account-claims?${params}`)
      const data = await response.json()

      if (data.success) {
        setClaims(data.claims)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching account claims:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (claimId: string, action: 'approve' | 'reject' | 'review') => {
    if (!reviewNotes && action !== 'review') {
      alert('Please add review notes')
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/account-claims', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId,
          action,
          reviewNotes
        })
      })

      const data = await response.json()

      if (data.success) {
        alert(data.message)
        setSelectedClaim(null)
        setReviewNotes('')
        fetchClaims()
      } else {
        alert('Action failed: ' + data.message)
      }
    } catch (error) {
      console.error('Error performing action:', error)
      alert('Failed to perform action')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      UNDER_REVIEW: 'bg-blue-100 text-blue-700',
      APPROVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
    }
    return <Badge className={colors[status as keyof typeof colors] || colors.PENDING}>{status.replace('_', ' ')}</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Claims</h1>
          <p className="text-gray-600">Review and manage account recovery requests</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Under Review</CardTitle>
                <Eye className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.underReview}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.approved}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rejected}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
                <FileText className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                All Claims
              </Button>
              <Button
                variant={filter === 'PENDING' ? 'default' : 'outline'}
                onClick={() => setFilter('PENDING')}
              >
                Pending
              </Button>
              <Button
                variant={filter === 'UNDER_REVIEW' ? 'default' : 'outline'}
                onClick={() => setFilter('UNDER_REVIEW')}
              >
                Under Review
              </Button>
              <Button
                variant={filter === 'APPROVED' ? 'default' : 'outline'}
                onClick={() => setFilter('APPROVED')}
              >
                Approved
              </Button>
              <Button
                variant={filter === 'REJECTED' ? 'default' : 'outline'}
                onClick={() => setFilter('REJECTED')}
              >
                Rejected
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Claims Table */}
        <Card>
          <CardHeader>
            <CardTitle>Account Claims</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#15803D] mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading claims...</p>
              </div>
            ) : claims.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No account claims found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Submitted
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Claimant
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        New Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {claims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(claim.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{claim.fullName}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {claim.phoneNumber}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {claim.newEmail || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getStatusBadge(claim.status)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedClaim(claim)}
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

        {/* Claim Details Modal */}
        {selectedClaim && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Account Claim Details</CardTitle>
                  <Button variant="ghost" onClick={() => setSelectedClaim(null)}>✕</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Claim Status */}
                <div>
                  <h3 className="font-semibold mb-2">Status</h3>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedClaim.status)}
                    {selectedClaim.reviewedAt && (
                      <span className="text-sm text-gray-500">
                        Reviewed on {new Date(selectedClaim.reviewedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Claimant Information */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Claimant Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedClaim.fullName}</p>
                    <p><strong>Phone:</strong> {selectedClaim.phoneNumber}</p>
                    <p><strong>Requested Email:</strong> {selectedClaim.newEmail || 'N/A'}</p>
                    <p><strong>Submitted:</strong> {new Date(selectedClaim.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {/* Existing Account */}
                {selectedClaim.existingAccount && (
                  <div>
                    <h3 className="font-semibold mb-2">Existing Account</h3>
                    <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm">
                      <p><strong>Account ID:</strong> {selectedClaim.existingAccount.id}</p>
                      <p><strong>Email:</strong> {selectedClaim.existingAccount.email || 'N/A'}</p>
                      <p><strong>Name:</strong> {selectedClaim.existingAccount.name || 'N/A'}</p>
                      <p><strong>Phone:</strong> {selectedClaim.existingAccount.phone || 'N/A'}</p>
                      <p><strong>Created:</strong> {new Date(selectedClaim.existingAccount.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {/* Reason */}
                <div>
                  <h3 className="font-semibold mb-2">Reason for Claim</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {selectedClaim.reason}
                  </p>
                </div>

                {/* Additional Notes */}
                {selectedClaim.additionalNotes && (
                  <div>
                    <h3 className="font-semibold mb-2">Additional Notes</h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {selectedClaim.additionalNotes}
                    </p>
                  </div>
                )}

                {/* Documents */}
                {(selectedClaim.idDocumentUrl || selectedClaim.proofOfOwnership) && (
                  <div>
                    <h3 className="font-semibold mb-2">Supporting Documents</h3>
                    <div className="space-y-2">
                      {selectedClaim.idDocumentUrl && (
                        <a
                          href={selectedClaim.idDocumentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                        >
                          <Download className="h-4 w-4" />
                          ID Document
                        </a>
                      )}
                      {selectedClaim.proofOfOwnership && (
                        <a
                          href={selectedClaim.proofOfOwnership}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                        >
                          <Download className="h-4 w-4" />
                          Proof of Ownership
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Review Notes */}
                {selectedClaim.status === 'PENDING' || selectedClaim.status === 'UNDER_REVIEW' ? (
                  <div>
                    <h3 className="font-semibold mb-2">Review Notes</h3>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                      rows={4}
                      placeholder="Add your review notes here..."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                    />
                  </div>
                ) : selectedClaim.reviewNotes && (
                  <div>
                    <h3 className="font-semibold mb-2">Admin Review Notes</h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {selectedClaim.reviewNotes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {(selectedClaim.status === 'PENDING' || selectedClaim.status === 'UNDER_REVIEW') && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleAction(selectedClaim.id, 'approve')}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve & Update Email
                    </Button>
                    <Button
                      onClick={() => handleAction(selectedClaim.id, 'reject')}
                      disabled={actionLoading}
                      variant="outline"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Claim
                    </Button>
                    {selectedClaim.status === 'PENDING' && (
                      <Button
                        onClick={() => handleAction(selectedClaim.id, 'review')}
                        disabled={actionLoading}
                        variant="outline"
                        className="flex-1"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Mark Under Review
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
