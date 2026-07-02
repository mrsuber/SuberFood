'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Search, Filter, Leaf, AlertCircle, ShoppingCart } from 'lucide-react';
import CartButton from '@/components/cart/CartButton';
import Link from 'next/link';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  salePrice: number | null;
  image: string | null;
  category: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isKeto: boolean;
  isHalal: boolean;
  isKosher: boolean;
  calories: number | null;
  preparationTime: number | null;
  spiceLevel: number | null;
  allergens: string[];
  ingredients: string | null;
  isChefRecommended: boolean;
  isSeasonal: boolean;
  isPopular: boolean;
  averageRating: number | null;
  reviewCount: number;
  inventoryCheck: Array<{
    ingredient: string;
    required: number;
    available: number;
    unit: string;
    sufficient: boolean;
  }>;
}

interface MenuCategory {
  category: string;
  items: MenuItem[];
}

interface MenuResponse {
  restaurantId: string;
  restaurantName: string;
  totalItems: number;
  categories: MenuCategory[];
  allItems: MenuItem[];
}

export default function LocationMenuPage() {
  const params = useParams();
  const router = useRouter();
  const [menu, setMenu] = useState<MenuResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchMenu(params.id as string);
    }
  }, [params.id, dietaryFilter]);

  const fetchMenu = async (locationId: string) => {
    try {
      setLoading(true);
      let url = `/api/locations/${locationId}/menu`;

      const params = new URLSearchParams();
      if (dietaryFilter) {
        params.append('dietary', dietaryFilter);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch menu');
      }

      const data: MenuResponse = await response.json();
      setMenu(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menu?.allItems.filter((item) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      if (!matchesSearch) return false;
    }

    // Category filter
    if (selectedCategory && item.category !== selectedCategory) {
      return false;
    }

    return true;
  }) || [];

  const getDietaryBadges = (item: MenuItem) => {
    const badges = [];
    if (item.isVegan) badges.push({ label: 'Vegan', color: 'bg-green-100 text-green-800' });
    else if (item.isVegetarian) badges.push({ label: 'Vegetarian', color: 'bg-green-100 text-green-800' });
    if (item.isGlutenFree) badges.push({ label: 'Gluten-Free', color: 'bg-blue-100 text-blue-800' });
    if (item.isKeto) badges.push({ label: 'Keto', color: 'bg-purple-100 text-purple-800' });
    if (item.isHalal) badges.push({ label: 'Halal', color: 'bg-teal-100 text-teal-800' });
    if (item.isKosher) badges.push({ label: 'Kosher', color: 'bg-indigo-100 text-indigo-800' });
    return badges;
  };

  const getSpecialBadges = (item: MenuItem) => {
    const badges = [];
    if (item.isChefRecommended) badges.push({ label: "Chef's Pick", color: 'bg-yellow-100 text-yellow-800' });
    if (item.isSeasonal) badges.push({ label: 'Seasonal', color: 'bg-orange-100 text-orange-800' });
    if (item.isPopular) badges.push({ label: 'Popular', color: 'bg-red-100 text-red-800' });
    return badges;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {error || 'Menu not found'}</p>
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Floating Cart Button */}
      <CartButton />
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push(`/locations/${params.id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
          >
            <ArrowLeft size={20} />
            Back to Location Details
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{menu.restaurantName}</h1>
              <p className="text-sm text-gray-600">{menu.totalItems} items available</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter size={20} />
              Filters
              {(selectedCategory || dietaryFilter) && (
                <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Active
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {menu.categories.map((cat) => (
                    <option key={cat.category} value={cat.category}>
                      {cat.category} ({cat.items.length})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dietary Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dietary</label>
                <select
                  value={dietaryFilter}
                  onChange={(e) => setDietaryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Items</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="glutenfree">Gluten-Free</option>
                  <option value="keto">Keto</option>
                  <option value="halal">Halal</option>
                  <option value="kosher">Kosher</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setDietaryFilter('');
                    setSearchQuery('');
                  }}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No menu items found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setDietaryFilter('');
              }}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Link
                key={item.id}
                href={`/locations/${params.id}/menu/${item.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                {/* Image */}
                <div className="h-48 bg-gray-200 relative">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Leaf size={48} />
                    </div>
                  )}

                  {/* Special Badges */}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {getSpecialBadges(item).map((badge, idx) => (
                      <span key={idx} className={`px-2 py-1 text-xs rounded ${badge.color}`}>
                        {badge.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">{item.name}</h3>
                    <div className="text-right ml-2">
                      {item.salePrice ? (
                        <>
                          <p className="text-lg font-bold text-green-600">{item.salePrice.toLocaleString('fr-FR')} XAF</p>
                          <p className="text-sm text-gray-500 line-through">{item.price.toLocaleString('fr-FR')} XAF</p>
                        </>
                      ) : (
                        <p className="text-lg font-bold text-gray-900">{item.price.toLocaleString('fr-FR')} XAF</p>
                      )}
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  )}

                  {/* Dietary Badges */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {getDietaryBadges(item).map((badge, idx) => (
                      <span key={idx} className={`px-2 py-0.5 text-xs rounded ${badge.color}`}>
                        {badge.label}
                      </span>
                    ))}
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                    {item.calories && <span>{item.calories} cal</span>}
                    {item.preparationTime && <span>{item.preparationTime} min</span>}
                    {item.spiceLevel && <span>🌶️ {item.spiceLevel}/5</span>}
                    {item.averageRating && (
                      <span className="flex items-center gap-1">
                        ⭐ {Number(item.averageRating).toFixed(1)} ({item.reviewCount})
                      </span>
                    )}
                  </div>

                  {/* Allergens Warning */}
                  {item.allergens && item.allergens.length > 0 && (
                    <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded mb-3">
                      <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-yellow-800">
                        Contains: {item.allergens.join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Inventory Check - Show if ingredients are low */}
                  {item.inventoryCheck && item.inventoryCheck.some(i => !i.sufficient) && (
                    <div className="p-2 bg-red-50 rounded mb-3">
                      <p className="text-xs text-red-800 font-medium">Low stock - limited availability</p>
                    </div>
                  )}

                  {/* View Details Button */}
                  <div className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                    <ShoppingCart size={18} />
                    View Details & Add
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
