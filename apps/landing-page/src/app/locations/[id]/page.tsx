'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  Users,
  ArrowLeft,
  ChevronRight,
  Utensils,
  Wrench,
  MapPinned,
} from 'lucide-react';

interface LocationDetail {
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
  email: string;
  status: string;
  openingTime: string | null;
  closingTime: string | null;
  operatingDays: string | null;
  capacity: number;
  rating: number;
  latitude: number | null;
  longitude: number | null;
  images: string[];
  amenities: string[];
  parkingInfo: string | null;
  accessibilityFeatures: string[];
  privateRooms: boolean;
  outdoorSeating: boolean;
  currentWaitTime: number | null;
  story: string | null;
  awards: string[];
  isMainBranch: boolean;
  branchCode: string | null;
  parentRestaurant: {
    id: string;
    name: string;
    slug: string;
    branchCode: string | null;
  } | null;
  branches: Array<{
    id: string;
    name: string;
    slug: string;
    city: string;
    state: string;
    address: string;
    branchCode: string | null;
    status: string;
    phone: string;
  }>;
  stats: {
    staff: Record<string, number>;
    equipment: {
      operational: number;
      maintenanceRequired: number;
      total: number;
    };
    totalStaff: number;
    totalBranches: number;
  };
}

export default function LocationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [location, setLocation] = useState<LocationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchLocationDetails(params.id as string);
    }
  }, [params.id]);

  const fetchLocationDetails = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/locations/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch location details');
      }

      const data = await response.json();
      setLocation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatStaffRole = (role: string) => {
    return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading location details...</p>
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {error || 'Location not found'}</p>
          <button
            onClick={() => router.push('/locations')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Locations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/locations')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            Back to Locations
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-96 bg-gray-200">
        {location.images && location.images.length > 0 ? (
          <img
            src={location.images[0]}
            alt={location.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Utensils size={96} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">{location.name}</h1>
              {location.isMainBranch && (
                <span className="px-3 py-1 bg-blue-600 text-sm rounded">Main Branch</span>
              )}
              {location.branchCode && (
                <span className="px-3 py-1 bg-gray-800/50 text-sm rounded">{location.branchCode}</span>
              )}
            </div>
            <p className="text-lg">{formatType(location.type)}</p>
            {location.status !== 'OPEN' && (
              <span className="inline-block mt-2 px-3 py-1 bg-red-600 text-sm rounded">
                {location.status.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {location.description && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4">About</h2>
                <p className="text-gray-700">{location.description}</p>
              </div>
            )}

            {/* Story */}
            {location.story && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
                <p className="text-gray-700 whitespace-pre-line">{location.story}</p>
              </div>
            )}

            {/* Awards */}
            {location.awards && location.awards.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4">Awards & Recognition</h2>
                <ul className="space-y-2">
                  {location.awards.map((award, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Star size={20} className="text-yellow-500 fill-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{award}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Amenities */}
            {location.amenities && location.amenities.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 gap-3">
                  {location.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="capitalize">{amenity}</span>
                    </div>
                  ))}
                  {location.privateRooms && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span>Private Rooms Available</span>
                    </div>
                  )}
                  {location.outdoorSeating && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span>Outdoor Seating</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Other Branches */}
            {location.branches && location.branches.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4">Other Locations</h2>
                <div className="space-y-3">
                  {location.branches.map((branch) => (
                    <Link
                      key={branch.id}
                      href={`/locations/${branch.id}`}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                    >
                      <div>
                        <p className="font-medium">{branch.name}</p>
                        <p className="text-sm text-gray-600">
                          {branch.city}, {branch.state}
                        </p>
                        {branch.branchCode && (
                          <p className="text-xs text-gray-500">{branch.branchCode}</p>
                        )}
                      </div>
                      <ChevronRight size={20} className="text-gray-400" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* View Menu CTA */}
            <Link
              href={`/locations/${location.id}/menu`}
              className="block w-full bg-blue-600 text-white text-center py-4 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              View Menu & Order
            </Link>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{location.address}</p>
                    <p className="text-sm text-gray-600">
                      {location.city}, {location.state} {location.postalCode}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone size={20} className="text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <a href={`tel:${location.phone}`} className="font-medium hover:text-blue-600">
                      {location.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <a href={`mailto:${location.email}`} className="font-medium hover:text-blue-600">
                      {location.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock size={20} />
                Hours
              </h3>
              {location.openingTime && location.closingTime ? (
                <p className="text-gray-700">
                  {location.openingTime} - {location.closingTime}
                </p>
              ) : (
                <p className="text-gray-500">Hours not available</p>
              )}
              {location.currentWaitTime && location.currentWaitTime > 0 && (
                <p className="mt-2 text-sm text-orange-600">
                  Current wait: ~{location.currentWaitTime} min
                </p>
              )}
            </div>

            {/* Rating */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Rating</h3>
              <div className="flex items-center gap-2">
                <Star size={32} className="text-yellow-500 fill-yellow-500" />
                <span className="text-3xl font-bold">{location.rating.toFixed(1)}</span>
                <span className="text-gray-600">/ 5.0</span>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Location Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={20} />
                    <span>Capacity</span>
                  </div>
                  <span className="font-medium">{location.capacity} guests</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={20} />
                    <span>Staff</span>
                  </div>
                  <span className="font-medium">{location.stats.totalStaff}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Wrench size={20} />
                    <span>Equipment</span>
                  </div>
                  <span className="font-medium">{location.stats.equipment.total}</span>
                </div>

                {location.stats.totalBranches > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPinned size={20} />
                      <span>Branches</span>
                    </div>
                    <span className="font-medium">{location.stats.totalBranches}</span>
                  </div>
                )}
              </div>

              {/* Staff Breakdown */}
              {Object.keys(location.stats.staff).length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-2">Staff Breakdown</p>
                  <div className="space-y-1">
                    {Object.entries(location.stats.staff).map(([role, count]) => (
                      <div key={role} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{formatStaffRole(role)}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Parking */}
            {location.parkingInfo && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Parking</h3>
                <p className="text-gray-700 text-sm">{location.parkingInfo}</p>
              </div>
            )}

            {/* Accessibility */}
            {location.accessibilityFeatures && location.accessibilityFeatures.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-3">Accessibility</h3>
                <div className="space-y-2">
                  {location.accessibilityFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="capitalize">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
