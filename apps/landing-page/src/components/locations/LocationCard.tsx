'use client';

import type { Restaurant } from '@/lib/types/restaurant';
import { MapPin, Phone, Mail, Clock, Users, Star, Navigation, Accessibility, Car, Award } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface LocationCardProps {
  location: Restaurant;
}

export function LocationCard({ location }: LocationCardProps) {
  const isOpen = location.status === 'OPEN';

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'FINE_DINING':
        return 'Fine Dining';
      case 'CAFETERIA':
        return 'Cafeteria';
      case 'FOOD_COURT':
        return 'Food Court';
      default:
        return type;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-64 bg-gray-200">
        {location.images?.[0] ? (
          <Image
            src={location.images[0]}
            alt={location.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
            🏢
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isOpen
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {location.status.replace('_', ' ')}
          </span>
        </div>

        {/* Type Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            {getTypeLabel(location.type)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{location.name}</h3>

        {location.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{location.description}</p>
        )}

        {/* Address */}
        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span>
              {location.address}, {location.city}, {location.state} {location.postalCode}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <a href={`tel:${location.phone}`} className="hover:text-blue-600">
              {location.phone}
            </a>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <a href={`mailto:${location.email}`} className="hover:text-blue-600">
              {location.email}
            </a>
          </div>

          {location.openingTime && location.closingTime && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>
                {location.openingTime} - {location.closingTime}
              </span>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {location.capacity > 0 && (
            <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
              <Users className="w-3 h-3" />
              Capacity: {location.capacity}
            </div>
          )}

          {location.rating > 0 && (
            <div className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
              <Star className="w-3 h-3 fill-yellow-400" />
              {location.rating.toFixed(1)}
            </div>
          )}

          {location.currentWaitTime !== null && (
            <div className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
              <Clock className="w-3 h-3" />
              {location.currentWaitTime} min wait
            </div>
          )}
        </div>

        {/* Amenities */}
        {location.amenities && location.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {location.privateRooms && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                Private Rooms
              </span>
            )}
            {location.outdoorSeating && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                Outdoor Seating
              </span>
            )}
            {location.accessibilityFeatures && location.accessibilityFeatures.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                <Accessibility className="w-3 h-3" />
                Accessible
              </span>
            )}
            {location.parkingInfo && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center gap-1">
                <Car className="w-3 h-3" />
                Parking
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/distribution/restaurants/${location.slug}`}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm font-medium"
          >
            View Details
          </Link>
          {location.latitude && location.longitude && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Navigation className="w-4 h-4" />
              Directions
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
