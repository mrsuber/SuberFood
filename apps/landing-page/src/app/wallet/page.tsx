'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface WalletData {
  id: string;
  balance: string;
  totalDeposits: string;
  totalWithdrawals: string;
  totalSpent: string;
  totalReferralEarnings: string;
  transactions: Transaction[];
  withdrawalRequests: WithdrawalRequest[];
}

interface Transaction {
  id: string;
  type: string;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  description: string;
  createdAt: string;
}

interface WithdrawalRequest {
  id: string;
  amount: string;
  method: string;
  status: string;
  createdAt: string;
  reviewedAt?: string;
  adminNotes?: string;
}

export default function WalletPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Deposit form
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('CASH');
  const [depositLoading, setDepositLoading] = useState(false);

  // Withdrawal form
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('CASH');
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchWallet();
    }
  }, [status, router]);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/wallet');
      const data = await res.json();

      if (data.success) {
        setWallet(data.wallet);
      } else {
        setError(data.error || 'Failed to load wallet');
      }
    } catch (err) {
      setError('Failed to load wallet');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositLoading(true);
    setError('');

    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(depositAmount),
          method: depositMethod,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setDepositAmount('');
        fetchWallet();
        alert('Deposit successful!');
      } else {
        setError(data.error || 'Deposit failed');
      }
    } catch (err) {
      setError('Deposit failed');
      console.error(err);
    } finally {
      setDepositLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawLoading(true);
    setError('');

    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          method: withdrawMethod,
          phoneNumber: withdrawPhone,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setWithdrawAmount('');
        setWithdrawPhone('');
        setShowWithdrawForm(false);
        fetchWallet();
        alert('Withdrawal request submitted! Admin will process it soon.');
      } else {
        setError(data.error || 'Withdrawal request failed');
      }
    } catch (err) {
      setError('Withdrawal request failed');
      console.error(err);
    } finally {
      setWithdrawLoading(false);
    }
  };

  const getTransactionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      DEPOSIT: 'bg-green-100 text-green-800',
      WITHDRAWAL: 'bg-red-100 text-red-800',
      PURCHASE: 'bg-blue-100 text-blue-800',
      REFUND: 'bg-yellow-100 text-yellow-800',
      REFERRAL_EARNING: 'bg-purple-100 text-purple-800',
      ADMIN_ADJUSTMENT: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading wallet...</div>
      </div>
    );
  }

  if (error && !wallet) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">My Wallet</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-green-600">
              {Number(wallet?.balance || 0).toLocaleString()} XAF
            </CardTitle>
            <CardDescription>Available Balance</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {Number(wallet?.totalDeposits || 0).toLocaleString()} XAF
            </CardTitle>
            <CardDescription>Total Deposits</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {Number(wallet?.totalReferralEarnings || 0).toLocaleString()} XAF
            </CardTitle>
            <CardDescription>Referral Earnings</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Deposit & Withdraw Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Deposit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Deposit Money</CardTitle>
            <CardDescription>Add funds to your wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <Label htmlFor="depositAmount">Amount (XAF)</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  min="100"
                  step="100"
                  placeholder="5000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="depositMethod">Payment Method</Label>
                <select
                  id="depositMethod"
                  value={depositMethod}
                  onChange={(e) => setDepositMethod(e.target.value)}
                  className="w-full border rounded p-2"
                >
                  <option value="CASH">Cash</option>
                  <option value="MTN_MOMO">MTN Mobile Money</option>
                  <option value="ORANGE_MOMO">Orange Money</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>

              <Button type="submit" className="w-full" disabled={depositLoading}>
                {depositLoading ? 'Processing...' : 'Deposit'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Withdraw Form */}
        <Card>
          <CardHeader>
            <CardTitle>Withdraw Money</CardTitle>
            <CardDescription>Request a withdrawal</CardDescription>
          </CardHeader>
          <CardContent>
            {!showWithdrawForm ? (
              <Button
                onClick={() => setShowWithdrawForm(true)}
                variant="outline"
                className="w-full"
              >
                Request Withdrawal
              </Button>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <Label htmlFor="withdrawAmount">Amount (XAF)</Label>
                  <Input
                    id="withdrawAmount"
                    type="number"
                    min="500"
                    step="100"
                    max={Number(wallet?.balance || 0)}
                    placeholder="5000"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Available: {Number(wallet?.balance || 0).toLocaleString()} XAF
                  </p>
                </div>

                <div>
                  <Label htmlFor="withdrawMethod">Withdrawal Method</Label>
                  <select
                    id="withdrawMethod"
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value)}
                    className="w-full border rounded p-2"
                  >
                    <option value="CASH">Cash Pickup</option>
                    <option value="MTN_MOMO">MTN Mobile Money</option>
                    <option value="ORANGE_MOMO">Orange Money</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>

                {(withdrawMethod === 'MTN_MOMO' || withdrawMethod === 'ORANGE_MOMO') && (
                  <div>
                    <Label htmlFor="withdrawPhone">Mobile Money Number</Label>
                    <Input
                      id="withdrawPhone"
                      type="tel"
                      placeholder="671234567"
                      value={withdrawPhone}
                      onChange={(e) => setWithdrawPhone(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowWithdrawForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={withdrawLoading}>
                    {withdrawLoading ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Withdrawals */}
      {wallet?.withdrawalRequests && wallet.withdrawalRequests.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Withdrawal Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {wallet.withdrawalRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex justify-between items-center p-4 border rounded"
                >
                  <div>
                    <p className="font-semibold">
                      {Number(request.amount).toLocaleString()} XAF
                    </p>
                    <p className="text-sm text-gray-600">
                      {request.method} • {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                    {request.adminNotes && (
                      <p className="text-sm text-gray-600 mt-1">Note: {request.adminNotes}</p>
                    )}
                  </div>
                  <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Last 20 transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {wallet?.transactions && wallet.transactions.length > 0 ? (
            <div className="space-y-2">
              {wallet.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex justify-between items-center p-4 border rounded hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getTransactionTypeColor(tx.type)}>{tx.type}</Badge>
                      <span className="text-sm text-gray-600">
                        {new Date(tx.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{tx.description}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        tx.type === 'DEPOSIT' || tx.type === 'REFUND' || tx.type === 'REFERRAL_EARNING'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {tx.type === 'DEPOSIT' || tx.type === 'REFUND' || tx.type === 'REFERRAL_EARNING'
                        ? '+'
                        : '-'}
                      {Number(tx.amount).toLocaleString()} XAF
                    </p>
                    <p className="text-sm text-gray-600">
                      Balance: {Number(tx.balanceAfter).toLocaleString()} XAF
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No transactions yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
