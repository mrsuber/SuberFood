'use client';

import { useLocationStore } from '@/lib/stores/location-store';
import { Filter, X } from 'lucide-react';

export function LocationFilters() {
  const { filters, setFilters, resetFilters } = useLocationStore();

  const typeOptions = [
    { value: 'FINE_DINING', label: 'Fine Dining' },
    { value: 'CAFETERIA', label: 'Cafeteria' },
    { value: 'FOOD_COURT', label: 'Food Court' },
  ];

  const statusOptions = [
    { value: 'OPEN', label: 'Open Now' },
    { value: 'CLOSED', label: 'Closed' },
    { value: 'TEMPORARILY_CLOSED', label: 'Temporarily Closed' },
  ];

  const hasActiveFilters = filters.type || filters.status || filters.city || filters.state;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
        <select
          value={filters.type || ''}
          onChange={(e) => setFilters({ type: (e.target.value as any) || undefined })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Types</option>
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <select
          value={filters.status || ''}
          onChange={(e) => setFilters({ status: (e.target.value as any) || undefined })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Statuses</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* City */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
        <input
          type="text"
          placeholder="Enter city..."
          value={filters.city || ''}
          onChange={(e) => setFilters({ city: e.target.value || undefined })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* State */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
        <input
          type="text"
          placeholder="Enter state..."
          value={filters.state || ''}
          onChange={(e) => setFilters({ state: e.target.value || undefined })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
