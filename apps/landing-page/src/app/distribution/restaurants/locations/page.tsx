'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { locationApi } from '@/lib/api/restaurant-api';
import { useLocationStore } from '@/lib/stores/location-store';
import { LocationFilters } from '@/components/locations/LocationFilters';
import { LocationGrid } from '@/components/locations/LocationGrid';
import { LocationMap } from '@/components/locations/LocationMap';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { MapPin, List } from 'lucide-react';

export default function LocationsPage() {
  const { filters } = useLocationStore();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Fetch locations
  const { data: locationsData, isLoading } = useQuery({
    queryKey: ['locations', filters],
    queryFn: () => locationApi.getLocations(filters),
  });

  return (
    <>
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-4">Our Locations</h1>
            <p className="text-lg text-blue-100">
              Find a SuberFood restaurant near you
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* View Toggle */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {locationsData?.count || 0} Locations Found
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <List className="w-4 h-4" />
                List View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  viewMode === 'map'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <MapPin className="w-4 h-4" />
                Map View
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <LocationFilters />
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {viewMode === 'grid' ? (
                <LocationGrid locations={locationsData?.data || []} loading={isLoading} />
              ) : (
                <LocationMap locations={locationsData?.data || []} loading={isLoading} />
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
