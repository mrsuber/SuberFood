// Zustand store for menu state management

import { create } from 'zustand';
import type { MenuFilters } from '../types/restaurant';

interface MenuState {
  filters: MenuFilters;
  favoriteItems: Set<string>;
  setFilters: (filters: Partial<MenuFilters>) => void;
  resetFilters: () => void;
  toggleFavorite: (itemId: string) => void;
  isFavorite: (itemId: string) => boolean;
}

const initialFilters: MenuFilters = {
  sortBy: 'name',
};

export const useMenuStore = create<MenuState>((set, get) => ({
  filters: initialFilters,
  favoriteItems: new Set<string>(),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  resetFilters: () => set({ filters: initialFilters }),

  toggleFavorite: (itemId) =>
    set((state) => {
      const newFavorites = new Set(state.favoriteItems);
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId);
      } else {
        newFavorites.add(itemId);
      }
      return { favoriteItems: newFavorites };
    }),

  isFavorite: (itemId) => get().favoriteItems.has(itemId),
}));
