import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/farm-products/[slug] - Get single product by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const product = await prisma.farmProduct.findUnique({
      where: { slug },
      include: {
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 }
      )
    }

    // Calculate average rating from reviews
    const averageRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          product.reviews.length
        : 0

    // Check stock status
    const stockStatus =
      product.stockQuantity <= 0
        ? 'out_of_stock'
        : product.lowStockThreshold &&
          product.stockQuantity <= product.lowStockThreshold
        ? 'low_stock'
        : 'in_stock'

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        averageRating: parseFloat(averageRating.toFixed(1)),
        reviewCount: product.reviews.length,
        stockStatus,
      },
    })
  } catch (error: any) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch product',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
