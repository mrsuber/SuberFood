'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Clock, Star, ChevronRight, Filter } from 'lucide-react';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';

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
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading locations...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-4">Our Locations</h1>
            <p className="text-lg text-blue-100">
              Find a SuberFood restaurant near you. {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 shadow-md hover:shadow-lg transition-all text-gray-900 font-medium"
          >
            <Filter size={20} className="text-blue-600" />
            <span className="text-gray-900">Filters</span>
            {(selectedCity || selectedState || selectedType) && (
              <span className="ml-2 px-2.5 py-0.5 bg-blue-600 text-white text-xs rounded-full font-semibold">
                Active
              </span>
            )}
          </button>

          {showFilters && (
            <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* City Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
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
                  href={`/distribution/restaurants/${location.slug}`}
                  className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                >
                  {/* Image */}
                  <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {location.images && location.images.length > 0 ? (
                      <>
                        <img
                          src={location.images[0]}
                          alt={location.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <MapPin size={56} className="group-hover:text-blue-500 transition-colors" />
                      </div>
                    )}
                    {location.status !== 'OPEN' && (
                      <span className="absolute top-3 left-3 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg shadow-lg">
                        {location.status.replace('_', ' ')}
                      </span>
                    )}
                    {/* Image Count Badge */}
                    {location.images && location.images.length > 1 && (
                      <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        {location.images.length}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">{location.name}</h3>
                      {location.status === 'OPEN' && (
                        <div className="flex-shrink-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse ml-2 mt-2"></div>
                      )}
                    </div>

                    <p className="text-sm text-blue-600 font-medium mb-3">{formatType(location.type)}</p>

                    <div className="space-y-2.5 mb-4">
                      {/* Address */}
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin size={16} className="mt-0.5 flex-shrink-0 text-gray-400" />
                        <span className="line-clamp-1">
                          {location.address}, {location.city}, {location.state}
                        </span>
                      </div>

                      {/* Phone */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={16} className="flex-shrink-0 text-gray-400" />
                        <span>{location.phone}</span>
                      </div>

                      {/* Hours */}
                      {location.openingTime && location.closingTime && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={16} className="flex-shrink-0 text-gray-400" />
                          <span>
                            {location.openingTime} - {location.closingTime}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Rating & Wait Time */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1.5 bg-yellow-50 px-2.5 py-1.5 rounded-lg">
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-bold text-gray-900">{location.rating.toFixed(1)}</span>
                      </div>

                      {location.currentWaitTime && location.currentWaitTime > 0 && (
                        <div className="text-xs text-orange-600 font-medium bg-orange-50 px-2.5 py-1.5 rounded-lg">
                          Wait: ~{location.currentWaitTime} min
                        </div>
                      )}
                    </div>

                    {/* View Details Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 group-hover:border-blue-200 transition-colors">
                      <span className="text-sm text-blue-600 font-semibold group-hover:text-blue-700">View Details & Menu</span>
                      <ChevronRight size={20} className="text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
