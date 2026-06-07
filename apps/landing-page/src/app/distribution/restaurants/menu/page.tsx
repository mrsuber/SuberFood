'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { menuApi } from '@/lib/api/restaurant-api';
import { useMenuStore } from '@/lib/stores/menu-store';
import { MenuFilters } from '@/components/menu/MenuFilters';
import { MenuGrid } from '@/components/menu/MenuGrid';
import { CategoryTabs } from '@/components/menu/CategoryTabs';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { ChevronRight, MapPin } from 'lucide-react';

function MenuPageContent() {
  const searchParams = useSearchParams();
  const locationId = searchParams.get('location');
  const [locationName, setLocationName] = useState<string | null>(null);

  const { filters } = useMenuStore();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  // Fetch location details if locationId is provided
  useEffect(() => {
    if (locationId) {
      fetch(`/api/locations/${locationId}`)
        .then(res => res.json())
        .then(data => setLocationName(data.name))
        .catch(() => setLocationName(null));
    }
  }, [locationId]);

  // Fetch menu items
  const { data: menuData, isLoading: menuLoading } = useQuery({
    queryKey: ['menu', filters, selectedCategory, locationId],
    queryFn: () => menuApi.getMenu({
      ...filters,
      categoryId: selectedCategory,
      restaurantId: locationId || undefined
    }),
  });

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories', locationId],
    queryFn: () => menuApi.getCategories(locationId || undefined),
  });

  return (
    <>
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumbs */}
            {locationId && locationName && (
              <nav className="mb-4 flex items-center gap-2 text-sm text-green-100">
                <Link href="/distribution/restaurants/locations" className="hover:text-white">
                  Locations
                </Link>
                <ChevronRight size={16} />
                <Link href={`/distribution/restaurants/locations`} className="hover:text-white">
                  {locationName}
                </Link>
                <ChevronRight size={16} />
                <span className="text-white">Menu</span>
              </nav>
            )}

            <h1 className="text-4xl font-bold mb-4">
              {locationId && locationName ? `${locationName} Menu` : 'Our Menu'}
            </h1>
            <p className="text-lg text-green-100">
              {locationId && locationName
                ? `Explore delicious dishes available at ${locationName}`
                : 'Explore our selection of fresh, farm-to-table dishes crafted with care'
              }
            </p>

            {!locationId && (
              <div className="mt-4 flex items-center gap-2 text-sm bg-green-800/30 px-4 py-2 rounded-lg inline-flex">
                <MapPin size={16} />
                <span>Showing menu items from all locations</span>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Categories */}
          <CategoryTabs
            categories={categoriesData?.data || []}
            loading={categoriesLoading}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <MenuFilters />
            </div>

            {/* Menu Grid */}
            <div className="lg:col-span-3">
              <MenuGrid items={menuData?.data || []} loading={menuLoading} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    }>
      <MenuPageContent />
    </Suspense>
  );
}
