'use client'

import { useEffect, useState } from 'react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Download,
  Eye,
  Gift,
  ShoppingCart,
  RotateCcw,
  CreditCard,
} from 'lucide-react'

interface WalletStats {
  totalWallets: number
  totalBalance: number
  totalEarned: number
  totalSpent: number
  activeWallets: number
}

interface WalletData {
  id: string
  userId: string
  user: {
    id: string
    name: string
    email: string
  }
  balance: number
  totalEarned: number
  totalSpent: number
  createdAt: string
  updatedAt: string
  _count: {
    transactions: number
  }
}

interface Transaction {
  id: string
  type: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  description: string
  referenceType: string | null
  referenceId: string | null
  createdAt: string
}

export default function WalletManagementPage() {
  const [stats, setStats] = useState<WalletStats | null>(null)
  const [wallets, setWallets] = useState<WalletData[]>([])
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/wallet-management')
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
        setWallets(data.wallets)
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async (walletId: string) => {
    setTransactionsLoading(true)
    try {
      const response = await fetch(`/api/admin/wallet-management/${walletId}/transactions`)
      const data = await response.json()

      if (data.success) {
        setTransactions(data.transactions)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setTransactionsLoading(false)
    }
  }

  const handleViewWallet = (wallet: WalletData) => {
    setSelectedWallet(wallet)
    fetchTransactions(wallet.id)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'REFERRAL_REWARD':
        return <Gift className="h-4 w-4" />
      case 'PURCHASE':
        return <ShoppingCart className="h-4 w-4" />
      case 'REFUND':
        return <RotateCcw className="h-4 w-4" />
      case 'TOP_UP':
        return <CreditCard className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'REFERRAL_REWARD':
      case 'TOP_UP':
      case 'REFUND':
        return 'text-green-600'
      case 'PURCHASE':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const filteredWallets = wallets.filter(wallet => {
    const matchesSearch =
      wallet.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wallet.user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterType === 'all' ||
      (filterType === 'active' && Number(wallet.balance) > 0) ||
      (filterType === 'empty' && Number(wallet.balance) === 0)

    return matchesSearch && matchesFilter
  })

  return (
    <div>
      <AdminHeader title="Wallet Management" />

      <div className="p-8">
        {/* Stats Overview */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#15803D] mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading wallet data...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Wallets</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalWallets || 0}</p>
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
                      <p className="text-sm font-medium text-gray-600">Total Balance</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(stats?.totalBalance || 0).toLocaleString()} XAF
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Earned</p>
                      <p className="text-2xl font-bold text-green-600">
                        {(stats?.totalEarned || 0).toLocaleString()} XAF
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold text-red-600">
                        {(stats?.totalSpent || 0).toLocaleString()} XAF
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <TrendingDown className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Wallets</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.activeWallets || 0}</p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-orange-600" />
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
                      placeholder="Search by name or email..."
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
                    <option value="all">All Wallets</option>
                    <option value="active">Active (Balance > 0)</option>
                    <option value="empty">Empty (Balance = 0)</option>
                  </select>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Wallets Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Wallets ({filteredWallets.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Balance</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Earned</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Spent</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Transactions</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWallets.map((wallet) => (
                        <tr key={wallet.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{wallet.user.name}</p>
                              <p className="text-sm text-gray-600">{wallet.user.email}</p>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4">
                            <span className={`font-semibold ${Number(wallet.balance) > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                              {Number(wallet.balance).toLocaleString()} XAF
                            </span>
                          </td>
                          <td className="text-right py-3 px-4 text-green-600 font-medium">
                            +{Number(wallet.totalEarned).toLocaleString()} XAF
                          </td>
                          <td className="text-right py-3 px-4 text-red-600 font-medium">
                            -{Number(wallet.totalSpent).toLocaleString()} XAF
                          </td>
                          <td className="text-center py-3 px-4">
                            <Badge variant="outline">{wallet._count.transactions}</Badge>
                          </td>
                          <td className="text-right py-3 px-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewWallet(wallet)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredWallets.length === 0 && (
                    <div className="text-center py-12">
                      <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No wallets found</h3>
                      <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Transaction Details Modal/Sidebar */}
            {selectedWallet && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                  <div className="p-6 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Wallet Details</h2>
                        <p className="text-gray-600 mt-1">{selectedWallet.user.name}</p>
                        <p className="text-sm text-gray-500">{selectedWallet.user.email}</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedWallet(null)
                          setTransactions([])
                        }}
                      >
                        Close
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">Current Balance</p>
                        <p className="text-2xl font-bold text-blue-700 mt-1">
                          {Number(selectedWallet.balance).toLocaleString()} XAF
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Total Earned</p>
                        <p className="text-2xl font-bold text-green-700 mt-1">
                          +{Number(selectedWallet.totalEarned).toLocaleString()} XAF
                        </p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-red-600 font-medium">Total Spent</p>
                        <p className="text-2xl font-bold text-red-700 mt-1">
                          -{Number(selectedWallet.totalSpent).toLocaleString()} XAF
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Transaction History</h3>

                    {transactionsLoading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#15803D] mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading transactions...</p>
                      </div>
                    ) : transactions.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-600">No transactions yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {transactions.map((tx) => (
                          <div
                            key={tx.id}
                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className={`mt-1 ${getTransactionColor(tx.type)}`}>
                                  {getTransactionIcon(tx.type)}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{tx.description}</p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {new Date(tx.createdAt).toLocaleDateString()} at{' '}
                                    {new Date(tx.createdAt).toLocaleTimeString()}
                                  </p>
                                  <div className="flex gap-4 text-xs text-gray-500 mt-2">
                                    <span>Before: {Number(tx.balanceBefore).toLocaleString()} XAF</span>
                                    <span>After: {Number(tx.balanceAfter).toLocaleString()} XAF</span>
                                  </div>
                                  {tx.referenceType && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Ref: {tx.referenceType} - {tx.referenceId}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge className={tx.type.includes('REWARD') || tx.type.includes('TOP_UP') || tx.type.includes('REFUND') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                  {tx.type.replace('_', ' ')}
                                </Badge>
                                <p className={`text-lg font-bold mt-2 ${getTransactionColor(tx.type)}`}>
                                  {tx.type.includes('PURCHASE') ? '-' : '+'}{Number(tx.amount).toLocaleString()} XAF
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
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
