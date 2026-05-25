'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Utensils, ShoppingBag, Truck, MapPin, Clock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

interface OrderTypeModalProps {
  open: boolean;
  onClose: () => void;
  menuItemId: string;
  menuItemName: string;
  restaurantId: string;
  restaurantName: string;
  price: number;
  quantity: number;
}

export function OrderTypeModal({
  open,
  onClose,
  menuItemId,
  menuItemName,
  restaurantId,
  restaurantName,
  price,
  quantity
}: OrderTypeModalProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<OrderType | null>(null);
  const [tableNumber, setTableNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const orderTypes = [
    {
      type: 'DINE_IN' as OrderType,
      icon: Utensils,
      title: 'Dine In',
      description: 'Order to your table at the restaurant',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      type: 'TAKEAWAY' as OrderType,
      icon: ShoppingBag,
      title: 'Takeaway',
      description: 'Pick up your order from the restaurant',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      type: 'DELIVERY' as OrderType,
      icon: Truck,
      title: 'Delivery',
      description: 'Get it delivered to your address',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  const handleSubmitOrder = async () => {
    if (!selectedType) return;

    setIsSubmitting(true);
    try {
      // TODO: Implement API call to create order
      const orderData = {
        menuItemId,
        quantity,
        type: selectedType,
        restaurantId,
        ...(selectedType === 'DINE_IN' && { tableNumber }),
        ...(selectedType === 'DELIVERY' && { deliveryAddress }),
        ...(selectedType === 'TAKEAWAY' && { pickupTime }),
        customerName,
        phoneNumber,
        total: price * quantity
      };

      console.log('Creating order:', orderData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to order confirmation or orders page
      router.push('/orders');
      onClose();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = () => {
    if (!selectedType || !customerName || !phoneNumber) return false;

    if (selectedType === 'DINE_IN' && !tableNumber) return false;
    if (selectedType === 'DELIVERY' && !deliveryAddress) return false;
    if (selectedType === 'TAKEAWAY' && !pickupTime) return false;

    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Order Type</DialogTitle>
          <DialogDescription>
            How would you like to enjoy {menuItemName} from {restaurantName}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {orderTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.type;

              return (
                <button
                  key={type.type}
                  onClick={() => setSelectedType(type.type)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full ${type.color} flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{type.title}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </button>
              );
            })}
          </div>

          {/* Customer Details */}
          {selectedType && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-gray-900">Customer Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">
                    <User className="w-4 h-4 inline mr-2" />
                    Your Name
                  </Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dine-in Specific Fields */}
          {selectedType === 'DINE_IN' && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-gray-900">Table Information</h3>
              <div>
                <Label htmlFor="tableNumber">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Table Number
                </Label>
                <Input
                  id="tableNumber"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g., 12"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter the table number where you're seated
                </p>
              </div>
            </div>
          )}

          {/* Takeaway Specific Fields */}
          {selectedType === 'TAKEAWAY' && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-gray-900">Pickup Details</h3>
              <div>
                <Label htmlFor="pickupTime">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Preferred Pickup Time
                </Label>
                <Input
                  id="pickupTime"
                  type="datetime-local"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="mt-1"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Your order will be ready at {restaurantName}
                </p>
              </div>
            </div>
          )}

          {/* Delivery Specific Fields */}
          {selectedType === 'DELIVERY' && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-gray-900">Delivery Address</h3>
              <div>
                <Label htmlFor="deliveryAddress">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Full Address
                </Label>
                <textarea
                  id="deliveryAddress"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Street address, city, postal code"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Delivery fee may apply based on distance
                </p>
              </div>
            </div>
          )}

          {/* Order Summary */}
          {selectedType && (
            <div className="border-t pt-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Item:</span>
                  <span className="font-medium text-gray-900">{menuItemName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium text-gray-900">{quantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Unit Price:</span>
                  <span className="font-medium text-gray-900">${price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-green-600">${(price * quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitOrder}
              className="flex-1"
              disabled={!canSubmit() || isSubmitting}
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
