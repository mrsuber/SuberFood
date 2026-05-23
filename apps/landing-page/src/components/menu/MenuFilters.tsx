'use client';

import { useMenuStore } from '@/lib/stores/menu-store';
import { Filter, X } from 'lucide-react';

export function MenuFilters() {
  const { filters, setFilters, resetFilters } = useMenuStore();

  const dietaryOptions = [
    { key: 'vegetarian', label: 'Vegetarian' },
    { key: 'vegan', label: 'Vegan' },
    { key: 'glutenFree', label: 'Gluten-Free' },
    { key: 'keto', label: 'Keto' },
    { key: 'halal', label: 'Halal' },
    { key: 'kosher', label: 'Kosher' },
  ];

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'price-asc', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' },
  ];

  const hasActiveFilters =
    filters.vegetarian ||
    filters.vegan ||
    filters.glutenFree ||
    filters.keto ||
    filters.halal ||
    filters.kosher ||
    filters.search ||
    (filters.maxSpiceLevel !== undefined && filters.maxSpiceLevel < 5);

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

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
        <input
          type="text"
          placeholder="Search menu items..."
          value={filters.search || ''}
          onChange={(e) => setFilters({ search: e.target.value || undefined })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Dietary Options */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Dietary Preferences</label>
        <div className="space-y-2">
          {dietaryOptions.map((option) => (
            <label key={option.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!filters[option.key as keyof typeof filters]}
                onChange={(e) => setFilters({ [option.key]: e.target.checked || undefined })}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Spice Level */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Max Spice Level: {filters.maxSpiceLevel ?? 5}
        </label>
        <input
          type="range"
          min="0"
          max="5"
          value={filters.maxSpiceLevel ?? 5}
          onChange={(e) =>
            setFilters({ maxSpiceLevel: parseInt(e.target.value) === 5 ? undefined : parseInt(e.target.value) })
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Mild</span>
          <span>Hot</span>
        </div>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
        <select
          value={filters.sortBy || 'name'}
          onChange={(e) => setFilters({ sortBy: e.target.value as any })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
