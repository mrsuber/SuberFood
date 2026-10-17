import Link from 'next/link'
import Image from 'next/image'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { CheckCircle, ChevronLeft, Clock, MapPin, Phone, Store, Utensils, ShoppingBag, Truck } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CancelOrderButton } from './CancelOrderButton'

export const dynamic = 'force-dynamic'

const typeMeta: Record<string, { label: string; icon: typeof Utensils }> = {
  DINE_IN: { label: 'Dine in', icon: Utensils },
  TAKEAWAY: { label: 'Takeaway', icon: ShoppingBag },
  DELIVERY: { label: 'Delivery', icon: Truck },
}

// Progress steps for restaurant orders, by order type
const stepsFor = (type: string) =>
  type === 'DELIVERY'
    ? ['PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED']
    : ['PENDING', 'CONFIRMED', 'PROCESSING', 'DELIVERED']

const stepLabels: Record<string, string> = {
  PENDING: 'Received',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Preparing',
  OUT_FOR_DELIVERY: 'On the way',
  DELIVERED: 'Served / delivered',
}

const xaf = (n: number) => `${Math.round(n).toLocaleString('fr-FR')} XAF`

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { success?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(`/orders/${params.id}`)}`)
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: { include: { menuItem: { select: { name: true, image: true } } } },
      restaurant: { select: { name: true, address: true, city: true, phone: true } },
      preparation: { select: { status: true } },
    },
  })

  const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'
  if (!order || (order.userId !== session.user.id && !isAdmin)) notFound()

  const meta = typeMeta[order.type] || { label: order.type, icon: Store }
  const steps = stepsFor(order.type)
  const currentStep = steps.indexOf(order.status)
  const cancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED'
  const canCancel = order.status === 'PENDING' && (!order.preparation || order.preparation.status === 'PENDING')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link href="/orders" className="inline-flex items-center text-sm text-green-700 hover:underline mb-6">
          <ChevronLeft className="w-4 h-4" /> All orders
        </Link>

        {searchParams.success === 'true' && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-900">Order placed!</p>
              <p className="text-sm text-green-800">The kitchen has received your order. This page updates as it progresses.</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Order</p>
              <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(order.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Douala' })}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-800">
              <meta.icon className="w-4 h-4" /> {meta.label}
            </span>
          </div>

          {/* Progress */}
          <div className="mt-8">
            {cancelled ? (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                This order was {order.status === 'REFUNDED' ? 'refunded' : 'cancelled'}.
              </p>
            ) : (
              <ol className="flex items-center">
                {steps.map((step, i) => {
                  const done = currentStep >= i
                  return (
                    <li key={step} className="flex-1 flex flex-col items-center text-center relative">
                      {i > 0 && (
                        <span className={`absolute top-4 right-1/2 w-full h-1 -z-0 ${currentStep >= i ? 'bg-green-500' : 'bg-gray-200'}`} />
                      )}
                      <span
                        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          done ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className={`mt-2 text-xs ${done ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {stepLabels[step]}
                      </span>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Items</h2>
            <ul className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 py-3">
                  <div className="relative w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {item.menuItem?.image && (
                      <Image src={item.menuItem.image} alt={item.menuItem.name} fill sizes="56px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.menuItem?.name || 'Item'}</p>
                    <p className="text-sm text-gray-500">Qty {item.quantity}</p>
                  </div>
                  <p className="font-medium text-gray-900">{xaf(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
            {order.customerNotes && (
              <p className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-line">{order.customerNotes}</p>
            )}
            <dl className="mt-4 pt-4 border-t border-gray-100 space-y-1 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Subtotal</dt><dd>{xaf(order.subtotal)}</dd></div>
              {order.shippingFee > 0 && <div className="flex justify-between"><dt className="text-gray-500">Delivery</dt><dd>{xaf(order.shippingFee)}</dd></div>}
              {order.discount > 0 && <div className="flex justify-between"><dt className="text-gray-500">Discount</dt><dd>−{xaf(order.discount)}</dd></div>}
              <div className="flex justify-between text-base font-bold pt-2"><dt>Total</dt><dd className="text-green-700">{xaf(order.total)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Payment</dt><dd>{order.paymentStatus.toLowerCase()}</dd></div>
            </dl>
          </div>

          <div className="space-y-6">
            {order.restaurant && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3 text-sm">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Store className="w-4 h-4" /> {order.restaurant.name}</h2>
                <p className="flex gap-2 text-gray-600"><MapPin className="w-4 h-4 flex-shrink-0" /> {order.restaurant.address}, {order.restaurant.city}</p>
                {order.restaurant.phone && (
                  <a href={`tel:${order.restaurant.phone.replace(/\s/g, '')}`} className="flex gap-2 text-green-700 hover:underline">
                    <Phone className="w-4 h-4" /> {order.restaurant.phone}
                  </a>
                )}
              </div>
            )}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-2 text-sm text-gray-700">
              {order.type === 'DINE_IN' && order.tableNumber && <p>Table {order.tableNumber}</p>}
              {order.type === 'TAKEAWAY' && order.pickupTime && (
                <p className="flex gap-2"><Clock className="w-4 h-4" /> Pickup {new Date(order.pickupTime).toLocaleString('en-GB', { timeStyle: 'short', dateStyle: 'medium', timeZone: 'Africa/Douala' })}</p>
              )}
              {order.type === 'DELIVERY' && order.deliveryAddress && (
                <p className="flex gap-2"><MapPin className="w-4 h-4 flex-shrink-0" /> {order.deliveryAddress}</p>
              )}
              {canCancel && <div className="pt-2"><CancelOrderButton orderId={order.id} /></div>}
              <p className="pt-2 text-gray-500">
                Need help? <Link href="/contact" className="text-green-700 hover:underline">Contact us</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
