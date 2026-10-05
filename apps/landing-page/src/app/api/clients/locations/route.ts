import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/clients/locations
 * Exposes client location data for Mission Control integration
 * Returns all orders with GPS coordinates for map visualization
 */
export async function GET(req: NextRequest) {
  try {
    // Fetch all farm orders with GPS coordinates
    const orders = await prisma.farmOrder.findMany({
      where: {
        OR: [
          { deliveryLatitude: { not: null } },
          { deliveryLongitude: { not: null } },
        ],
      },
      select: {
        id: true,
        orderNumber: true,
        guestName: true,
        guestPhone: true,
        guestEmail: true,
        deliveryAddress: true,
        deliveryCity: true,
        deliveryState: true,
        deliveryLatitude: true,
        deliveryLongitude: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        items: {
          select: {
            productName: true,
            quantity: true,
            unit: true,
            totalPrice: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform data for Mission Control
    const clientLocations = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      // Client Info (prefer user data over guest data)
      clientName: order.user
        ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim()
        : order.guestName,
      clientPhone: order.user?.phone || order.guestPhone,
      clientEmail: order.user?.email || order.guestEmail,
      // Location
      address: order.deliveryAddress,
      city: order.deliveryCity,
      state: order.deliveryState,
      latitude: order.deliveryLatitude,
      longitude: order.deliveryLongitude,
      // Order Details
      orderStatus: order.status,
      totalAmount: Number(order.totalAmount),
      orderDate: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        name: item.productName,
        quantity: Number(item.quantity),
        unit: item.unit,
        totalPrice: Number(item.totalPrice),
      })),
      // Metadata
      source: 'SuberFood',
      category: 'farm-products',
    }))

    // Filter out any records that don't have valid coordinates
    const validLocations = clientLocations.filter(
      (loc) => loc.latitude !== null && loc.longitude !== null
    )

    return NextResponse.json({
      success: true,
      data: validLocations,
      total: validLocations.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching client locations:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch client locations',
      },
      { status: 500 }
    )
  }
}
