import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export const dynamic = 'force-dynamic'

// POST /api/admin/farm-products/products/[id]/restock - Restock a product
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const {
      quantity,
      farmCostPerUnit,
      supplier,
      notes,
      restockedBy, // Admin user ID
    } = body

    // Validate required fields
    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Restock quantity must be greater than 0',
        },
        { status: 400 }
      )
    }

    // Get product with current stock info
    const product = await prisma.farmProduct.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        sku: true,
        stockQuantity: true,
        preOrderedQuantity: true,
        availableQuantity: true,
        stockUnit: true,
      },
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

    // Calculate restock distribution
    const restockQuantity = new Decimal(quantity)
    const currentPreOrdered = product.preOrderedQuantity
    const currentStock = product.stockQuantity

    // Pre-orders are fulfilled first from the restock
    const preOrdersFilled = Decimal.min(restockQuantity, currentPreOrdered)
    const remainingStock = restockQuantity.minus(preOrdersFilled)

    // Calculate new totals
    const newStockQuantity = currentStock.add(remainingStock)
    const newPreOrderedQuantity = currentPreOrdered.minus(preOrdersFilled)
    const newAvailableQuantity = newStockQuantity.minus(newPreOrderedQuantity)

    // Calculate costs
    const totalCost = farmCostPerUnit
      ? new Decimal(farmCostPerUnit).mul(restockQuantity)
      : null

    // Perform transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create restock record
      const restockRecord = await tx.stockRestock.create({
        data: {
          productId: id,
          quantity: restockQuantity,
          preOrdersFilled,
          remainingStock,
          farmCost: farmCostPerUnit ? new Decimal(farmCostPerUnit) : null,
          totalCost,
          supplier: supplier || null,
          restockedBy: restockedBy || null,
          notes: notes || null,
        },
      })

      // Update product stock levels
      const updatedProduct = await tx.farmProduct.update({
        where: { id },
        data: {
          stockQuantity: newStockQuantity,
          preOrderedQuantity: newPreOrderedQuantity,
          availableQuantity: newAvailableQuantity,
        },
      })

      // If pre-orders were fulfilled, update related orders to READY_FOR_PICKUP
      if (preOrdersFilled.greaterThan(0)) {
        // Get pending orders for this product, ordered by creation date (FIFO)
        const pendingOrders = await tx.farmOrder.findMany({
          where: {
            status: 'PENDING',
            items: {
              some: {
                productId: id,
              },
            },
          },
          include: {
            items: {
              where: {
                productId: id,
              },
            },
          },
          orderBy: {
            createdAt: 'asc', // First-in-first-out
          },
        })

        // Track how much of the restock has been allocated
        let allocatedQuantity = new Decimal(0)
        const ordersToUpdate: string[] = []

        // Allocate restock to orders FIFO until we run out
        for (const order of pendingOrders) {
          if (allocatedQuantity.greaterThanOrEqualTo(preOrdersFilled)) {
            break
          }

          const orderItemQuantity = order.items[0].quantity
          allocatedQuantity = allocatedQuantity.add(orderItemQuantity)
          ordersToUpdate.push(order.id)
        }

        // Update orders to READY_FOR_PICKUP
        if (ordersToUpdate.length > 0) {
          await tx.farmOrder.updateMany({
            where: {
              id: { in: ordersToUpdate },
            },
            data: {
              status: 'READY_FOR_PICKUP',
            },
          })

          // Create status history entries for each updated order
          for (const orderId of ordersToUpdate) {
            await tx.orderStatusHistory.create({
              data: {
                orderId,
                status: 'READY_FOR_PICKUP',
                note: `Stock restocked - order ready for pickup/delivery`,
              },
            })
          }
        }
      }

      return {
        restock: restockRecord,
        product: updatedProduct,
        ordersUpdated: preOrdersFilled.greaterThan(0) ? preOrdersFilled.toNumber() : 0,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Product restocked successfully',
      data: {
        ...result,
        summary: {
          restocked: restockQuantity.toNumber(),
          preOrdersFulfilled: preOrdersFilled.toNumber(),
          newStock: newStockQuantity.toNumber(),
          newPreOrdered: newPreOrderedQuantity.toNumber(),
          newAvailable: newAvailableQuantity.toNumber(),
          unit: product.stockUnit,
        },
      },
    })
  } catch (error: any) {
    console.error('Error restocking product:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to restock product',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// GET /api/admin/farm-products/products/[id]/restock - Get restock history for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify product exists
    const product = await prisma.farmProduct.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        sku: true,
      },
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

    // Get restock history
    const restockHistory = await prisma.stockRestock.findMany({
      where: { productId: id },
      orderBy: {
        restockedAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        product,
        history: restockHistory,
      },
    })
  } catch (error: any) {
    console.error('Error fetching restock history:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch restock history',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
