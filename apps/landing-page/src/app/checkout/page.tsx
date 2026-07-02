'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  User,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useCartStore, useCartSummary } from '@/store/cartStore';

type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
type PaymentMethod = 'ONLINE' | 'CASH';

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, totalPrice, isEmpty } = useCartSummary();
  const clearCart = useCartStore((state) => state.clearCart);

  // Form state
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guest checkout fields
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  // Dine-in fields
  const [tableNumber, setTableNumber] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(1);

  // Delivery fields
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryState, setDeliveryState] = useState('');
  const [deliveryPostalCode, setDeliveryPostalCode] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Pickup fields
  const [pickupTime, setPickupTime] = useState('');

  // General
  const [customerNotes, setCustomerNotes] = useState('');

  useEffect(() => {
    if (isEmpty) {
      router.push('/');
    }
  }, [isEmpty]);

  const isGuest = status === 'unauthenticated';
  const restaurantId = items[0]?.restaurantId;
  const restaurantName = items[0]?.restaurantName;

  const validateForm = (): boolean => {
    setError(null);

    // Guest checkout validation
    if (isGuest) {
      if (!guestName.trim()) {
        setError('Please enter your name');
        return false;
      }
      if (!guestPhone.trim()) {
        setError('Please enter your phone number');
        return false;
      }
      if (orderType !== 'DINE_IN') {
        setError('Guest checkout is only available for dine-in orders');
        return false;
      }
    }

    // Order type specific validation
    if (orderType === 'DINE_IN' && !tableNumber.trim()) {
      setError('Please enter your table number');
      return false;
    }

    if (orderType === 'DELIVERY') {
      if (!deliveryAddress.trim() || !deliveryCity.trim() || !deliveryState.trim() || !deliveryPostalCode.trim()) {
        setError('Please complete your delivery address');
        return false;
      }
    }

    if (orderType === 'TAKEAWAY' && !pickupTime) {
      setError('Please select a pickup time');
      return false;
    }

    return true;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      // Prepare order data
      const orderData: any = {
        restaurantId,
        type: orderType,
        paymentMethod: paymentMethod === 'CASH' ? 'CASH' : 'ONLINE',
        paymentStatus: paymentMethod === 'CASH' ? 'PENDING' : 'PAID',
        items: items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
          customizations: item.customization || null,
        })),
        customerNotes,
      };

      // Guest checkout data
      if (isGuest) {
        orderData.guestCheckout = {
          name: guestName,
          phone: guestPhone,
          email: guestEmail || null,
        };
      }

      // Order type specific data
      if (orderType === 'DINE_IN') {
        orderData.tableNumber = tableNumber;
        orderData.numberOfGuests = numberOfGuests;
      }

      if (orderType === 'DELIVERY') {
        orderData.deliveryAddress = {
          street: deliveryAddress,
          city: deliveryCity,
          state: deliveryState,
          postalCode: deliveryPostalCode,
        };
        orderData.deliveryInstructions = deliveryInstructions;
      }

      if (orderType === 'TAKEAWAY') {
        orderData.pickupTime = pickupTime;
      }

      // Submit order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const result = await response.json();

      // Clear cart
      clearCart();

      // Redirect to order confirmation
      router.push(`/orders/${result.order.id}?success=true`);

      // If guest, optionally prompt to create account
      if (isGuest) {
        setTimeout(() => {
          if (confirm('Order placed successfully! Would you like to create an account to track your orders?')) {
            router.push(`/auth/signup?email=${encodeURIComponent(guestEmail)}`);
          }
        }, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (isEmpty) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guest Info (if not logged in) */}
            {isGuest && (
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center gap-2 mb-4">
                  <User size={24} />
                  <h2 className="text-xl font-semibold">Your Information</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    <strong>Note:</strong> Guest checkout is only available for dine-in orders.
                    For delivery or pickup, please{' '}
                    <button
                      onClick={() => router.push('/auth/signin')}
                      className="underline font-medium"
                    >
                      sign in
                    </button>
                    .
                  </div>
                </div>
              </div>
            )}

            {/* Order Type */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Order Type</h2>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setOrderType('DINE_IN')}
                  disabled={isGuest && orderType !== 'DINE_IN'}
                  className={`p-4 border-2 rounded-lg text-center transition ${
                    orderType === 'DINE_IN'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  } ${isGuest && orderType !== 'DINE_IN' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-semibold">Dine-In</div>
                  <div className="text-xs text-gray-500 mt-1">Eat at restaurant</div>
                </button>
                <button
                  onClick={() => setOrderType('TAKEAWAY')}
                  disabled={isGuest}
                  className={`p-4 border-2 rounded-lg text-center transition ${
                    orderType === 'TAKEAWAY'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  } ${isGuest ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-semibold">Pickup</div>
                  <div className="text-xs text-gray-500 mt-1">Takeaway</div>
                </button>
                <button
                  onClick={() => setOrderType('DELIVERY')}
                  disabled={isGuest}
                  className={`p-4 border-2 rounded-lg text-center transition ${
                    orderType === 'DELIVERY'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  } ${isGuest ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-semibold">Delivery</div>
                  <div className="text-xs text-gray-500 mt-1">To your address</div>
                </button>
              </div>
            </div>

            {/* Dine-In Details */}
            {orderType === 'DINE_IN' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Dine-In Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Table Number *
                    </label>
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., A5, 12, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Guests
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={numberOfGuests}
                      onChange={(e) => setNumberOfGuests(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Details */}
            {orderType === 'DELIVERY' && !isGuest && (
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={24} />
                  <h2 className="text-xl font-semibold">Delivery Address</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123 Main St, Apt 4B"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={deliveryCity}
                        onChange={(e) => setDeliveryCity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        value={deliveryState}
                        onChange={(e) => setDeliveryState(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      value={deliveryPostalCode}
                      onChange={(e) => setDeliveryPostalCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Instructions (Optional)
                    </label>
                    <textarea
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Ring doorbell twice, leave at door, etc."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pickup Details */}
            {orderType === 'TAKEAWAY' && !isGuest && (
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={24} />
                  <h2 className="text-xl font-semibold">Pickup Time</h2>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Pickup Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={24} />
                <h2 className="text-xl font-semibold">Payment Method</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-4 border-2 rounded-lg text-center transition ${
                    paymentMethod === 'CASH'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="font-semibold">Pay at Cashier</div>
                  <div className="text-xs text-gray-500 mt-1">Cash or Card</div>
                </button>
                <button
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`p-4 border-2 rounded-lg text-center transition ${
                    paymentMethod === 'ONLINE'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="font-semibold">Pay Online</div>
                  <div className="text-xs text-gray-500 mt-1">Card or Digital</div>
                </button>
              </div>
              {paymentMethod === 'ONLINE' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  Online payment integration coming soon! Please select "Pay at Cashier" for now.
                </div>
              )}
            </div>

            {/* Additional Notes */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Additional Notes</h2>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any special requests or notes for the restaurant..."
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              {/* Restaurant */}
              <div className="mb-4 pb-4 border-b">
                <p className="text-sm text-gray-600">Restaurant</p>
                <p className="font-medium">{restaurantName}</p>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-4 pb-4 border-b">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                      {item.customization && item.customization.removedIngredients.length > 0 && (
                        <p className="text-xs text-red-600">
                          No: {item.customization.removedIngredients.join(', ')}
                        </p>
                      )}
                    </div>
                    <p className="font-medium">{(item.price * item.quantity).toLocaleString('fr-FR')} XAF</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{totalPrice.toLocaleString('fr-FR')} XAF</span>
                </div>
                {orderType === 'DELIVERY' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">5,000 XAF</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-blue-600">
                    {(totalPrice + (orderType === 'DELIVERY' ? 5000 : 0)).toLocaleString('fr-FR')} XAF
                  </span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Place Order Button */}
              <button
                onClick={handleSubmitOrder}
                disabled={submitting || paymentMethod === 'ONLINE'}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Place Order
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
