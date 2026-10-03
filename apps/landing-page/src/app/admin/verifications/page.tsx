'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Clock, Eye, User, Phone, Calendar } from 'lucide-react';

interface Verification {
  id: string;
  userId: string;
  idCardUrl: string | null;
  photoUrl: string | null;
  phoneNumber: string;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  referralCode: {
    code: string;
    totalReferrals: number;
  };
}

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/verifications');
      const data = await res.json();

      if (data.success) {
        setVerifications(data.verifications);
      } else {
        setError(data.error || 'Failed to load verifications');
      }
    } catch (err) {
      setError('Failed to load verifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (verificationId: string, approved: boolean) => {
    if (!approved && !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/verifications/${verificationId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved,
          rejectionReason: approved ? null : rejectionReason,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(approved ? 'Verification approved!' : 'Verification rejected');
        setSelectedVerification(null);
        setRejectionReason('');
        fetchVerifications();
      } else {
        setError(data.error || 'Failed to process verification');
      }
    } catch (err) {
      setError('Failed to process verification');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      VERIFIED: 'bg-green-100 text-green-800 border-green-300',
      REJECTED: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'VERIFIED':
        return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredVerifications = verifications.filter(v => {
    if (filter === 'all') return true;
    return v.status === filter.toUpperCase();
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading verifications...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Referral Verifications</h1>
        <p className="text-gray-600">Review and approve customer verification requests</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          Pending ({verifications.filter(v => v.status === 'PENDING').length})
        </Button>
        <Button
          variant={filter === 'verified' ? 'default' : 'outline'}
          onClick={() => setFilter('verified')}
        >
          Verified ({verifications.filter(v => v.status === 'VERIFIED').length})
        </Button>
        <Button
          variant={filter === 'rejected' ? 'default' : 'outline'}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({verifications.filter(v => v.status === 'REJECTED').length})
        </Button>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All ({verifications.length})
        </Button>
      </div>

      {/* Verifications List */}
      {filteredVerifications.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-gray-500">No verifications found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredVerifications.map((verification) => (
            <Card key={verification.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {verification.user.firstName && verification.user.lastName
                        ? `${verification.user.firstName} ${verification.user.lastName}`
                        : verification.user.email}
                    </CardTitle>
                    <CardDescription className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Referral Code:</span>
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                          {verification.referralCode.code}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({verification.referralCode.totalReferrals} referrals)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {verification.phoneNumber}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Submitted {new Date(verification.createdAt).toLocaleDateString()}
                      </div>
                    </CardDescription>
                  </div>
                  <Badge className={`flex items-center gap-1 ${getStatusColor(verification.status)}`}>
                    {getStatusIcon(verification.status)}
                    {verification.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Document Preview */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">ID Card</Label>
                      {verification.idCardUrl ? (
                        <a
                          href={verification.idCardUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={verification.idCardUrl}
                            alt="ID Card"
                            className="w-full h-48 object-cover rounded border cursor-pointer hover:opacity-80 transition"
                          />
                        </a>
                      ) : (
                        <div className="w-full h-48 bg-gray-100 rounded border flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                    <div>
                      <Label className="mb-2 block">Photo</Label>
                      {verification.photoUrl ? (
                        <a
                          href={verification.photoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={verification.photoUrl}
                            alt="User Photo"
                            className="w-full h-48 object-cover rounded border cursor-pointer hover:opacity-80 transition"
                          />
                        </a>
                      ) : (
                        <div className="w-full h-48 bg-gray-100 rounded border flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  {verification.status === 'REJECTED' && verification.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded">
                      <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                      <p className="text-sm text-red-700">{verification.rejectionReason}</p>
                    </div>
                  )}

                  {/* Review Actions */}
                  {verification.status === 'PENDING' && (
                    <div className="border-t pt-4">
                      {selectedVerification?.id === verification.id ? (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="rejectionReason">Rejection Reason (Required if rejecting)</Label>
                            <Textarea
                              id="rejectionReason"
                              placeholder="e.g., ID card image is not clear, photo doesn't match ID, etc."
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedVerification(null);
                                setRejectionReason('');
                              }}
                              disabled={actionLoading}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleReview(verification.id, true)}
                              disabled={actionLoading}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleReview(verification.id, false)}
                              disabled={actionLoading}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setSelectedVerification(verification)}
                          variant="outline"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review Verification
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
