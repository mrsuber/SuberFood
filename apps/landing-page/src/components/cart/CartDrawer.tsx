'use client';

import { Fragment } from 'react';
import { X, ShoppingCart, Minus, Plus, Trash2, ChevronRight } from 'lucide-react';
import { useCartStore, useCartSummary } from '@/store/cartStore';
import { useRouter } from 'next/navigation';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { items, totalItems, totalPrice, isEmpty } = useCartSummary();
  const { updateQuantity, removeItem, clearCart } = useCartStore();

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart size={24} />
            <h2 className="text-xl font-bold">Your Cart</h2>
            {totalItems > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingCart size={64} className="mb-4" />
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm text-center mt-2">
                Add items from the menu to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Clear Cart Button */}
              <button
                onClick={clearCart}
                className="w-full text-sm text-red-600 hover:text-red-800 flex items-center justify-center gap-2 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition"
              >
                <Trash2 size={16} />
                Clear Cart
              </button>

              {/* Items */}
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border rounded-lg p-3 shadow-sm"
                >
                  <div className="flex gap-3">
                    {/* Image */}
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <ShoppingCart size={24} className="text-gray-400" />
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                      <p className="text-xs text-gray-500 truncate">
                        {item.restaurantName}
                      </p>
                      {item.category && (
                        <p className="text-xs text-gray-400">{item.category}</p>
                      )}

                      {/* Customization */}
                      {item.customization && (
                        <div className="mt-1 text-xs text-gray-600">
                          {item.customization.removedIngredients.length > 0 && (
                            <p className="text-red-600">
                              No: {item.customization.removedIngredients.join(', ')}
                            </p>
                          )}
                          {item.customization.specialInstructions && (
                            <p className="italic">
                              Note: {item.customization.specialInstructions}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Price & Quantity */}
                      <div className="flex items-center justify-between mt-2">
                        <p className="font-bold text-blue-600">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100 rounded transition"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100 rounded transition"
                          >
                            <Plus size={16} />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 hover:bg-red-100 text-red-600 rounded transition ml-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isEmpty && (
          <div className="border-t p-4 bg-gray-50">
            {/* Summary */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Items</span>
                <span className="font-medium">{totalItems}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-blue-600">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ChevronRight size={20} />
            </button>

            {/* Continue Shopping */}
            <button
              onClick={onClose}
              className="w-full mt-2 text-sm text-gray-600 hover:text-gray-800 py-2"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
