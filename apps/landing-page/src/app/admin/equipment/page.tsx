'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  MapPin,
  Settings,
} from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  type: string;
  status: string;
  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  warrantyExpiry: string | null;
  lastMaintenanceDate: string | null;
  nextMaintenanceDate: string | null;
  totalUsageHours: number;
  usageCount: number;
  restaurant: {
    id: string;
    name: string;
    city: string;
    state: string;
    branchCode: string | null;
  };
  maintenanceLogs: Array<{
    id: string;
    maintenanceType: string;
    cost: number;
    startDate: string;
    completedDate: string | null;
  }>;
  _count: {
    maintenanceLogs: number;
    usageLogs: number;
  };
}

interface EquipmentResponse {
  equipment: Equipment[];
  stats: {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    totalMaintenanceCost: number;
    needsMaintenance: number;
  };
  total: number;
}

export default function EquipmentManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'RESTAURANT_MANAGER'];
      if (!allowedRoles.includes(session?.user?.role || '')) {
        router.push('/');
      } else {
        fetchEquipment();
      }
    }
  }, [status, session]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedType, selectedStatus, selectedRestaurant, equipment]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedType) params.append('type', selectedType);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedRestaurant) params.append('restaurantId', selectedRestaurant);

      const url = `/api/admin/equipment${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch equipment');
      }

      const data: EquipmentResponse = await response.json();
      setEquipment(data.equipment);
      setFilteredEquipment(data.equipment);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = equipment;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.type.toLowerCase().includes(query) ||
          e.manufacturer?.toLowerCase().includes(query) ||
          e.model?.toLowerCase().includes(query) ||
          e.serialNumber?.toLowerCase().includes(query)
      );
    }

    setFilteredEquipment(filtered);
  };

  const formatType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return `$${amount.toLocaleString()}`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERATIONAL':
        return 'bg-green-100 text-green-800';
      case 'MAINTENANCE_REQUIRED':
        return 'bg-yellow-100 text-yellow-800';
      case 'UNDER_MAINTENANCE':
        return 'bg-orange-100 text-orange-800';
      case 'OUT_OF_SERVICE':
        return 'bg-red-100 text-red-800';
      case 'RETIRED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'COOKING_APPLIANCE':
        return '🔥';
      case 'REFRIGERATION':
        return '❄️';
      case 'FOOD_PREP':
        return '🔪';
      case 'DISHWASHING':
        return '🧼';
      case 'MEASUREMENT':
        return '⚖️';
      default:
        return '🔧';
    }
  };

  const isWarrantyExpired = (warrantyExpiry: string | null) => {
    if (!warrantyExpiry) return false;
    return new Date(warrantyExpiry) < new Date();
  };

  const needsMaintenanceSoon = (nextMaintenanceDate: string | null) => {
    if (!nextMaintenanceDate) return false;
    const daysUntil = Math.floor(
      (new Date(nextMaintenanceDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntil <= 7 && daysUntil >= 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading equipment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
          <button
            onClick={fetchEquipment}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Wrench size={32} />
                Equipment Management
              </h1>
              <p className="mt-1 text-gray-600">
                Track and maintain restaurant equipment
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Add Equipment
            </button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total Equipment</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Operational</p>
                <p className="text-2xl font-bold text-green-900">
                  {stats.byStatus.OPERATIONAL || 0}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600 font-medium">Needs Maintenance</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {stats.needsMaintenance || 0}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Under Maintenance</p>
                <p className="text-2xl font-bold text-orange-900">
                  {stats.byStatus.UNDER_MAINTENANCE || 0}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Total Maintenance Cost</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(stats.totalMaintenanceCost)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, type, manufacturer, model, or serial number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter size={20} />
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="COOKING_APPLIANCE">Cooking Appliance</option>
                  <option value="REFRIGERATION">Refrigeration</option>
                  <option value="FOOD_PREP">Food Prep</option>
                  <option value="DISHWASHING">Dishwashing</option>
                  <option value="MEASUREMENT">Measurement</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="OPERATIONAL">Operational</option>
                  <option value="MAINTENANCE_REQUIRED">Maintenance Required</option>
                  <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                  <option value="RETIRED">Retired</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedType('');
                    setSelectedStatus('');
                    setSelectedRestaurant('');
                  }}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Equipment List */}
        {filteredEquipment.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Wrench size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No equipment found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Add your first equipment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/admin/equipment/${item.id}`)}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getTypeIcon(item.type)}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-sm opacity-90">{formatType(item.type)}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(item.status)} bg-opacity-90`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{item.restaurant.name}</p>
                      <p className="text-xs">
                        {item.restaurant.city}, {item.restaurant.state}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  {(item.manufacturer || item.model) && (
                    <div className="text-sm">
                      <p className="text-gray-600">
                        {item.manufacturer && <span className="font-medium">{item.manufacturer}</span>}
                        {item.manufacturer && item.model && ' • '}
                        {item.model && <span>{item.model}</span>}
                      </p>
                      {item.serialNumber && (
                        <p className="text-xs text-gray-500">SN: {item.serialNumber}</p>
                      )}
                    </div>
                  )}

                  {/* Alerts */}
                  <div className="space-y-1">
                    {needsMaintenanceSoon(item.nextMaintenanceDate) && (
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                        <AlertTriangle size={14} />
                        <span>Maintenance due soon</span>
                      </div>
                    )}
                    {isWarrantyExpired(item.warrantyExpiry) && (
                      <div className="flex items-center gap-2 p-2 bg-red-50 rounded text-xs text-red-800">
                        <XCircle size={14} />
                        <span>Warranty expired</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Usage Count</p>
                      <p className="font-semibold text-gray-900">{item.usageCount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Usage Hours</p>
                      <p className="font-semibold text-gray-900">
                        {Math.round(item.totalUsageHours).toLocaleString()}h
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Maintenance Logs</p>
                      <p className="font-semibold text-gray-900">{item._count.maintenanceLogs}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Recent Cost</p>
                      <p className="font-semibold text-gray-900">
                        {item.maintenanceLogs.length > 0
                          ? formatCurrency(item.maintenanceLogs[0].cost)
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="text-xs text-gray-500 pt-2 border-t space-y-1">
                    {item.lastMaintenanceDate && (
                      <div className="flex items-center justify-between">
                        <span>Last Maintenance:</span>
                        <span className="font-medium">{formatDate(item.lastMaintenanceDate)}</span>
                      </div>
                    )}
                    {item.nextMaintenanceDate && (
                      <div className="flex items-center justify-between">
                        <span>Next Maintenance:</span>
                        <span className="font-medium">{formatDate(item.nextMaintenanceDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Equipment Modal - Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Add Equipment</h3>
            <p className="text-gray-600 mb-4">
              Equipment creation form will be implemented here. This includes:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 mb-4 space-y-1">
              <li>Select restaurant location</li>
              <li>Enter equipment name</li>
              <li>Select equipment type</li>
              <li>Enter manufacturer and model details</li>
              <li>Set purchase information</li>
              <li>Set maintenance budget</li>
            </ul>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
