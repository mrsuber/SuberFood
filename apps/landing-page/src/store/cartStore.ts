import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItemCustomization {
  removedIngredients: string[]; // IDs of ingredients to remove
  specialInstructions?: string;
}

export interface CartItem {
  id: string; // Unique cart item ID (generated)
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  restaurantId: string;
  restaurantName: string;
  customization?: CartItemCustomization;
  // Display fields
  category?: string;
  preparationTime?: number | null;
}

interface CartStore {
  items: CartItem[];
  restaurantId: string | null; // Current cart is tied to one restaurant

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateCustomization: (itemId: string, customization: CartItemCustomization) => void;
  clearCart: () => void;
  clearRestaurantCart: (restaurantId: string) => void;

  // Computed
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemsByRestaurant: (restaurantId: string) => CartItem[];
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,

      addItem: (newItem) => {
        set((state) => {
          // Check if adding from different restaurant
          if (state.restaurantId && state.restaurantId !== newItem.restaurantId) {
            // Optionally clear cart or warn user
            // For now, we'll prevent adding items from different restaurants
            console.warn('Cannot add items from different restaurants to cart');
            return state;
          }

          // Check if item with same customization exists
          const existingItemIndex = state.items.findIndex(
            (item) =>
              item.menuItemId === newItem.menuItemId &&
              JSON.stringify(item.customization) === JSON.stringify(newItem.customization)
          );

          if (existingItemIndex !== -1) {
            // Update quantity of existing item
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += newItem.quantity;
            return {
              items: updatedItems,
              restaurantId: state.restaurantId || newItem.restaurantId,
            };
          }

          // Add new item
          return {
            items: [...state.items, { ...newItem, id: `${Date.now()}-${Math.random()}` }],
            restaurantId: state.restaurantId || newItem.restaurantId,
          };
        });
      },

      removeItem: (itemId) => {
        set((state) => {
          const updatedItems = state.items.filter((item) => item.id !== itemId);
          return {
            items: updatedItems,
            restaurantId: updatedItems.length > 0 ? state.restaurantId : null,
          };
        });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        }));
      },

      updateCustomization: (itemId, customization) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, customization } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], restaurantId: null });
      },

      clearRestaurantCart: (restaurantId) => {
        set((state) => {
          const updatedItems = state.items.filter(
            (item) => item.restaurantId !== restaurantId
          );
          return {
            items: updatedItems,
            restaurantId: updatedItems.length > 0 ? state.restaurantId : null,
          };
        });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getItemsByRestaurant: (restaurantId) => {
        return get().items.filter((item) => item.restaurantId === restaurantId);
      },
    }),
    {
      name: 'suberfood-cart', // localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Helper hook to check if cart has items from a different restaurant
export const useCartRestaurantCheck = (restaurantId: string) => {
  const cartRestaurantId = useCartStore((state) => state.restaurantId);
  const hasDifferentRestaurant = cartRestaurantId !== null && cartRestaurantId !== restaurantId;

  return {
    hasDifferentRestaurant,
    cartRestaurantId,
  };
};

// Helper hook for cart summary
export const useCartSummary = () => {
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const totalPrice = useCartStore((state) => state.getTotalPrice());

  return {
    items,
    totalItems,
    totalPrice,
    isEmpty: items.length === 0,
  };
};
