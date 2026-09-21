import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/admin/farm-products/products/[id]/stock - Update stock quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    // Validate input
    if (body.stockQuantity === undefined || body.stockQuantity === null) {
      return NextResponse.json(
        {
          success: false,
          error: 'Stock quantity is required',
        },
        { status: 400 }
      )
    }

    const stockQuantity = parseFloat(body.stockQuantity)

    if (stockQuantity < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Stock quantity cannot be negative',
        },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await prisma.farmProduct.findUnique({
      where: { id },
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

    // Update stock
    const updatedProduct = await prisma.farmProduct.update({
      where: { id },
      data: {
        stockQuantity,
        // Auto-update availability based on stock
        isAvailable: stockQuantity > 0,
        status: stockQuantity > 0 ? 'ACTIVE' : 'OUT_OF_STOCK',
      },
    })

    // Check if stock is low
    const isLowStock =
      updatedProduct.lowStockThreshold &&
      stockQuantity <= updatedProduct.lowStockThreshold

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Stock updated successfully',
      alerts: isLowStock
        ? [`Low stock alert: Only ${stockQuantity} ${updatedProduct.stockUnit} remaining`]
        : [],
    })
  } catch (error: any) {
    console.error('Error updating stock:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update stock',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
