'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Clock, Star, ChevronRight, Filter } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  status: string;
  openingTime: string | null;
  closingTime: string | null;
  rating: number;
  latitude: number | null;
  longitude: number | null;
  images: string[];
  amenities: string[];
  isMainBranch: boolean;
  branchCode: string | null;
  currentWaitTime: number | null;
}

interface LocationsResponse {
  total: number;
  mainBranches: number;
  branches: number;
  locations: Location[];
  cities: string[];
  states: string[];
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedCity, selectedState, selectedType, locations]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/locations');

      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }

      const data: LocationsResponse = await response.json();
      setLocations(data.locations);
      setFilteredLocations(data.locations);
      setCities(data.cities);
      setStates(data.states);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = locations;

    if (selectedCity) {
      filtered = filtered.filter(loc => loc.city === selectedCity);
    }

    if (selectedState) {
      filtered = filtered.filter(loc => loc.state === selectedState);
    }

    if (selectedType) {
      filtered = filtered.filter(loc => loc.type === selectedType);
    }

    setFilteredLocations(filtered);
  };

  const clearFilters = () => {
    setSelectedCity('');
    setSelectedState('');
    setSelectedType('');
  };

  const formatType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading locations...</p>
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
            onClick={fetchLocations}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Our Locations</h1>
          <p className="mt-2 text-gray-600">
            Find a SuberFood restaurant near you. {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Filter size={20} />
          Filters
          {(selectedCity || selectedState || selectedType) && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
              Active
            </span>
          )}
        </button>

        {showFilters && (
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* State Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Restaurant Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="CLASSICAL_FINE_DINING">Fine Dining</option>
                <option value="CAFETERIA">Cafeteria</option>
                <option value="QUICK_SERVICE">Quick Service</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Locations Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredLocations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No locations found matching your filters.</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((location) => (
              <Link
                key={location.id}
                href={`/locations/${location.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="h-48 bg-gray-200 relative">
                  {location.images && location.images.length > 0 ? (
                    <img
                      src={location.images[0]}
                      alt={location.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <MapPin size={48} />
                    </div>
                  )}
                  {location.isMainBranch && (
                    <span className="absolute top-2 right-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                      Main Branch
                    </span>
                  )}
                  {location.status !== 'OPEN' && (
                    <span className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs rounded">
                      {location.status.replace('_', ' ')}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                  {location.branchCode && (
                    <p className="text-xs text-gray-500 mb-2">{location.branchCode}</p>
                  )}

                  <p className="text-sm text-gray-600 mb-2">{formatType(location.type)}</p>

                  {/* Address */}
                  <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                    <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                    <span>
                      {location.address}, {location.city}, {location.state}
                    </span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Phone size={16} className="flex-shrink-0" />
                    <span>{location.phone}</span>
                  </div>

                  {/* Hours */}
                  {location.openingTime && location.closingTime && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Clock size={16} className="flex-shrink-0" />
                      <span>
                        {location.openingTime} - {location.closingTime}
                      </span>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{location.rating.toFixed(1)}</span>
                  </div>

                  {/* Wait Time */}
                  {location.currentWaitTime && location.currentWaitTime > 0 && (
                    <p className="text-xs text-orange-600 mb-3">
                      Current wait: ~{location.currentWaitTime} min
                    </p>
                  )}

                  {/* View Menu Button */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-sm text-blue-600 font-medium">View Menu</span>
                    <ChevronRight size={20} className="text-blue-600" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
