// ENHANCED CHECKOUT FEATURES TO ADD
// Add these state variables and functions to the existing checkout page

// NEW: Wallet & Referral State
const [walletBalance, setWalletBalance] = useState(0)
const [useWallet, setUseWallet] = useState(false)
const [walletAmount, setWalletAmount] = useState(0)
const [referralCode, setReferralCode] = useState('')
const [referralValid, setReferralValid] = useState<boolean | null>(null)
const [referralMessage, setReferralMessage] = useState('')

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

// Validate referral code
const validateReferralCode = async () => {
  if (!referralCode.trim()) {
    setReferralValid(null)
    setReferralMessage('')
    return
  }

  try {
    const res = await fetch(`/api/referral/apply?code=${referralCode}`)
    const data = await res.json()

    if (data.valid) {
      setReferralValid(true)
      setReferralMessage(data.message)
    } else {
      setReferralValid(false)
      setReferralMessage(data.error || 'Invalid referral code')
    }
  } catch (error) {
    setReferralValid(false)
    setReferralMessage('Failed to validate code')
  }
}

// Calculate amounts
const balanceAfterWallet = finalTotal - walletAmount
const needsAdditionalPayment = balanceAfterWallet > 0

// NEW PAYMENT SECTION UI TO ADD:

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

{/* Payment Method - UPDATED */}
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
            <p className="font-semibold">Cash on {deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}</p>
            <p className="text-sm text-gray-600 mt-1">Pay when you receive</p>
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
            <p className="font-semibold">Online Payment</p>
            <p className="text-sm text-gray-600 mt-1">MTN/Orange Money, Card</p>
          </button>
        </div>
      </>
    ) : (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <p className="text-green-900 font-semibold">✓ Fully paid with wallet!</p>
        <p className="text-sm text-green-700 mt-1">No additional payment needed</p>
      </div>
    )}
  </CardContent>
</Card>

// UPDATED handleSubmit function:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!validateForm()) {
    return
  }

  setProcessing(true)

  try {
    // Prepare order data with wallet & referral info
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

    // Create order
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

    // Handle payment
    if (balanceAfterWallet === 0) {
      // Fully paid with wallet - redirect to confirmation
      router.push(`/distribution/farm-products/order-confirmation?orderId=${orderId}`)
    } else if (paymentMethod === 'online') {
      // Online payment for remaining balance
      const paymentResponse = await fetch('/api/farm-products/payment/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount: balanceAfterWallet, // Pay remaining amount
          customerEmail: contactInfo.email || undefined,
          customerPhone: contactInfo.phone,
          customerName: contactInfo.fullName,
        }),
      })

      const paymentResult = await paymentResponse.json()

      if (!paymentResult.success) {
        throw new Error(paymentResult.message || 'Failed to initialize payment')
      }

      if (paymentResult.data.paymentUrl) {
        window.location.href = paymentResult.data.paymentUrl
      } else {
        throw new Error('Payment URL not provided')
      }
    } else {
      // Cash payment - redirect to confirmation
      router.push(`/distribution/farm-products/order-confirmation?orderId=${orderId}`)
    }
  } catch (error) {
    console.error('Checkout error:', error)
    alert(error instanceof Error ? error.message : 'An error occurred during checkout')
    setProcessing(false)
  }
}

// UPDATED Order Summary to show wallet payment:
<div className="space-y-2 text-sm">
  <div className="flex justify-between">
    <span className="text-gray-600">Subtotal:</span>
    <span>{formatPrice(totalAmount)}</span>
  </div>
  <div className="flex justify-between">
    <span className="text-gray-600">Delivery Fee:</span>
    <span>{formatPrice(deliveryFee)}</span>
  </div>
  <Separator />
  <div className="flex justify-between font-semibold">
    <span>Total:</span>
    <span>{formatPrice(finalTotal)}</span>
  </div>

  {/* NEW: Wallet payment display */}
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

  {/* NEW: Referral code display */}
  {referralValid === true && (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 mt-2">
      <p className="text-xs text-purple-800">
        ✓ Referral code applied: <strong>{referralCode}</strong>
      </p>
    </div>
  )}
</div>
