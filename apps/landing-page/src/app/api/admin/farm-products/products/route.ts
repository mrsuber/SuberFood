import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Helper function to generate slug from product name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Helper function to generate SKU
function generateSKU(category: string, name: string): string {
  const categoryPrefix = category.substring(0, 3).toUpperCase()
  const namePrefix = name.substring(0, 3).toUpperCase()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `FP-${categoryPrefix}-${namePrefix}-${random}`
}

// GET /api/admin/farm-products/products - List all products (admin view)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract query parameters
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause
    const where: any = {}

    if (category && category !== 'all') {
      where.category = category
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const skip = (page - 1) * limit

    // Build orderBy
    const orderBy: any = {}
    if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else if (sortBy === 'stock') {
      orderBy.stockQuantity = sortOrder
    } else if (sortBy === 'price') {
      orderBy.retailPrice = sortOrder
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
      }),
      prisma.farmProduct.count({ where }),
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    })
  } catch (error: any) {
    console.error('Error fetching products (admin):', error)
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

// POST /api/admin/farm-products/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Generate SKU if not provided
    if (!body.sku) {
      body.sku = generateSKU(body.category, body.name)
    }

    // Generate slug if not provided
    if (!body.slug) {
      body.slug = generateSlug(body.name)
    }

    // Ensure slug is unique
    const existingProduct = await prisma.farmProduct.findUnique({
      where: { slug: body.slug },
    })

    if (existingProduct) {
      // Append timestamp to make unique
      body.slug = `${body.slug}-${Date.now()}`
    }

    // Create product
    const product = await prisma.farmProduct.create({
      data: {
        // Basic info
        sku: body.sku,
        slug: body.slug,
        name: body.name,
        description: body.description || null,
        category: body.category,
        subcategory: body.subcategory || null,

        // Images
        images: body.images || [],
        thumbnail: body.thumbnail || null,

        // Pricing
        priceType: body.priceType || 'RETAIL_ONLY',
        retailPrice: body.retailPrice ? parseFloat(body.retailPrice) : null,
        retailUnit: body.retailUnit || null,
        retailMinQty: body.retailMinQty ? parseFloat(body.retailMinQty) : null,
        bulkPrice: body.bulkPrice ? parseFloat(body.bulkPrice) : null,
        bulkUnit: body.bulkUnit || null,
        bulkQtyPerUnit: body.bulkQtyPerUnit ? parseFloat(body.bulkQtyPerUnit) : null,
        bulkMinOrder: body.bulkMinOrder ? parseInt(body.bulkMinOrder) : null,

        // Inventory
        stockQuantity: body.stockQuantity ? parseFloat(body.stockQuantity) : 0,
        stockUnit: body.stockUnit || 'kg',
        lowStockThreshold: body.lowStockThreshold ? parseFloat(body.lowStockThreshold) : null,
        reorderPoint: body.reorderPoint ? parseFloat(body.reorderPoint) : null,

        // Traceability
        farmSource: body.farmSource || null,
        harvestDate: body.harvestDate ? new Date(body.harvestDate) : null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        batchNumber: body.batchNumber || null,

        // Attributes
        isOrganic: body.isOrganic || false,
        isCertified: body.isCertified || false,
        isInSeason: body.isInSeason !== undefined ? body.isInSeason : true,
        isFeatured: body.isFeatured || false,

        // Measurements
        weight: body.weight ? parseFloat(body.weight) : null,
        weightUnit: body.weightUnit || null,
        dimensions: body.dimensions || null,

        // SEO
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
        keywords: body.keywords || [],

        // Status
        status: body.status || 'ACTIVE',
        isAvailable: body.isAvailable !== undefined ? body.isAvailable : true,
      },
    })

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully',
    })
  } catch (error: any) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create product',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
