'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Leaf } from 'lucide-react'
import { formatXAF } from '@/lib/site'

interface Product {
  id: string
  slug: string
  name: string
  thumbnail: string | null
  retailPrice: string | null
  retailUnit: string | null
  bulkPrice: string | null
  bulkUnit: string | null
  isOrganic: boolean
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock'
  farmSource?: string | null
}

async function load(query: string): Promise<Product[]> {
  const res = await fetch(`/api/farm-products?${query}`)
  const data = await res.json()
  return data.success ? data.data : []
}

// Live strip of shop products for marketing pages. Renders nothing when the
// shop has no products (or the API is unreachable), so pages never look broken.
export function FeaturedProducts({ title = 'Fresh from our farms this week', limit = 4 }: { title?: string; limit?: number }) {
  const [products, setProducts] = useState<Product[] | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        let items = await load(`isFeatured=true&limit=${limit}`)
        if (items.length === 0) items = await load(`limit=${limit}`)
        if (!cancelled) setProducts(items)
      } catch {
        if (!cancelled) setProducts([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [limit])

  if (products === null) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="h-64 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (products.length === 0) return null

  return (
    <div>
      <div className="flex items-end justify-between mb-6 gap-4">
        <h3 className="text-2xl font-display font-bold text-gray-900">{title}</h3>
        <Link
          href="/distribution/farm-products"
          className="text-primary-700 font-semibold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all whitespace-nowrap"
        >
          Shop all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((p) => {
          const price = p.retailPrice
            ? `${formatXAF(p.retailPrice)}${p.retailUnit ? ` / ${p.retailUnit}` : ''}`
            : p.bulkPrice
            ? `${formatXAF(p.bulkPrice)}${p.bulkUnit ? ` / ${p.bulkUnit}` : ''}`
            : 'Price on request'
          return (
            <Link
              key={p.id}
              href={`/distribution/farm-products/${p.slug}`}
              className="group rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-premium transition-all"
            >
              <div className="relative aspect-[4/3] bg-primary-50">
                {p.thumbnail ? (
                  <Image
                    src={p.thumbnail}
                    alt={p.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-primary-300">
                    <Leaf className="w-10 h-10" />
                  </div>
                )}
                {p.isOrganic && (
                  <span className="absolute top-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-primary-700">
                    Organic
                  </span>
                )}
                {p.stockStatus === 'out_of_stock' && (
                  <span className="absolute top-2 right-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                    Pre-order
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="font-semibold text-gray-900 group-hover:text-primary-700 line-clamp-1">{p.name}</p>
                <p className="text-sm text-primary-700 font-medium mt-1">{price}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
