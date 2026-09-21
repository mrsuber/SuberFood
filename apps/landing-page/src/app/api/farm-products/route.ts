import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/farm-products - List all farm products with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract query parameters
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const isOrganic = searchParams.get('isOrganic')
    const isFeatured = searchParams.get('isFeatured')
    const priceType = searchParams.get('priceType')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '24')

    // Build where clause
    const where: any = {}

    // Category filter
    if (category && category !== 'all') {
      where.category = category
    }

    // Search filter (name or description)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Status filter
    if (status) {
      where.status = status
    } else {
      // Default: only show active products
      where.status = 'ACTIVE'
      where.isAvailable = true
    }

    // Organic filter
    if (isOrganic === 'true') {
      where.isOrganic = true
    }

    // Featured filter
    if (isFeatured === 'true') {
      where.isFeatured = true
    }

    // Price type filter
    if (priceType && priceType !== 'all') {
      where.priceType = priceType
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build orderBy
    const orderBy: any = {}
    if (sortBy === 'price') {
      orderBy.retailPrice = sortOrder
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    // Fetch products
    const [products, totalCount] = await Promise.all([
      prisma.farmProduct.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          sku: true,
          slug: true,
          name: true,
          description: true,
          category: true,
          subcategory: true,
          thumbnail: true,
          images: true,
          priceType: true,
          retailPrice: true,
          retailUnit: true,
          retailMinQty: true,
          bulkPrice: true,
          bulkUnit: true,
          bulkQtyPerUnit: true,
          bulkMinOrder: true,
          stockQuantity: true,
          stockUnit: true,
          isOrganic: true,
          isCertified: true,
          isInSeason: true,
          isFeatured: true,
          status: true,
          isAvailable: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.farmProduct.count({ where }),
    ])

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    })
  } catch (error: any) {
    console.error('Error fetching farm products:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
