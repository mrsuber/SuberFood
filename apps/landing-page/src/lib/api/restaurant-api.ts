// API client for restaurant service

import axios from 'axios';
import type {
  MenuItem,
  MenuCategory,
  Restaurant,
  ApiResponse,
  MenuFilters,
  LocationFilters,
} from '../types/restaurant';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://suberfoods.com/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Menu API calls
export const menuApi = {
  getMenu: async (filters?: MenuFilters): Promise<ApiResponse<MenuItem>> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const { data } = await api.get<ApiResponse<MenuItem>>('/menu', { params });
    return data;
  },

  getMenuItem: async (id: string): Promise<MenuItem> => {
    const { data } = await api.get<{ success: boolean; data: MenuItem }>(`/menu/${id}`);
    return data.data;
  },

  getCategories: async (restaurantId?: string): Promise<ApiResponse<MenuCategory>> => {
    const params = new URLSearchParams();
    if (restaurantId) {
      params.append('restaurantId', restaurantId);
    }
    const { data } = await api.get<ApiResponse<MenuCategory>>('/menu/categories', { params });
    return data;
  },

  getFeaturedItems: async (): Promise<ApiResponse<MenuItem>> => {
    const { data } = await api.get<ApiResponse<MenuItem>>('/menu/featured');
    return data;
  },

  addToFavorites: async (menuItemId: string, userId: string): Promise<void> => {
    await api.post(`/menu/${menuItemId}/favorite`, { userId });
  },

  removeFromFavorites: async (menuItemId: string, userId: string): Promise<void> => {
    await api.delete(`/menu/${menuItemId}/favorite`, { data: { userId } });
  },
};

// Location API calls
export const locationApi = {
  getLocations: async (filters?: LocationFilters): Promise<ApiResponse<Restaurant>> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const { data } = await api.get<ApiResponse<Restaurant>>('/locations', { params });
    return data;
  },

  getLocation: async (identifier: string): Promise<Restaurant> => {
    const { data } = await api.get<{ success: boolean; data: Restaurant }>(`/locations/${identifier}`);
    return data.data;
  },

  getWaitTime: async (locationId: string): Promise<{ waitTime: number | null }> => {
    const { data } = await api.get<{ success: boolean; data: { waitTime: number | null } }>(
      `/locations/${locationId}/wait-time`
    );
    return data.data;
  },

  updateWaitTime: async (locationId: string, waitTime: number): Promise<void> => {
    await api.put(`/locations/${locationId}/wait-time`, { waitTime });
  },

  getLocationMenu: async (locationId: string): Promise<ApiResponse<MenuItem>> => {
    const { data } = await api.get<ApiResponse<MenuItem>>(`/locations/${locationId}/menu`);
    return data;
  },
};

export default api;
