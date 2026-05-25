import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Clock, MapPin, User, Phone, Utensils, ShoppingBag, Truck } from 'lucide-react';

async function getOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: {
      userId,
      type: {
        in: ['DINE_IN', 'TAKEAWAY', 'DELIVERY']
      }
    },
    include: {
      items: {
        include: {
          menuItem: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return orders;
}

function OrderTypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'DINE_IN':
      return <Utensils className="w-5 h-5 text-blue-600" />;
    case 'TAKEAWAY':
      return <ShoppingBag className="w-5 h-5 text-green-600" />;
    case 'DELIVERY':
      return <Truck className="w-5 h-5 text-purple-600" />;
    default:
      return null;
  }
}

function OrderTypeBadge({ type }: { type: string }) {
  const styles = {
    DINE_IN: 'bg-blue-100 text-blue-800',
    TAKEAWAY: 'bg-green-100 text-green-800',
    DELIVERY: 'bg-purple-100 text-purple-800'
  };

  const labels = {
    DINE_IN: 'Dine In',
    TAKEAWAY: 'Takeaway',
    DELIVERY: 'Delivery'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[type as keyof typeof styles]}`}>
      {labels[type as keyof typeof labels]}
    </span>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const styles = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PREPARING: 'bg-orange-100 text-orange-800',
    READY: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
}

async function OrdersContent() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/auth/signin');
  }

  const orders = await getOrders(session.user.id);

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start ordering from your favorite restaurants!</p>
            <a
              href="/distribution/restaurants"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Browse Restaurants
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Order Header */}
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <OrderTypeIcon type={order.type} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</h3>
                      <OrderTypeBadge type={order.type} />
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              {/* Order Items */}
              <div className="space-y-3 mb-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.menuItem.name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">${item.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Order Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {order.customerName && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User className="w-4 h-4" />
                    <span>{order.customerName}</span>
                  </div>
                )}

                {order.phoneNumber && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone className="w-4 h-4" />
                    <span>{order.phoneNumber}</span>
                  </div>
                )}

                {order.type === 'DINE_IN' && order.tableNumber && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4" />
                    <span>Table {order.tableNumber}</span>
                  </div>
                )}

                {order.type === 'TAKEAWAY' && order.pickupTime && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4" />
                    <span>Pickup: {new Date(order.pickupTime).toLocaleString()}</span>
                  </div>
                )}

                {order.type === 'DELIVERY' && order.deliveryAddress && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4" />
                    <span>{order.deliveryAddress}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="text-xl font-bold text-green-600">${order.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}
