'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCartSummary } from '@/store/cartStore';
import CartDrawer from './CartDrawer';

export default function CartButton() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { totalItems, totalPrice } = useCartSummary();

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all z-30 flex items-center gap-3"
      >
        <div className="relative">
          <ShoppingCart size={24} />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
        </div>
        {totalItems > 0 && (
          <div className="hidden sm:block">
            <p className="text-xs opacity-90">Cart</p>
            <p className="font-bold">${totalPrice.toFixed(2)}</p>
          </div>
        )}
      </button>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
