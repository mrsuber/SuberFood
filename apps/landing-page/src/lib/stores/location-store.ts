// Zustand store for location state management

import { create } from 'zustand';
import type { LocationFilters, Restaurant } from '../types/restaurant';

interface LocationState {
  filters: LocationFilters;
  selectedLocation: Restaurant | null;
  setFilters: (filters: Partial<LocationFilters>) => void;
  resetFilters: () => void;
  setSelectedLocation: (location: Restaurant | null) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  filters: {},
  selectedLocation: null,

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  resetFilters: () => set({ filters: {} }),

  setSelectedLocation: (location) => set({ selectedLocation: location }),
}));
