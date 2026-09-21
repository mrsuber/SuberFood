import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/farm-products/products/[id] - Get single product (admin)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const product = await prisma.farmProduct.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        orderItems: {
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                createdAt: true,
                status: true,
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

    // Calculate stats
    const totalOrders = product.orderItems.length
    const totalRevenue = product.orderItems.reduce(
      (sum, item) => sum + parseFloat(item.totalPrice.toString()),
      0
    )

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        stats: {
          totalOrders,
          totalRevenue,
          reviewCount: product.reviews.length,
          averageRating:
            product.reviews.length > 0
              ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
                product.reviews.length
              : 0,
        },
      },
    })
  } catch (error: any) {
    console.error('Error fetching product (admin):', error)
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

// PUT /api/admin/farm-products/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    // Check if product exists
    const existingProduct = await prisma.farmProduct.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}

    // Basic info
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.category !== undefined) updateData.category = body.category
    if (body.subcategory !== undefined) updateData.subcategory = body.subcategory

    // Images
    if (body.images !== undefined) updateData.images = body.images
    if (body.thumbnail !== undefined) updateData.thumbnail = body.thumbnail

    // Pricing
    if (body.priceType !== undefined) updateData.priceType = body.priceType
    if (body.retailPrice !== undefined)
      updateData.retailPrice = body.retailPrice ? parseFloat(body.retailPrice) : null
    if (body.retailUnit !== undefined) updateData.retailUnit = body.retailUnit
    if (body.retailMinQty !== undefined)
      updateData.retailMinQty = body.retailMinQty ? parseFloat(body.retailMinQty) : null
    if (body.bulkPrice !== undefined)
      updateData.bulkPrice = body.bulkPrice ? parseFloat(body.bulkPrice) : null
    if (body.bulkUnit !== undefined) updateData.bulkUnit = body.bulkUnit
    if (body.bulkQtyPerUnit !== undefined)
      updateData.bulkQtyPerUnit = body.bulkQtyPerUnit ? parseFloat(body.bulkQtyPerUnit) : null
    if (body.bulkMinOrder !== undefined)
      updateData.bulkMinOrder = body.bulkMinOrder ? parseInt(body.bulkMinOrder) : null

    // Inventory
    if (body.stockQuantity !== undefined)
      updateData.stockQuantity = parseFloat(body.stockQuantity)
    if (body.stockUnit !== undefined) updateData.stockUnit = body.stockUnit
    if (body.lowStockThreshold !== undefined)
      updateData.lowStockThreshold = body.lowStockThreshold ? parseFloat(body.lowStockThreshold) : null
    if (body.reorderPoint !== undefined)
      updateData.reorderPoint = body.reorderPoint ? parseFloat(body.reorderPoint) : null

    // Traceability
    if (body.farmSource !== undefined) updateData.farmSource = body.farmSource
    if (body.harvestDate !== undefined)
      updateData.harvestDate = body.harvestDate ? new Date(body.harvestDate) : null
    if (body.expiryDate !== undefined)
      updateData.expiryDate = body.expiryDate ? new Date(body.expiryDate) : null
    if (body.batchNumber !== undefined) updateData.batchNumber = body.batchNumber

    // Attributes
    if (body.isOrganic !== undefined) updateData.isOrganic = body.isOrganic
    if (body.isCertified !== undefined) updateData.isCertified = body.isCertified
    if (body.isInSeason !== undefined) updateData.isInSeason = body.isInSeason
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured

    // Measurements
    if (body.weight !== undefined)
      updateData.weight = body.weight ? parseFloat(body.weight) : null
    if (body.weightUnit !== undefined) updateData.weightUnit = body.weightUnit
    if (body.dimensions !== undefined) updateData.dimensions = body.dimensions

    // SEO
    if (body.metaTitle !== undefined) updateData.metaTitle = body.metaTitle
    if (body.metaDescription !== undefined) updateData.metaDescription = body.metaDescription
    if (body.keywords !== undefined) updateData.keywords = body.keywords

    // Status
    if (body.status !== undefined) updateData.status = body.status
    if (body.isAvailable !== undefined) updateData.isAvailable = body.isAvailable

    // Update product
    const updatedProduct = await prisma.farmProduct.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully',
    })
  } catch (error: any) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update product',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/farm-products/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if product exists
    const product = await prisma.farmProduct.findUnique({
      where: { id },
      include: {
        orderItems: true,
        cartItems: true,
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

    // Check if product has orders
    if (product.orderItems.length > 0) {
      // Don't delete, just mark as discontinued
      await prisma.farmProduct.update({
        where: { id },
        data: {
          status: 'DISCONTINUED',
          isAvailable: false,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Product marked as discontinued (has existing orders)',
      })
    }

    // Delete product
    await prisma.farmProduct.delete({
      where: { id },
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
        error: 'Failed to delete product',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
