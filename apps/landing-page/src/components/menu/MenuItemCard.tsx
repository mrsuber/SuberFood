'use client';

import type { MenuItem } from '@/lib/types/restaurant';
import { useMenuStore } from '@/lib/stores/menu-store';
import { Heart, Star, Flame, Leaf, Award, Clock, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { isFavorite, toggleFavorite } = useMenuStore();
  const favorite = isFavorite(item.id);

  const displayPrice = item.salePrice || item.price;
  const hasDiscount = item.salePrice && item.salePrice < item.price;

  return (
    <Link href={`/distribution/restaurants/menu/${item.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {item.image || item.images?.[0] ? (
          <Image
            src={item.image || item.images![0]}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
            🍽️
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(item.id);
          }}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors z-10"
        >
          <Heart
            className={`w-5 h-5 ${favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
          />
        </button>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {item.isChefRecommended && (
            <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
              <Award className="w-3 h-3" />
              Chef's Pick
            </span>
          )}
          {item.isSeasonal && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
              Seasonal
            </span>
          )}
          {hasDiscount && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              Sale
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{item.name}</h3>

        {/* Location Badge (when viewing from all locations) */}
        {item.location && (
          <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md mb-2 w-fit">
            <MapPin className="w-3 h-3" />
            <span>{item.location.name}, {item.location.city}</span>
          </div>
        )}

        {item.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
        )}

        {/* Dietary Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {item.isVegan && (
            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded flex items-center gap-1">
              <Leaf className="w-3 h-3" />
              Vegan
            </span>
          )}
          {item.isVegetarian && !item.isVegan && (
            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded flex items-center gap-1">
              <Leaf className="w-3 h-3" />
              Vegetarian
            </span>
          )}
          {item.isGlutenFree && (
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
              Gluten-Free
            </span>
          )}
          {item.isKeto && (
            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">
              Keto
            </span>
          )}
          {item.spiceLevel !== null && item.spiceLevel > 2 && (
            <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Spicy {item.spiceLevel}/5
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-green-600">
                {displayPrice.toLocaleString('fr-FR')} XAF
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  {item.price.toLocaleString('fr-FR')} XAF
                </span>
              )}
            </div>

            {item.preparationTime && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Clock className="w-3 h-3" />
                {item.preparationTime} min
              </div>
            )}
          </div>

          {item.averageRating !== null && item.reviewCount > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold">{Number(item.averageRating).toFixed(1)}</span>
              <span className="text-xs text-gray-500">({item.reviewCount})</span>
            </div>
          )}
        </div>

        {/* Allergens */}
        {item.allergens && item.allergens.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <span className="font-medium">Allergens:</span> {item.allergens.join(', ')}
            </p>
          </div>
        )}
      </div>
      </div>
    </Link>
  );
}
