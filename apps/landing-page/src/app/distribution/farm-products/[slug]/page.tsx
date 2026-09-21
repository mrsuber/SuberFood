'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/navigation/Navbar'
import { Footer } from '@/components/navigation/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Leaf,
  ShoppingCart,
  Shield,
  Package,
  Calendar,
  MapPin,
  Award,
  Truck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Plus,
  Minus,
} from 'lucide-react'

interface ProductDetail {
  id: string
  name: string
  description: string | null
  category: string
  subcategory: string | null
  sku: string
  thumbnail: string | null
  images: string[]
  priceType: string
  retailPrice: string | null
  retailUnit: string | null
  retailMinQty: string | null
  bulkPrice: string | null
  bulkUnit: string | null
  bulkQtyPerUnit: string | null
  bulkMinOrder: number | null
  stockQuantity: string
  stockUnit: string
  lowStockThreshold: string | null
  farmSource: string | null
  harvestDate: string | null
  expiryDate: string | null
  batchNumber: string | null
  isOrganic: boolean
  isCertified: boolean
  isInSeason: boolean
  isFeatured: boolean
  weight: string | null
  weightUnit: string | null
  status: string
  isAvailable: boolean
  stockStatus: string
  averageRating: number
  reviewCount: number
}

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedPriceType, setSelectedPriceType] = useState<'retail' | 'bulk'>('retail')

  useEffect(() => {
    if (slug) {
      fetchProduct()
    }
  }, [slug])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/farm-products/${slug}`)
      const data = await res.json()
      if (data.success) {
        setProduct(data.data)
        // Set default price type based on availability
        if (data.data.priceType === 'BULK_ONLY') {
          setSelectedPriceType('bulk')
          setQuantity(data.data.bulkMinOrder || 1)
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: string | null) => {
    if (!price) return 'Price on request'
    return `${parseInt(price).toLocaleString()} XAF`
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStockMessage = () => {
    if (!product) return null
    const qty = parseFloat(product.stockQuantity)

    if (product.stockStatus === 'out_of_stock' || qty === 0) {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span className="font-semibold">Out of Stock</span>
        </div>
      )
    }
    if (product.stockStatus === 'low_stock') {
      return (
        <div className="flex items-center gap-2 text-yellow-600">
          <AlertCircle className="h-5 w-5" />
          <span className="font-semibold">Only {qty} {product.stockUnit} left!</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle2 className="h-5 w-5" />
        <span className="font-semibold">In Stock ({qty} {product.stockUnit} available)</span>
      </div>
    )
  }

  const getCurrentPrice = () => {
    if (!product) return '0'
    if (selectedPriceType === 'retail' && product.retailPrice) {
      return product.retailPrice
    }
    if (selectedPriceType === 'bulk' && product.bulkPrice) {
      return product.bulkPrice
    }
    return '0'
  }

  const getTotalPrice = () => {
    const price = parseInt(getCurrentPrice())
    return formatPrice((price * quantity).toString())
  }

  const handleQuantityChange = (delta: number) => {
    const minQty = selectedPriceType === 'retail'
      ? parseFloat(product?.retailMinQty || '1')
      : (product?.bulkMinOrder || 1)

    const newQty = Math.max(minQty, quantity + delta)
    setQuantity(newQty)
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#15803D]"></div>
        </div>
        <Footer />
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link href="/distribution/farm-products">
            <Button className="bg-[#15803D] hover:bg-[#166534]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href="/distribution/farm-products"
              className="text-[#15803D] hover:underline inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Farm Products
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Product Image */}
            <div>
              <div className="relative h-96 bg-gradient-to-br from-green-50 to-green-100 rounded-lg overflow-hidden mb-4">
                {product.thumbnail ? (
                  <Image
                    src={product.thumbnail}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Leaf className="h-32 w-32 text-green-300" />
                  </div>
                )}
              </div>
              {product.images && product.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img, idx) => (
                    <div key={idx} className="relative h-20 bg-gray-100 rounded overflow-hidden">
                      <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {product.isFeatured && (
                  <Badge className="bg-[#15803D]">Featured</Badge>
                )}
                {product.isOrganic && (
                  <Badge className="bg-green-600">
                    <Leaf className="h-3 w-3 mr-1" />
                    Organic
                  </Badge>
                )}
                {product.isCertified && (
                  <Badge variant="secondary">
                    <Award className="h-3 w-3 mr-1" />
                    Certified
                  </Badge>
                )}
                {product.isInSeason && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    In Season
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-lg text-gray-600 mb-1">{product.category.replace(/_/g, ' ')}</p>
              <p className="text-sm text-gray-500 mb-4">SKU: {product.sku}</p>

              {getStockMessage()}

              <Separator className="my-6" />

              {product.description && (
                <>
                  <p className="text-gray-700 mb-6">{product.description}</p>
                  <Separator className="my-6" />
                </>
              )}

              {/* Price Selection */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Select Purchase Option</h3>
                <div className="grid grid-cols-1 gap-3">
                  {(product.priceType === 'RETAIL_ONLY' || product.priceType === 'BOTH') && (
                    <Card
                      className={`cursor-pointer transition-all ${
                        selectedPriceType === 'retail'
                          ? 'ring-2 ring-[#15803D] bg-green-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setSelectedPriceType('retail')
                        setQuantity(parseFloat(product.retailMinQty || '1'))
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold">Retail Purchase</div>
                            <div className="text-sm text-gray-600">
                              Min: {product.retailMinQty} {product.retailUnit}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-[#15803D]">
                              {formatPrice(product.retailPrice)}
                            </div>
                            <div className="text-sm text-gray-600">per {product.retailUnit}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {(product.priceType === 'BULK_ONLY' || product.priceType === 'BOTH') && (
                    <Card
                      className={`cursor-pointer transition-all ${
                        selectedPriceType === 'bulk'
                          ? 'ring-2 ring-[#15803D] bg-green-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setSelectedPriceType('bulk')
                        setQuantity(product.bulkMinOrder || 1)
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold">Bulk Purchase</div>
                            <div className="text-sm text-gray-600">
                              {product.bulkQtyPerUnit} {product.stockUnit} per {product.bulkUnit} • Min: {product.bulkMinOrder} {product.bulkUnit}(s)
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-[#15803D]">
                              {formatPrice(product.bulkPrice)}
                            </div>
                            <div className="text-sm text-gray-600">per {product.bulkUnit}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={!product.isAvailable}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-6 py-2 font-semibold">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(1)}
                      disabled={!product.isAvailable}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-gray-600">
                    {selectedPriceType === 'retail' ? product.retailUnit : product.bulkUnit}
                  </span>
                </div>
              </div>

              {/* Total Price */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Price:</span>
                  <span className="text-3xl font-bold text-[#15803D]">{getTotalPrice()}</span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                className="w-full bg-[#15803D] hover:bg-[#166534] h-14 text-lg"
                disabled={!product.isAvailable}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.isAvailable ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>
          </div>

          {/* Traceability Information */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="h-6 w-6 text-[#15803D]" />
                <h2 className="text-2xl font-bold">Farm-to-Table Traceability</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {product.farmSource && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="h-5 w-5" />
                      <span className="font-semibold">Farm Source</span>
                    </div>
                    <p className="text-gray-900">{product.farmSource}</p>
                  </div>
                )}

                {product.harvestDate && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Calendar className="h-5 w-5" />
                      <span className="font-semibold">Harvest Date</span>
                    </div>
                    <p className="text-gray-900">{formatDate(product.harvestDate)}</p>
                  </div>
                )}

                {product.expiryDate && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Calendar className="h-5 w-5" />
                      <span className="font-semibold">Best Before</span>
                    </div>
                    <p className="text-gray-900">{formatDate(product.expiryDate)}</p>
                  </div>
                )}

                {product.batchNumber && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Package className="h-5 w-5" />
                      <span className="font-semibold">Batch Number</span>
                    </div>
                    <p className="text-gray-900 font-mono">{product.batchNumber}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-6 w-6 text-[#15803D]" />
                <h2 className="text-2xl font-bold">Delivery & Pickup</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Same-Day Delivery Available</h3>
                    <p className="text-sm text-gray-600">Order before 2 PM for same-day delivery in Yaoundé and Douala</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Free Pickup</h3>
                    <p className="text-sm text-gray-600">Pick up your order at our distribution center at no extra cost</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
