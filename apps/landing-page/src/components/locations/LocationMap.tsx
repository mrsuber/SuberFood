'use client';

import type { Restaurant } from '@/lib/types/restaurant';
import { MapPin } from 'lucide-react';

interface LocationMapProps {
  locations: Restaurant[];
  loading: boolean;
}

export function LocationMap({ locations, loading }: LocationMapProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
          <MapPin className="w-12 h-12 text-gray-400" />
        </div>
      </div>
    );
  }

  const locationsWithCoords = locations.filter((loc) => loc.latitude && loc.longitude);

  if (locationsWithCoords.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No locations with coordinates</h3>
        <p className="text-gray-500">Map view requires locations with GPS coordinates</p>
      </div>
    );
  }

  // Simple iframe map fallback (Google Maps embed can be added later with API key)
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="h-96 bg-gray-100 flex flex-col items-center justify-center p-8 text-center">
        <MapPin className="w-16 h-16 text-blue-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Interactive Map</h3>
        <p className="text-gray-600 mb-4">
          {locationsWithCoords.length} location{locationsWithCoords.length !== 1 ? 's' : ''} available
        </p>
        <p className="text-sm text-gray-500">
          To enable interactive maps, add your Google Maps API key to the environment variables.
        </p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
          {locationsWithCoords.map((location) => (
            <a
              key={location.id}
              href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium text-gray-900">{location.name}</div>
                <div className="text-sm text-gray-500">
                  {location.city}, {location.state}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
