'use client';

import type { MenuCategory } from '@/lib/types/restaurant';

interface CategoryTabsProps {
  categories: MenuCategory[];
  loading: boolean;
  selectedCategory?: string;
  onSelectCategory: (categoryId?: string) => void;
}

export function CategoryTabs({
  categories,
  loading,
  selectedCategory,
  onSelectCategory,
}: CategoryTabsProps) {
  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-4">
      <button
        onClick={() => onSelectCategory(undefined)}
        className={`px-6 py-2 rounded-lg whitespace-nowrap transition-colors ${
          !selectedCategory
            ? 'bg-green-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        All Items
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`px-6 py-2 rounded-lg whitespace-nowrap transition-colors ${
            selectedCategory === category.id
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
