import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/admin/farm-products/orders/by-product - Get orders grouped by product
export async function GET(req: NextRequest) {
  try {
    // Get filter parameters
    const { searchParams } = new URL(req.url)
    const fulfillmentType = searchParams.get('fulfillmentType') // 'DELIVERY', 'PICKUP', 'PREORDER'
    const status = searchParams.get('status') // 'PENDING', 'COMPLETED', etc.

    // Build where clause for filtering
    const where: any = {}

    if (fulfillmentType) {
      where.fulfillmentType = fulfillmentType.toUpperCase()
    }

    if (status) {
      where.status = status.toUpperCase()
    }

    // Fetch all orders with their items and product details
    const orders = await prisma.farmOrder.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                thumbnail: true,
                category: true,
              }
            }
          }
        }
      }
    })

    // Group by product and calculate statistics
    const productStatsMap = new Map<string, {
      productId: string
      productName: string
      productSku: string
      productImage: string
      category: string
      totalQuantity: number
      totalOrders: number
      totalRevenue: number
      pendingQuantity: number
      completedQuantity: number
      orderIds: Set<string>
    }>()

    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.productId

        if (!productStatsMap.has(productId)) {
          productStatsMap.set(productId, {
            productId: item.product.id,
            productName: item.product.name,
            productSku: item.product.sku,
            productImage: item.product.thumbnail || '',
            category: item.product.category,
            totalQuantity: 0,
            totalOrders: 0,
            totalRevenue: 0,
            pendingQuantity: 0,
            completedQuantity: 0,
            orderIds: new Set()
          })
        }

        const stats = productStatsMap.get(productId)!

        // Add quantity
        stats.totalQuantity += item.quantity

        // Track unique orders
        stats.orderIds.add(order.id)

        // Calculate revenue (quantity * unit price) - handle null unitPrice
        const unitPrice = item.unitPrice ? parseFloat(item.unitPrice.toString()) : 0
        stats.totalRevenue += item.quantity * unitPrice

        // Track pending vs completed quantities
        if (order.status === 'PENDING' || order.status === 'PROCESSING') {
          stats.pendingQuantity += item.quantity
        } else if (order.status === 'COMPLETED' || order.status === 'DELIVERED') {
          stats.completedQuantity += item.quantity
        }
      })
    })

    // Convert to array and add order counts
    const products = Array.from(productStatsMap.values()).map(stats => ({
      productId: stats.productId,
      productName: stats.productName,
      productSku: stats.productSku,
      productImage: stats.productImage,
      category: stats.category,
      totalQuantity: stats.totalQuantity,
      totalOrders: stats.orderIds.size,
      totalRevenue: stats.totalRevenue,
      pendingQuantity: stats.pendingQuantity,
      completedQuantity: stats.completedQuantity,
    }))

    // Sort by total quantity descending by default
    products.sort((a, b) => b.totalQuantity - a.totalQuantity)

    return NextResponse.json({
      success: true,
      products,
      summary: {
        totalProducts: products.length,
        totalQuantity: products.reduce((sum, p) => sum + p.totalQuantity, 0),
        totalRevenue: products.reduce((sum, p) => sum + p.totalRevenue, 0),
      }
    })
  } catch (error) {
    console.error('Error fetching product statistics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product statistics' },
      { status: 500 }
    )
  }
}
