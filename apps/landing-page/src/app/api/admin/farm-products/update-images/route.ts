import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/admin/farm-products/update-images - Update product images
export async function POST() {
  try {
    const updates = [
      {
        slug: 'red-onions',
        thumbnail: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&q=80',
          'https://images.unsplash.com/photo-1587735243615-c03f25aaff56?w=800&q=80',
        ],
      },
      {
        slug: 'fresh-tilapia',
        thumbnail: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800&q=80',
          'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
        ],
      },
      {
        slug: 'fresh-eggs',
        thumbnail: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&q=80',
          'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=800&q=80',
        ],
      },
      {
        slug: 'fresh-ginger',
        thumbnail: 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=800&q=80',
          'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80',
        ],
      },
    ]

    const results = []
    const errors = []

    for (const update of updates) {
      try {
        const product = await prisma.farmProduct.update({
          where: { slug: update.slug },
          data: {
            thumbnail: update.thumbnail,
            images: update.images,
          },
        })
        results.push({ slug: update.slug, name: product.name, status: 'success' })
      } catch (error) {
        errors.push({
          slug: update.slug,
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'failed'
        })
      }
    }

    return NextResponse.json({
      success: results.length > 0,
      message: `Updated ${results.length} products, ${errors.length} errors`,
      data: { results, errors },
    })
  } catch (error) {
    console.error('Error updating product images:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update product images',
      },
      { status: 500 }
    )
  }
}
