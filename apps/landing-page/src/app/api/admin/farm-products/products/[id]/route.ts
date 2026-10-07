import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export const dynamic = 'force-dynamic'

// Helper function to generate slug from product name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// GET /api/admin/farm-products/products/[id] - Get single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.farmProduct.findUnique({
      where: { id: params.id },
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

    return NextResponse.json({
      success: true,
      data: product,
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

// PUT /api/admin/farm-products/products/[id] - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check if product exists
    const existingProduct = await prisma.farmProduct.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: 'Product not found',
        },
        { status: 404 }
      )
    }

    // If name changed, regenerate slug
    let slug = body.slug || existingProduct.slug
    if (body.name && body.name !== existingProduct.name) {
      slug = generateSlug(body.name)

      // Ensure slug is unique (excluding current product)
      const slugExists = await prisma.farmProduct.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      })

      if (slugExists) {
        slug = `${slug}-${Date.now()}`
      }
    }

    // If SKU changed, ensure it's unique
    if (body.sku && body.sku !== existingProduct.sku) {
      const skuExists = await prisma.farmProduct.findFirst({
        where: {
          sku: body.sku,
          id: { not: id },
        },
      })

      if (skuExists) {
        return NextResponse.json(
          {
            success: false,
            message: 'SKU already exists',
          },
          { status: 400 }
        )
      }
    }

    // Validate pricing: farm cost should be <= selling price
    if (body.farmCostRetail && body.retailPrice) {
      if (parseFloat(body.farmCostRetail) > parseFloat(body.retailPrice)) {
        return NextResponse.json(
          {
            success: false,
            message: 'Farm cost (retail) cannot be greater than selling price (retail)',
          },
          { status: 400 }
        )
      }
    }

    if (body.farmCostBulk && body.bulkPrice) {
      if (parseFloat(body.farmCostBulk) > parseFloat(body.bulkPrice)) {
        return NextResponse.json(
          {
            success: false,
            message: 'Farm cost (bulk) cannot be greater than selling price (bulk)',
          },
          { status: 400 }
        )
      }
    }

    // Calculate available quantity if stock changed
    const stockQuantity = body.stockQuantity !== undefined
      ? parseFloat(body.stockQuantity)
      : parseFloat(existingProduct.stockQuantity.toString())

    const preOrderedQuantity = parseFloat(existingProduct.preOrderedQuantity.toString())
    const availableQuantity = stockQuantity - preOrderedQuantity

    // Update product
    const product = await prisma.farmProduct.update({
      where: { id },
      data: {
        // Basic info
        ...(body.sku && { sku: body.sku }),
        slug,
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description || null }),
        ...(body.category && { category: body.category }),
        ...(body.subcategory !== undefined && { subcategory: body.subcategory || null }),

        // Images
        ...(body.images !== undefined && { images: body.images || [] }),
        ...(body.thumbnail !== undefined && { thumbnail: body.thumbnail || null }),

        // Pricing
        ...(body.priceType && { priceType: body.priceType }),
        ...(body.farmCostRetail !== undefined && {
          farmCostRetail: body.farmCostRetail ? new Decimal(body.farmCostRetail) : null
        }),
        ...(body.farmCostBulk !== undefined && {
          farmCostBulk: body.farmCostBulk ? new Decimal(body.farmCostBulk) : null
        }),
        ...(body.retailPrice !== undefined && {
          retailPrice: body.retailPrice ? new Decimal(body.retailPrice) : null
        }),
        ...(body.retailUnit !== undefined && { retailUnit: body.retailUnit || null }),
        ...(body.retailMinQty !== undefined && {
          retailMinQty: body.retailMinQty ? new Decimal(body.retailMinQty) : null
        }),
        ...(body.bulkPrice !== undefined && {
          bulkPrice: body.bulkPrice ? new Decimal(body.bulkPrice) : null
        }),
        ...(body.bulkUnit !== undefined && { bulkUnit: body.bulkUnit || null }),
        ...(body.bulkQtyPerUnit !== undefined && {
          bulkQtyPerUnit: body.bulkQtyPerUnit ? new Decimal(body.bulkQtyPerUnit) : null
        }),
        ...(body.bulkMinOrder !== undefined && { bulkMinOrder: body.bulkMinOrder || null }),

        // Inventory
        ...(body.stockQuantity !== undefined && {
          stockQuantity: new Decimal(stockQuantity),
          availableQuantity: new Decimal(availableQuantity),
        }),
        ...(body.stockUnit && { stockUnit: body.stockUnit }),
        ...(body.lowStockThreshold !== undefined && {
          lowStockThreshold: body.lowStockThreshold ? new Decimal(body.lowStockThreshold) : null
        }),
        ...(body.reorderPoint !== undefined && {
          reorderPoint: body.reorderPoint ? new Decimal(body.reorderPoint) : null
        }),

        // Traceability
        ...(body.farmSource !== undefined && { farmSource: body.farmSource || null }),
        ...(body.harvestDate !== undefined && {
          harvestDate: body.harvestDate ? new Date(body.harvestDate) : null
        }),
        ...(body.expiryDate !== undefined && {
          expiryDate: body.expiryDate ? new Date(body.expiryDate) : null
        }),
        ...(body.batchNumber !== undefined && { batchNumber: body.batchNumber || null }),

        // Attributes
        ...(body.isOrganic !== undefined && { isOrganic: body.isOrganic }),
        ...(body.isCertified !== undefined && { isCertified: body.isCertified }),
        ...(body.isInSeason !== undefined && { isInSeason: body.isInSeason }),
        ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),

        // Measurements
        ...(body.weight !== undefined && {
          weight: body.weight ? new Decimal(body.weight) : null
        }),
        ...(body.weightUnit !== undefined && { weightUnit: body.weightUnit || null }),
        ...(body.dimensions !== undefined && { dimensions: body.dimensions || null }),

        // SEO
        ...(body.metaTitle !== undefined && { metaTitle: body.metaTitle || null }),
        ...(body.metaDescription !== undefined && { metaDescription: body.metaDescription || null }),
        ...(body.keywords !== undefined && { keywords: body.keywords || [] }),

        // Status
        ...(body.status && { status: body.status }),
        ...(body.isAvailable !== undefined && { isAvailable: body.isAvailable }),
      },
    })

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product updated successfully',
    })
  } catch (error: any) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update product',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/farm-products/products/[id] - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if product exists
    const product = await prisma.farmProduct.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: 'Product not found',
        },
        { status: 404 }
      )
    }

    // Delete the product
    await prisma.farmProduct.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete product',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
