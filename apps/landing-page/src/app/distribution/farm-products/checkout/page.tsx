'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navigation/Navbar'
import { Footer } from '@/components/navigation/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useFarmCart } from '@/contexts/FarmCartContext'
import {
  ShoppingCart,
  Truck,
  Package,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  ArrowLeft,
  Lock,
  CreditCard,
  Wallet,
  Gift,
} from 'lucide-react'

type DeliveryMethod = 'delivery' | 'pickup'
type PaymentMethod = 'online' | 'cash'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, itemCount, totalAmount, clearCart } = useFarmCart()

  // Delivery Method
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery')

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')

  // Contact Information
  const [contactInfo, setContactInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
  })

  // Delivery Address
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    region: '',
    postalCode: '',
    additionalInfo: '',
  })

  // Validation & Processing
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState(false)

  // Wallet Payment
  const [walletBalance, setWalletBalance] = useState(0)
  const [useWallet, setUseWallet] = useState(false)
  const [walletAmount, setWalletAmount] = useState(0)

  // Referral Code
  const [referralCode, setReferralCode] = useState('')
  const [referralValid, setReferralValid] = useState<boolean | null>(null)
  const [referralMessage, setReferralMessage] = useState('')
  const [referralDiscount, setReferralDiscount] = useState(0)

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/distribution/farm-products')
    }
  }, [items.length, router])

  // Fetch wallet balance on mount
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await fetch('/api/wallet')
        const data = await res.json()
        if (data.success) {
          setWalletBalance(Number(data.wallet.balance))
        }
      } catch (error) {
        console.error('Failed to fetch wallet:', error)
      }
    }
    fetchWallet()
  }, [])

  // Calculate wallet amount to use
  useEffect(() => {
    if (useWallet) {
      // Use wallet to cover as much as possible
      const amountToCover = Math.min(walletBalance, finalTotal)
      setWalletAmount(amountToCover)
    } else {
      setWalletAmount(0)
    }
  }, [useWallet, walletBalance, finalTotal])

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} XAF`
  }

  // Delivery fee calculation (simplified - you can make this more complex)
  const deliveryFee = deliveryMethod === 'delivery' ? 2000 : 0

  // Apply referral discount if valid
  const subtotalAfterDiscount = totalAmount - referralDiscount
  const finalTotal = subtotalAfterDiscount + deliveryFee

  // Calculate amounts after wallet payment
  const balanceAfterWallet = finalTotal - walletAmount
  const needsAdditionalPayment = balanceAfterWallet > 0

  // Validate referral code and calculate discount
  const validateReferralCode = async () => {
    if (!referralCode.trim()) {
      setReferralValid(null)
      setReferralMessage('')
      setReferralDiscount(0)
      return
    }

    try {
      // First validate the code
      const res = await fetch(`/api/referral/apply?code=${referralCode}`)
      const data = await res.json()

      if (data.valid) {
        setReferralValid(true)
        setReferralMessage(data.message)

        // Calculate discount (5% of farm cost)
        // Fetch farm costs for all items in cart
        let totalFarmCost = 0
        for (const item of items) {
          try {
            const productRes = await fetch(`/api/admin/farm-products/products/${item.productId}`)
            const productData = await productRes.json()
            if (productData.success) {
              const product = productData.data
              const farmCost = item.priceType === 'retail'
                ? Number(product.farmCostRetail || 0)
                : Number(product.farmCostBulk || 0)
              totalFarmCost += farmCost * item.quantity
            }
          } catch (error) {
            console.error('Error fetching product farm cost:', error)
          }
        }

        // 5% discount on total farm cost
        const discount = totalFarmCost * 0.05
        setReferralDiscount(discount)
        setReferralMessage(`${data.message} - You'll save ${discount.toLocaleString()} XAF!`)
      } else {
        setReferralValid(false)
        setReferralMessage(data.error || 'Invalid referral code')
        setReferralDiscount(0)
      }
    } catch (error) {
      setReferralValid(false)
      setReferralMessage('Failed to validate code')
      setReferralDiscount(0)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validate contact info
    if (!contactInfo.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    if (!contactInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[0-9+\s()-]+$/.test(contactInfo.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    if (contactInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Validate delivery address if delivery method is selected
    if (deliveryMethod === 'delivery') {
      if (!deliveryAddress.street.trim()) {
        newErrors.street = 'Street address is required'
      }
      if (!deliveryAddress.city.trim()) {
        newErrors.city = 'City is required'
      }
      if (!deliveryAddress.region.trim()) {
        newErrors.region = 'Region is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setProcessing(true)

    try {
      // Prepare order data
      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          productSlug: item.productSlug,
          name: item.name,
          priceType: item.priceType,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit,
        })),
        deliveryMethod,
        contactInfo,
        deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : null,
        subtotal: totalAmount,
        deliveryFee,
        totalAmount: finalTotal,
        // NEW: Wallet payment info
        useWallet,
        walletAmount: useWallet ? walletAmount : 0,
        // NEW: Referral code
        referralCode: referralValid === true ? referralCode : null,
      }

      // Create order in database
      const response = await fetch('/api/farm-products/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to create order')
      }

      const orderId = result.data.id

      // Clear cart
      clearCart()

      // Handle payment based on wallet balance and selected method
      if (balanceAfterWallet === 0) {
        // Fully paid with wallet - redirect to confirmation
        router.push(`/distribution/farm-products/order-confirmation?orderId=${orderId}`)
      } else if (paymentMethod === 'online') {
        // Online payment for remaining balance (or full amount if no wallet)
        const paymentResponse = await fetch('/api/farm-products/payment/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            amount: balanceAfterWallet, // Pay remaining amount after wallet
            customerEmail: contactInfo.email || undefined,
            customerPhone: contactInfo.phone,
            customerName: contactInfo.fullName,
          }),
        })

        const paymentResult = await paymentResponse.json()

        if (!paymentResult.success) {
          throw new Error(paymentResult.message || 'Failed to initialize payment')
        }

        // Redirect to PayWithCamsol payment page
        if (paymentResult.data.paymentUrl) {
          window.location.href = paymentResult.data.paymentUrl
        } else {
          throw new Error('Payment URL not provided')
        }
      } else {
        // Cash payment - redirect to order confirmation
        router.push(`/distribution/farm-products/order-confirmation?orderId=${orderId}`)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert(error instanceof Error ? error.message : 'An error occurred during checkout')
      setProcessing(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="text-[#15803D] hover:underline inline-flex items-center gap-2 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </button>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <CreditCard className="h-10 w-10 text-[#15803D]" />
              Checkout
            </h1>
            <p className="text-gray-600 mt-2">Complete your order</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Delivery Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-[#15803D]" />
                      Delivery Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('delivery')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          deliveryMethod === 'delivery'
                            ? 'border-[#15803D] bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Truck className="h-8 w-8 mb-2 mx-auto text-[#15803D]" />
                        <p className="font-semibold">Delivery</p>
                        <p className="text-sm text-gray-600 mt-1">2,000 XAF</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('pickup')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          deliveryMethod === 'pickup'
                            ? 'border-[#15803D] bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Package className="h-8 w-8 mb-2 mx-auto text-[#15803D]" />
                        <p className="font-semibold">Pickup</p>
                        <p className="text-sm text-gray-600 mt-1">Free</p>
                      </button>
                    </div>
                    {deliveryMethod === 'pickup' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
                        <p className="font-semibold text-green-900 mb-1">Pickup Location:</p>
                        <p className="text-green-800">
                          SuberFood Distribution Center
                          <br />
                          Douala, Cameroon
                          <br />
                          Open: Mon-Sat, 8:00 AM - 6:00 PM
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-[#15803D]" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={contactInfo.fullName}
                        onChange={(e) =>
                          setContactInfo({ ...contactInfo, fullName: e.target.value })
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D] ${
                          errors.fullName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="John Doe"
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) =>
                          setContactInfo({ ...contactInfo, phone: e.target.value })
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D] ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="+237 6XX XXX XXX"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) =>
                          setContactInfo({ ...contactInfo, email: e.target.value })
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D] ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="john@example.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Wallet Payment Option */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-[#15803D]" />
                      Wallet Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-purple-900">Your Wallet Balance:</span>
                        <span className="text-2xl font-bold text-purple-600">
                          {walletBalance.toLocaleString()} XAF
                        </span>
                      </div>
                      {walletBalance > 0 && (
                        <div className="mt-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={useWallet}
                              onChange={(e) => setUseWallet(e.target.checked)}
                              className="w-4 h-4 text-[#15803D] focus:ring-[#15803D]"
                            />
                            <span className="text-sm font-medium text-purple-900">
                              Use wallet to pay (will use {Math.min(walletBalance, finalTotal).toLocaleString()} XAF)
                            </span>
                          </label>
                        </div>
                      )}
                      {walletBalance === 0 && (
                        <p className="text-sm text-purple-700 mt-2">
                          Your wallet is empty. <a href="/wallet" className="underline font-semibold">Add funds</a> to use wallet payment.
                        </p>
                      )}
                    </div>

                    {useWallet && walletAmount > 0 && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order Total:</span>
                          <span className="font-semibold">{finalTotal.toLocaleString()} XAF</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>Paid from Wallet:</span>
                          <span className="font-semibold">- {walletAmount.toLocaleString()} XAF</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Remaining Balance:</span>
                          <span>{balanceAfterWallet.toLocaleString()} XAF</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Referral Code */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="h-5 w-5 text-[#15803D]" />
                      Referral Code (Optional)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Have a referral code?
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={referralCode}
                            onChange={(e) => {
                              setReferralCode(e.target.value.toUpperCase())
                              setReferralValid(null)
                            }}
                            onBlur={validateReferralCode}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                            placeholder="ENTER CODE"
                            maxLength={10}
                          />
                          <Button
                            type="button"
                            onClick={validateReferralCode}
                            variant="outline"
                            disabled={!referralCode.trim()}
                          >
                            Validate
                          </Button>
                        </div>
                      </div>

                      {referralValid === true && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                          <p className="text-green-800">✓ {referralMessage}</p>
                        </div>
                      )}

                      {referralValid === false && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                          <p className="text-red-800">✗ {referralMessage}</p>
                        </div>
                      )}

                      <p className="text-xs text-gray-500">
                        By using a referral code, you'll help someone earn rewards on your purchase!
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Address */}
                {deliveryMethod === 'delivery' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-[#15803D]" />
                        Delivery Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          value={deliveryAddress.street}
                          onChange={(e) =>
                            setDeliveryAddress({ ...deliveryAddress, street: e.target.value })
                          }
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D] ${
                            errors.street ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="123 Main Street"
                        />
                        {errors.street && (
                          <p className="text-red-500 text-sm mt-1">{errors.street}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            value={deliveryAddress.city}
                            onChange={(e) =>
                              setDeliveryAddress({ ...deliveryAddress, city: e.target.value })
                            }
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D] ${
                              errors.city ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Douala"
                          />
                          {errors.city && (
                            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Region *
                          </label>
                          <input
                            type="text"
                            value={deliveryAddress.region}
                            onChange={(e) =>
                              setDeliveryAddress({ ...deliveryAddress, region: e.target.value })
                            }
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D] ${
                              errors.region ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Littoral"
                          />
                          {errors.region && (
                            <p className="text-red-500 text-sm mt-1">{errors.region}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code (Optional)
                        </label>
                        <input
                          type="text"
                          value={deliveryAddress.postalCode}
                          onChange={(e) =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              postalCode: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                          placeholder="00237"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Additional Information (Optional)
                        </label>
                        <textarea
                          value={deliveryAddress.additionalInfo}
                          onChange={(e) =>
                            setDeliveryAddress({
                              ...deliveryAddress,
                              additionalInfo: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                          rows={3}
                          placeholder="Apartment, suite, landmarks, delivery instructions..."
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-[#15803D]" />
                      Payment Method
                      {useWallet && walletAmount > 0 && balanceAfterWallet > 0 && (
                        <Badge variant="outline">Mixed Payment</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {needsAdditionalPayment ? (
                      <>
                        <p className="text-sm text-gray-600">
                          {useWallet && walletAmount > 0
                            ? `Select payment method for remaining ${balanceAfterWallet.toLocaleString()} XAF`
                            : 'Select how you want to pay'}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          paymentMethod === 'cash'
                            ? 'border-[#15803D] bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Package className="h-8 w-8 mb-2 mx-auto text-[#15803D]" />
                        <p className="font-semibold">
                          {deliveryMethod === 'delivery' ? 'Pay on Delivery' : 'Pay on Pickup'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Cash payment</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('online')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          paymentMethod === 'online'
                            ? 'border-[#15803D] bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <CreditCard className="h-8 w-8 mb-2 mx-auto text-[#15803D]" />
                        <p className="font-semibold">Pay Online</p>
                        <p className="text-sm text-gray-600 mt-1">Mobile Money / Card</p>
                      </button>
                    </div>
                    {paymentMethod === 'online' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm flex items-start gap-2">
                        <Lock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-blue-900 mb-1">Secure Online Payment</p>
                          <p className="text-blue-800">
                            You'll be redirected to PayWithCamsol to complete your payment securely using Mobile Money or Card.
                          </p>
                        </div>
                      </div>
                    )}
                      </>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <p className="text-green-900 font-semibold">✓ Fully paid with wallet!</p>
                        <p className="text-sm text-green-700 mt-1">No additional payment needed</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Items */}
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {items.map((item) => (
                        <div
                          key={`${item.productId}-${item.priceType}`}
                          className="flex justify-between text-sm"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-gray-600 text-xs">
                              {item.quantity} × {formatPrice(item.price)}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Calculations */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                        <span className="font-semibold">{formatPrice(totalAmount)}</span>
                      </div>

                      {/* Referral Discount */}
                      {referralValid === true && referralDiscount > 0 && (
                        <div className="flex justify-between text-sm text-purple-600">
                          <span className="flex items-center gap-1">
                            <Gift className="h-4 w-4" />
                            Referral Discount (5%)
                          </span>
                          <span className="font-semibold">- {formatPrice(referralDiscount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="font-semibold">
                          {deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-[#15803D]">{formatPrice(finalTotal)}</span>
                    </div>

                    {/* Show savings from referral */}
                    {referralValid === true && referralDiscount > 0 && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
                        <p className="text-xs text-purple-800 text-center">
                          🎉 You're saving {formatPrice(referralDiscount)} with referral code <strong>{referralCode}</strong>!
                        </p>
                      </div>
                    )}

                    {/* Wallet payment display */}
                    {useWallet && walletAmount > 0 && (
                      <>
                        <div className="flex justify-between text-purple-600">
                          <span>Paid from Wallet:</span>
                          <span className="font-semibold">- {formatPrice(walletAmount)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Amount Due:</span>
                          <span className="text-[#15803D]">{formatPrice(balanceAfterWallet)}</span>
                        </div>
                      </>
                    )}

                    {/* Referral code display */}
                    {referralValid === true && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 mt-2">
                        <p className="text-xs text-purple-800">
                          ✓ Referral code applied: <strong>{referralCode}</strong>
                        </p>
                      </div>
                    )}

                    {/* Payment Button */}
                    <Button
                      type="submit"
                      disabled={processing}
                      className="w-full bg-[#15803D] hover:bg-[#166534] h-12 text-lg"
                    >
                      {processing ? (
                        <>Processing...</>
                      ) : paymentMethod === 'online' ? (
                        <>
                          <Lock className="h-5 w-5 mr-2" />
                          Proceed to Payment
                        </>
                      ) : (
                        <>
                          <Package className="h-5 w-5 mr-2" />
                          Place Order
                        </>
                      )}
                    </Button>

                    {paymentMethod === 'online' && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                          <Lock className="h-3 w-3" />
                          Secure payment powered by PayWithCamsol
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
