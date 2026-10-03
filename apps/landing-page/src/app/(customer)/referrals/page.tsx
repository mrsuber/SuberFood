'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ReferralData {
  referralCode: {
    id: string;
    code: string;
    isActive: boolean;
    isSuspended: boolean;
    isVerified: boolean;
    totalReferrals: number;
    activeReferrals: number;
    totalEarnings: string;
    lifetimeEarnings: string;
    verification?: {
      status: string;
      idCardUrl?: string;
      photoUrl?: string;
      phoneNumber: string;
      rejectionReason?: string;
    };
    referrals: Referral[];
    earnings: Earning[];
  };
  summary: {
    totalReferrals: number;
    activeReferrals: number;
    totalEarnings: number;
    lifetimeEarnings: number;
    pendingEarnings: number;
    paidEarnings: number;
  };
}

interface Referral {
  id: string;
  status: string;
  totalOrders: number;
  totalEarned: string;
  createdAt: string;
  referee: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
  earnings: Earning[];
}

interface Earning {
  id: string;
  orderTotal: string;
  profitAmount: string;
  commissionAmount: string;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
  order: {
    orderNumber: string;
    totalAmount: string;
    createdAt: string;
  };
}

export default function ReferralsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Verification form
  const [showVerifyForm, setShowVerifyForm] = useState(false);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchReferralData();
    }
  }, [status, router]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/referral');
      const data = await res.json();

      if (data.success) {
        setReferralData(data);
      } else {
        setError(data.error || 'Failed to load referral data');
      }
    } catch (err) {
      setError('Failed to load referral data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (referralData?.referralCode.code) {
      navigator.clipboard.writeText(referralData.referralCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareReferralCode = () => {
    const code = referralData?.referralCode.code;
    const message = `Join SuberFood and use my referral code: ${code}\n\nGet fresh farm products delivered to your doorstep!\n\nhttps://suberfoods.com?ref=${code}`;

    if (navigator.share) {
      navigator.share({
        title: 'Join SuberFood',
        text: message,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(message);
      alert('Referral message copied to clipboard!');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyLoading(true);
    setError('');
    setUploadProgress('');

    try {
      // Validate files
      if (!idCardFile || !photoFile) {
        setError('Please select both ID card and photo');
        setVerifyLoading(false);
        return;
      }

      // Step 1: Upload files
      setUploadProgress('Uploading files...');
      const uploadFormData = new FormData();
      uploadFormData.append('idCard', idCardFile);
      uploadFormData.append('photo', photoFile);

      const uploadRes = await fetch('/api/upload/verification', {
        method: 'POST',
        body: uploadFormData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        setError(uploadData.error || 'Failed to upload files');
        setVerifyLoading(false);
        return;
      }

      // Step 2: Submit verification with uploaded file URLs
      setUploadProgress('Submitting verification...');
      const verifyRes = await fetch('/api/referral/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idCardUrl: uploadData.idCardUrl,
          photoUrl: uploadData.photoUrl,
          phoneNumber,
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        alert('Verification submitted! Admin will review your documents soon.');
        setShowVerifyForm(false);
        setIdCardFile(null);
        setPhotoFile(null);
        setPhoneNumber('');
        fetchReferralData();
      } else {
        setError(verifyData.error || 'Verification submission failed');
      }
    } catch (err) {
      setError('Verification submission failed');
      console.error(err);
    } finally {
      setVerifyLoading(false);
      setUploadProgress('');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      VERIFIED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading referral data...</div>
      </div>
    );
  }

  if (error && !referralData) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  const verification = referralData?.referralCode.verification;
  const isVerified = verification?.status === 'VERIFIED';
  const canEarn = referralData?.referralCode.isVerified && !referralData?.referralCode.isSuspended;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Referral Program</h1>
      <p className="text-gray-600 mb-8">
        Earn 50% of profit on every order from people you refer - forever!
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-purple-600">
              {referralData?.summary.totalReferrals || 0}
            </CardTitle>
            <CardDescription>Total Referrals</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-green-600">
              {referralData?.summary.activeReferrals || 0}
            </CardTitle>
            <CardDescription>Active Referrals</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {(referralData?.summary.lifetimeEarnings || 0).toLocaleString()} XAF
            </CardTitle>
            <CardDescription>Lifetime Earnings</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-yellow-600">
              {(referralData?.summary.pendingEarnings || 0).toLocaleString()} XAF
            </CardTitle>
            <CardDescription>Pending Earnings</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* My Referral Code */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>My Referral Code</CardTitle>
          <CardDescription>Share this code to earn commissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Input
                  value={referralData?.referralCode.code || ''}
                  readOnly
                  className="text-2xl font-bold text-center"
                />
                <Button onClick={copyReferralCode} variant="outline">
                  {copied ? '✓ Copied!' : 'Copy'}
                </Button>
                <Button onClick={shareReferralCode}>Share</Button>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="bg-gray-50 p-4 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Verification Status:</span>
              <Badge className={getStatusColor(verification?.status || 'PENDING')}>
                {verification?.status || 'NOT SUBMITTED'}
              </Badge>
            </div>

            {!canEarn && !verification && (
              <div className="mb-4">
                <p className="text-sm text-yellow-800 bg-yellow-100 p-3 rounded mb-2">
                  ⚠️ You need to verify your account to start earning referral commissions.
                  Submit your ID and photo for verification.
                </p>
                <Button onClick={() => setShowVerifyForm(true)} size="sm">
                  Submit Verification
                </Button>
              </div>
            )}

            {verification?.status === 'PENDING' && (
              <p className="text-sm text-blue-600">
                Your verification is under review. You'll be notified once approved.
              </p>
            )}

            {verification?.status === 'REJECTED' && (
              <div>
                <p className="text-sm text-red-600 mb-2">
                  Verification rejected: {verification.rejectionReason}
                </p>
                <Button onClick={() => setShowVerifyForm(true)} size="sm" variant="outline">
                  Resubmit Verification
                </Button>
              </div>
            )}

            {isVerified && (
              <p className="text-sm text-green-600">
                ✓ Account verified! You can now earn commissions from referrals.
              </p>
            )}

            {referralData?.referralCode.isSuspended && (
              <p className="text-sm text-red-600 mt-2">
                ⚠️ Your referral account is suspended. Contact support for details.
              </p>
            )}
          </div>

          {/* Verification Form */}
          {showVerifyForm && (
            <div className="mt-4 p-4 border rounded bg-gray-50">
              <h3 className="font-semibold mb-4">Submit Verification Documents</h3>
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <Label htmlFor="idCard">ID Card Photo</Label>
                  <Input
                    id="idCard"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => setIdCardFile(e.target.files?.[0] || null)}
                    required
                    className="cursor-pointer"
                  />
                  {idCardFile && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ {idCardFile.name} ({(idCardFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a clear photo of your ID card (max 5MB)
                  </p>
                </div>

                <div>
                  <Label htmlFor="photo">Your Photo</Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                    required
                    className="cursor-pointer"
                  />
                  {photoFile && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ {photoFile.name} ({(photoFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a clear photo of yourself (max 5MB)
                  </p>
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="671234567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>

                {uploadProgress && (
                  <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded text-sm">
                    {uploadProgress}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowVerifyForm(false);
                      setIdCardFile(null);
                      setPhotoFile(null);
                      setPhoneNumber('');
                    }}
                    disabled={verifyLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={verifyLoading}>
                    {verifyLoading ? 'Uploading...' : 'Submit Verification'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Referrals */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>My Referrals</CardTitle>
          <CardDescription>People you've referred</CardDescription>
        </CardHeader>
        <CardContent>
          {referralData?.referralCode.referrals && referralData.referralCode.referrals.length > 0 ? (
            <div className="space-y-4">
              {referralData.referralCode.referrals.map((referral) => (
                <div key={referral.id} className="p-4 border rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">
                        {referral.referee.firstName || referral.referee.lastName
                          ? `${referral.referee.firstName} ${referral.referee.lastName}`
                          : referral.referee.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        Joined {new Date(referral.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(referral.status)}>{referral.status}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Orders:</span>
                      <span className="ml-2 font-semibold">{referral.totalOrders}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Earned:</span>
                      <span className="ml-2 font-semibold text-green-600">
                        {Number(referral.totalEarned).toLocaleString()} XAF
                      </span>
                    </div>
                  </div>

                  {/* Recent Earnings from this referral */}
                  {referral.earnings.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-gray-600 mb-2">Recent Earnings:</p>
                      <div className="space-y-1">
                        {referral.earnings.slice(0, 3).map((earning) => (
                          <div key={earning.id} className="flex justify-between text-xs">
                            <span>{earning.order.orderNumber}</span>
                            <span className="font-semibold text-green-600">
                              +{Number(earning.commissionAmount).toLocaleString()} XAF
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">No referrals yet</p>
              <p className="text-sm">Share your code to start earning!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Earnings History */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings History</CardTitle>
          <CardDescription>Commission from all referrals</CardDescription>
        </CardHeader>
        <CardContent>
          {referralData?.referralCode.earnings && referralData.referralCode.earnings.length > 0 ? (
            <div className="space-y-2">
              {referralData.referralCode.earnings.map((earning) => (
                <div
                  key={earning.id}
                  className="flex justify-between items-center p-4 border rounded hover:bg-gray-50"
                >
                  <div>
                    <p className="font-semibold">{earning.order.orderNumber}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(earning.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Order: {Number(earning.orderTotal).toLocaleString()} XAF • Profit:{' '}
                      {Number(earning.profitAmount).toLocaleString()} XAF
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      +{Number(earning.commissionAmount).toLocaleString()} XAF
                    </p>
                    <Badge className={earning.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {earning.isPaid ? 'Paid' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">No earnings yet</p>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="mt-8 bg-purple-50">
        <CardHeader>
          <CardTitle>How Referral Earnings Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <span className="font-bold text-purple-600">1.</span>
              <p>Share your referral code with friends and family</p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-purple-600">2.</span>
              <p>They use your code when signing up or checking out</p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-purple-600">3.</span>
              <p>
                When they order, you earn <strong>50% of the profit</strong> on that order
              </p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-purple-600">4.</span>
              <p>
                Earnings are automatically deposited to your wallet - <strong>forever!</strong>
              </p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-purple-600">5.</span>
              <p>You can withdraw your earnings or use them for your own purchases</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white rounded">
            <p className="text-sm font-semibold mb-2">Example:</p>
            <p className="text-xs text-gray-600">
              Your friend orders 20kg beans for 20,000 XAF. Farm cost is 14,000 XAF. Profit =
              6,000 XAF. You earn 3,000 XAF (50%)!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
