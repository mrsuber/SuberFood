'use client';

import type { Restaurant } from '@/lib/types/restaurant';
import { LocationCard } from './LocationCard';

interface LocationGridProps {
  locations: Restaurant[];
  loading: boolean;
}

export function LocationGrid({ locations, loading }: LocationGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-64 bg-gray-200 animate-pulse" />
            <div className="p-6 space-y-3">
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📍</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No locations found</h3>
        <p className="text-gray-500">Try adjusting your filters to see more locations</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {locations.map((location) => (
        <LocationCard key={location.id} location={location} />
      ))}
    </div>
  );
}
