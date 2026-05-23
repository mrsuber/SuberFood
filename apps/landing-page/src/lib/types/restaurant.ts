// Type definitions for restaurant API

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  salePrice: number | null;
  image: string | null;
  images: string[] | null;
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isKeto: boolean;
  isHalal: boolean;
  isKosher: boolean;
  calories: number | null;
  preparationTime: number | null;
  spiceLevel: number | null;
  allergens: string[] | null;
  ingredients: string | null;
  winePairing: string | null;
  isChefRecommended: boolean;
  isSeasonal: boolean;
  isPopular: boolean;
  averageRating: number | null;
  reviewCount: number;
  customizationOptions: any | null;
  createdAt: string;
  updatedAt: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string | null;
  displayOrder: number;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  type: 'FINE_DINING' | 'CAFETERIA' | 'FOOD_COURT';
  description: string | null;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  email: string;
  status: 'OPEN' | 'CLOSED' | 'TEMPORARILY_CLOSED';
  openingTime: string | null;
  closingTime: string | null;
  operatingDays: string | null;
  capacity: number;
  rating: number;
  latitude: number | null;
  longitude: number | null;
  images: string[] | null;
  amenities: string[] | null;
  parkingInfo: string | null;
  accessibilityFeatures: string[] | null;
  privateRooms: boolean;
  outdoorSeating: boolean;
  currentWaitTime: number | null;
  story: string | null;
  chefBios: any | null;
  awards: string[] | null;
  sustainabilityInfo: string | null;
  pressMedia: any | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  count: number;
  data: T[];
  message?: string;
}

export interface MenuFilters {
  categoryId?: string;
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  keto?: boolean;
  halal?: boolean;
  kosher?: boolean;
  excludeAllergens?: string[];
  maxSpiceLevel?: number;
  search?: string;
  sortBy?: 'name' | 'price-asc' | 'price-desc' | 'rating' | 'popular';
}

export interface LocationFilters {
  type?: 'FINE_DINING' | 'CAFETERIA' | 'FOOD_COURT';
  status?: 'OPEN' | 'CLOSED' | 'TEMPORARILY_CLOSED';
  city?: string;
  state?: string;
}
