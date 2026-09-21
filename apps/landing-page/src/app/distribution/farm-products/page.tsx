'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/navigation/Navbar'
import { Footer } from '@/components/navigation/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Leaf, ShoppingCart, Star, Package, Truck, Shield, Filter } from 'lucide-react'

interface FarmProduct {
  id: string
  sku: string
  slug: string
  name: string
  description: string | null
  category: string
  thumbnail: string | null
  priceType: string
  retailPrice: string | null
  retailUnit: string | null
  bulkPrice: string | null
  bulkUnit: string | null
  stockQuantity: string
  stockUnit: string
  farmSource: string | null
  isOrganic: boolean
  isCertified: boolean
  isFeatured: boolean
  status: string
  isAvailable: boolean
}

interface Category {
  value: string
  label: string
  count: number
}

export default function FarmProductsPage() {
  const [products, setProducts] = useState<FarmProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
    fetchProducts(selectedCategory)
  }, [selectedCategory])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/farm-products/categories')
      const data = await res.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProducts = async (category: string) => {
    setLoading(true)
    try {
      const url = category === 'all'
        ? '/api/farm-products'
        : `/api/farm-products?category=${category}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        setProducts(data.data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: string | null, unit: string | null) => {
    if (!price) return 'Price on request'
    return `${parseInt(price).toLocaleString()} XAF${unit ? `/${unit}` : ''}`
  }

  const getStockBadge = (quantity: string, status: string) => {
    const qty = parseFloat(quantity)
    if (status === 'OUT_OF_STOCK' || qty === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    }
    if (qty < 20) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low Stock</Badge>
    }
    return <Badge variant="secondary" className="bg-green-100 text-green-800">In Stock</Badge>
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero Section - Forest Green Theme */}
        <section className="relative bg-gradient-to-br from-[#15803D] to-[#166534] text-white py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="h-8 w-8" />
                <span className="text-sm font-semibold tracking-wider uppercase">Fresh from the Farm</span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-display font-bold mb-6">
                Farm Fresh Products
              </h1>
              <p className="text-xl text-green-100 mb-8">
                Quality produce directly from local Cameroon farms.
                Fresh, traceable, and delivered to your doorstep.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <Shield className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">100% Traceable</div>
                    <div className="text-sm text-green-100">Farm to table</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <Truck className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">Fresh Delivery</div>
                    <div className="text-sm text-green-100">Same day available</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <Package className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">Bulk Options</div>
                    <div className="text-sm text-green-100">For businesses</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 border-b bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Filter className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Filter by Category</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className={selectedCategory === 'all' ? 'bg-[#15803D] hover:bg-[#166534]' : ''}
              >
                All Products
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className={selectedCategory === category.value ? 'bg-[#15803D] hover:bg-[#166534]' : ''}
                >
                  {category.label} ({category.count})
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                <p className="text-gray-500">Try selecting a different category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Link key={product.id} href={`/distribution/farm-products/${product.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                      {/* Product Image */}
                      <div className="relative h-48 bg-gradient-to-br from-green-50 to-green-100 rounded-t-lg overflow-hidden">
                        {product.thumbnail ? (
                          <Image
                            src={product.thumbnail}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Leaf className="h-16 w-16 text-green-300" />
                          </div>
                        )}
                        {product.isFeatured && (
                          <Badge className="absolute top-2 left-2 bg-[#15803D]">
                            Featured
                          </Badge>
                        )}
                        {product.isOrganic && (
                          <Badge className="absolute top-2 right-2 bg-green-600">
                            <Leaf className="h-3 w-3 mr-1" />
                            Organic
                          </Badge>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-[#15803D] transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-500">{product.category.replace(/_/g, ' ')}</p>
                          </div>
                          {getStockBadge(product.stockQuantity, product.status)}
                        </div>

                        {product.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {product.description}
                          </p>
                        )}

                        {product.farmSource && (
                          <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            {product.farmSource}
                          </p>
                        )}

                        <div className="border-t pt-3">
                          {product.priceType === 'BOTH' ? (
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600">Retail</span>
                                <span className="font-semibold text-[#15803D]">
                                  {formatPrice(product.retailPrice, product.retailUnit)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600">Bulk</span>
                                <span className="font-semibold text-[#15803D]">
                                  {formatPrice(product.bulkPrice, product.bulkUnit)}
                                </span>
                              </div>
                            </div>
                          ) : product.priceType === 'RETAIL_ONLY' ? (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Price</span>
                              <span className="font-semibold text-lg text-[#15803D]">
                                {formatPrice(product.retailPrice, product.retailUnit)}
                              </span>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Bulk Price</span>
                              <span className="font-semibold text-lg text-[#15803D]">
                                {formatPrice(product.bulkPrice, product.bulkUnit)}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="p-4 pt-0">
                        <Button
                          className="w-full bg-[#15803D] hover:bg-[#166534]"
                          disabled={!product.isAvailable}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {product.isAvailable ? 'View Details' : 'Out of Stock'}
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Why Buy From Us Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose SuberFood Farm Products?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We connect you directly with local Cameroon farmers for the freshest produce
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-[#15803D] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Full Traceability</h3>
                <p className="text-gray-600">
                  Know exactly where your food comes from with harvest dates, batch numbers, and farm sources
                </p>
              </div>
              <div className="text-center">
                <div className="bg-[#15803D] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Organic Options</h3>
                <p className="text-gray-600">
                  Certified organic products available for health-conscious consumers
                </p>
              </div>
              <div className="text-center">
                <div className="bg-[#15803D] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Flexible Purchasing</h3>
                <p className="text-gray-600">
                  Buy retail quantities for home or bulk for your business - we serve everyone
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
