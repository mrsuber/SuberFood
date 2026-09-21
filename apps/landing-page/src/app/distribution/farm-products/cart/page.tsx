'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navigation/Navbar'
import { Footer } from '@/components/navigation/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useFarmCart } from '@/contexts/FarmCartContext'
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  Leaf,
  Package,
} from 'lucide-react'

export default function CartPage() {
  const router = useRouter()
  const { items, itemCount, totalAmount, updateQuantity, removeItem, clearCart } = useFarmCart()
  const [removing, setRemoving] = useState<string | null>(null)

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} XAF`
  }

  const handleUpdateQuantity = (productId: string, priceType: 'retail' | 'bulk', delta: number) => {
    const item = items.find((i) => i.productId === productId && i.priceType === priceType)
    if (item) {
      const newQuantity = item.quantity + delta
      if (newQuantity > 0) {
        updateQuantity(productId, priceType, newQuantity)
      }
    }
  }

  const handleRemoveItem = (productId: string, priceType: 'retail' | 'bulk') => {
    setRemoving(`${productId}-${priceType}`)
    setTimeout(() => {
      removeItem(productId, priceType)
      setRemoving(null)
    }, 300)
  }

  const handleCheckout = () => {
    router.push('/distribution/farm-products/checkout')
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <ShoppingCart className="h-24 w-24 text-gray-400 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
              <p className="text-gray-600 mb-8">
                Start adding fresh farm products to your cart!
              </p>
              <Link href="/distribution/farm-products">
                <Button className="bg-[#15803D] hover:bg-[#166534]">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/distribution/farm-products"
              className="text-[#15803D] hover:underline inline-flex items-center gap-2 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                  <ShoppingCart className="h-10 w-10 text-[#15803D]" />
                  Shopping Cart
                </h1>
                <p className="text-gray-600 mt-2">{itemCount} item(s) in your cart</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm('Are you sure you want to clear your cart?')) {
                    clearCart()
                  }
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const itemKey = `${item.productId}-${item.priceType}`
                const isRemoving = removing === itemKey

                return (
                  <Card
                    key={itemKey}
                    className={`transition-all duration-300 ${
                      isRemoving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        {/* Product Image */}
                        <div className="relative h-24 w-24 flex-shrink-0 bg-gradient-to-br from-green-50 to-green-100 rounded-lg overflow-hidden">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Leaf className="h-12 w-12 text-green-300" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                              <p className="text-sm text-gray-600">
                                {item.priceType === 'retail' ? 'Retail' : 'Bulk'} •{' '}
                                {formatPrice(item.price)}/{item.unit}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.productId, item.priceType)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <Separator className="my-3" />

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-600">Quantity:</span>
                              <div className="flex items-center border rounded-lg">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    handleUpdateQuantity(item.productId, item.priceType, -1)
                                  }
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="px-4 py-1 font-semibold min-w-[3rem] text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    handleUpdateQuantity(item.productId, item.priceType, 1)
                                  }
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <span className="text-sm text-gray-600">{item.unit}</span>
                            </div>

                            {/* Item Total */}
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Subtotal</p>
                              <p className="text-xl font-bold text-[#15803D]">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({itemCount} items)</span>
                      <span className="font-semibold">{formatPrice(totalAmount)}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-[#15803D]">{formatPrice(totalAmount)}</span>
                    </div>

                    <p className="text-sm text-gray-500">
                      Delivery fees will be calculated at checkout
                    </p>
                  </div>

                  <Button
                    className="w-full bg-[#15803D] hover:bg-[#166534] h-12 text-lg mb-4"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/distribution/farm-products')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Button>

                  <Separator className="my-6" />

                  {/* Benefits */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-sm">
                      <Package className="h-5 w-5 text-[#15803D] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">
                        Free pickup available or delivery at checkout
                      </span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <Leaf className="h-5 w-5 text-[#15803D] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">
                        100% fresh, traceable farm products
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
