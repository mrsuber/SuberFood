'use client'

import { useEffect, useState } from 'react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  TrendingUp,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  Download,
  Eye,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Award,
  Leaf,
} from 'lucide-react'
import Link from 'next/link'

interface FarmerStats {
  total: number
  active: number
  pending: number
  verified: number
  totalRevenue: number
  totalSupplied: number
}

interface Farmer {
  id: string
  name: string
  businessName: string | null
  farmerType: string
  phone: string
  email: string | null
  region: string
  village: string | null
  farmSize: number | null
  isOrganic: boolean
  isCertified: boolean
  isVerified: boolean
  status: string
  totalRevenue: number
  totalSupplied: number
  averageQualityRating: number | null
  _count: {
    products: number
    supplies: number
  }
  createdAt: string
}

export default function AdminFarmersPage() {
  const [stats, setStats] = useState<FarmerStats | null>(null)
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterRegion, setFilterRegion] = useState('all')

  useEffect(() => {
    fetchFarmers()
  }, [filterStatus, filterRegion])

  const fetchFarmers = async () => {
    setLoading(true)
    try {
      let url = '/api/admin/farmers?'
      if (filterStatus !== 'all') url += `status=${filterStatus}&`
      if (filterRegion !== 'all') url += `region=${filterRegion}&`
      if (searchQuery) url += `search=${searchQuery}&`

      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
        setFarmers(data.farmers)
        setRegions(data.regions || [])
      }
    } catch (error) {
      console.error('Error fetching farmers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchFarmers()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
      case 'PENDING_VERIFICATION':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'INACTIVE':
        return <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>
      case 'SUSPENDED':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="h-3 w-3 mr-1" />Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getFarmerTypeBadge = (type: string) => {
    const colors: any = {
      INDIVIDUAL: 'bg-blue-100 text-blue-700',
      COOPERATIVE: 'bg-purple-100 text-purple-700',
      COMMERCIAL_FARM: 'bg-indigo-100 text-indigo-700',
      ORGANIC_FARM: 'bg-green-100 text-green-700',
    }
    return <Badge className={colors[type] || 'bg-gray-100 text-gray-700'}>{type.replace('_', ' ')}</Badge>
  }

  const filteredFarmers = farmers.filter(farmer => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      farmer.name.toLowerCase().includes(query) ||
      farmer.phone.includes(query) ||
      (farmer.email && farmer.email.toLowerCase().includes(query)) ||
      (farmer.village && farmer.village.toLowerCase().includes(query)) ||
      farmer.region.toLowerCase().includes(query)
    )
  })

  return (
    <div>
      <AdminHeader title="Farmer Management" />

      <div className="p-8">
        {loading && !farmers.length ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#15803D] mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading farmers...</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Farmers</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active</p>
                      <p className="text-2xl font-bold text-green-600">{stats?.active || 0}</p>
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
                      <p className="text-sm font-medium text-gray-600">Verified</p>
                      <p className="text-2xl font-bold text-blue-600">{stats?.verified || 0}</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Award className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Supplied</p>
                      <p className="text-xl font-bold text-gray-900">
                        {(stats?.totalSupplied || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">kg/units</p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-xl font-bold text-green-600">
                        {(stats?.totalRevenue || 0).toLocaleString()}
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

            {/* Filters & Search */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, phone, email, village, or region..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending_verification">Pending Verification</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <select
                    value={filterRegion}
                    onChange={(e) => setFilterRegion(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  >
                    <option value="all">All Regions</option>
                    {regions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                  <Button onClick={handleSearch} className="bg-[#15803D] hover:bg-[#166534]">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Link href="/admin/farmers/new">
                    <Button className="bg-[#15803D] hover:bg-[#166534]">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Farmer
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Farmers Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Farmers ({filteredFarmers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Farmer</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Products</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Supplied</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFarmers.map((farmer) => (
                        <tr key={farmer.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900">{farmer.name}</p>
                                {farmer.isVerified && (
                                  <Award className="h-4 w-4 text-blue-600" title="Verified" />
                                )}
                                {farmer.isOrganic && (
                                  <Leaf className="h-4 w-4 text-green-600" title="Organic" />
                                )}
                              </div>
                              {farmer.businessName && (
                                <p className="text-sm text-gray-600">{farmer.businessName}</p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {farmer.phone}
                                </span>
                                {farmer.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {farmer.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {getFarmerTypeBadge(farmer.farmerType)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">{farmer.region}</p>
                                {farmer.village && (
                                  <p className="text-xs text-gray-600">{farmer.village}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-3 px-4">
                            {getStatusBadge(farmer.status)}
                          </td>
                          <td className="text-center py-3 px-4">
                            <Badge variant="outline">{farmer._count.products}</Badge>
                          </td>
                          <td className="text-right py-3 px-4">
                            <span className="font-medium text-gray-900">
                              {Number(farmer.totalSupplied).toLocaleString()}
                            </span>
                            <p className="text-xs text-gray-500">kg/units</p>
                          </td>
                          <td className="text-right py-3 px-4">
                            <span className="font-bold text-green-600">
                              {Number(farmer.totalRevenue).toLocaleString()}
                            </span>
                            <p className="text-xs text-gray-500">XAF</p>
                          </td>
                          <td className="text-right py-3 px-4">
                            <div className="flex justify-end gap-2">
                              <Link href={`/admin/farmers/${farmer.id}`}>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredFarmers.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No farmers found</h3>
                      <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
                      <Link href="/admin/farmers/new">
                        <Button className="bg-[#15803D] hover:bg-[#166534]">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Farmer
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
