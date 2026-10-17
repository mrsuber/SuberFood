import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Clock, MapPin, User, Phone, Utensils, ShoppingBag, Truck, Store, FileText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarCheck, Package, ChevronRight } from 'lucide-react';

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
      },
      restaurant: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return orders;
}

async function getFarmOrders(userId: string) {
  return prisma.farmOrder.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 30,
    include: {
      items: { select: { id: true, productName: true, quantity: true, unit: true } },
      farmDelivery: { select: { trackingCode: true, status: true } },
    },
  });
}

async function getReservations(userId: string) {
  return prisma.reservation.findMany({
    where: { userId },
    orderBy: { reservationDate: 'desc' },
    take: 20,
    include: { restaurant: { select: { name: true, slug: true, city: true } } },
  });
}

const farmStatusStyles: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-orange-100 text-orange-800',
  READY_FOR_PICKUP: 'bg-green-100 text-green-800',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-gray-100 text-gray-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const reservationStatusStyles: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  SEATED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-red-100 text-red-800',
};

const humanize = (value: string) => value.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

function FarmOrdersSection({ orders }: { orders: Awaited<ReturnType<typeof getFarmOrders>> }) {
  if (orders.length === 0) return null;
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-green-600" /> Farm shop orders
      </h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {' · '}
                  {order.fulfillmentType === 'PICKUP' ? 'Pickup' : 'Delivery'}
                  {order.orderType === 'BOOKING' && ' · Pre-order'}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${farmStatusStyles[order.status] || 'bg-gray-100 text-gray-800'}`}>
                {humanize(order.status)}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              {order.items.map((i) => `${i.productName} × ${Number(i.quantity)} ${i.unit}`).join(', ')}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <span className="font-bold text-green-700">{Number(order.totalAmount).toLocaleString('fr-FR')} XAF</span>
              <div className="flex gap-3 text-sm font-medium">
                {order.farmDelivery?.trackingCode && (
                  <Link href={`/track/${order.farmDelivery.trackingCode}`} className="text-purple-700 hover:underline">
                    Track delivery
                  </Link>
                )}
                <Link
                  href={`/distribution/farm-products/order-confirmation?orderNumber=${order.orderNumber}`}
                  className="text-green-700 hover:underline inline-flex items-center"
                >
                  Details <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReservationsSection({ reservations }: { reservations: Awaited<ReturnType<typeof getReservations>> }) {
  if (reservations.length === 0) return null;
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <CalendarCheck className="w-5 h-5 text-amber-600" /> Table reservations
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {reservations.map((r) => (
          <div key={r.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="font-semibold text-gray-900">{r.restaurant.name}</p>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${reservationStatusStyles[r.status] || 'bg-gray-100 text-gray-800'}`}>
                {humanize(r.status)}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {new Date(r.reservationDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Africa/Douala' })}
              {' at '}
              {r.reservationTime} · {r.partySize} {r.partySize === 1 ? 'guest' : 'guests'}
            </p>
            <p className="text-sm text-gray-500">{r.restaurant.city}</p>
          </div>
        ))}
      </div>
    </section>
  );
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

  const [orders, farmOrders, reservations] = await Promise.all([
    getOrders(session.user.id),
    getFarmOrders(session.user.id),
    getReservations(session.user.id),
  ]);

  if (orders.length === 0 && farmOrders.length === 0 && reservations.length === 0) {
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
              <p className="text-gray-600 mb-6">Fresh produce from the farm shop, or a meal at one of our restaurants?</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/distribution/farm-products"
                  className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Shop the farm
                </Link>
                <Link
                  href="/distribution/restaurants"
                  className="inline-block border-2 border-green-600 text-green-700 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors"
                >
                  Browse restaurants
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

          <FarmOrdersSection orders={farmOrders} />
          <ReservationsSection reservations={reservations} />

          {orders.length > 0 && (
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-blue-600" /> Restaurant orders
            </h2>
          )}

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Order Header */}
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <OrderTypeIcon type={order.type} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/orders/${order.id}`} className="font-semibold text-gray-900 hover:text-green-700">
                        Order #{order.orderNumber}
                      </Link>
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
              <div className="space-y-4 mb-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                    {/* Meal Image */}
                    {item.menuItem?.image && (
                      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{item.menuItem?.name || 'Unknown Item'}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-gray-900">{item.price.toLocaleString('fr-FR')} XAF</p>
                      </div>

                      {/* Customizations from customerNotes */}
                      {order.customerNotes && (
                        <div className="mt-2 text-sm">
                          <div className="text-gray-700 whitespace-pre-line">
                            {order.customerNotes.split('\n').map((line, idx) => {
                              if (line.startsWith('No:')) {
                                const removedItems = line.replace('No:', '').trim();
                                return (
                                  <div key={idx} className="flex items-start gap-1 text-red-600 mb-1">
                                    <span className="font-medium">Removed:</span>
                                    <span className="line-through">{removedItems}</span>
                                  </div>
                                );
                              } else if (line.trim()) {
                                return (
                                  <div key={idx} className="flex items-start gap-1 text-gray-600 italic">
                                    <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <span>{line}</span>
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {order.restaurant && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 pb-2 border-b border-gray-200">
                    <Store className="w-4 h-4" />
                    <span>{order.restaurant.name}</span>
                  </div>
                )}

                {order.restaurant && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{order.restaurant.address}, {order.restaurant.city}, {order.restaurant.state}</span>
                  </div>
                )}

                {order.customerName && (
                  <div className="flex items-center gap-2 text-sm text-gray-700 pt-2">
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
                <span className="text-xl font-bold text-green-600">{order.total.toLocaleString('fr-FR')} XAF</span>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </>
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
