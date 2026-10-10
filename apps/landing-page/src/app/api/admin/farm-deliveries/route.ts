import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/farm-deliveries
 * Get all farm deliveries with filtering
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const driverId = searchParams.get('driverId')
    const search = searchParams.get('search')

    // Build where clause
    const where: any = {}

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    if (driverId) {
      where.driverId = driverId
    }

    if (search) {
      where.OR = [
        { trackingCode: { contains: search, mode: 'insensitive' } },
        { order: { orderNumber: { contains: search, mode: 'insensitive' } } },
        { order: { guestName: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const deliveries = await prisma.farmDelivery.findMany({
      where,
      include: {
        order: {
          select: {
            orderNumber: true,
            guestName: true,
            guestPhone: true,
            totalAmount: true,
            status: true,
          },
        },
        driver: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        statusUpdates: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate statistics
    const stats = {
      total: deliveries.length,
      pending: deliveries.filter(d => d.status === 'PENDING').length,
      assigned: deliveries.filter(d => d.status === 'ASSIGNED').length,
      inTransit: deliveries.filter(d => d.status === 'IN_TRANSIT').length,
      delivered: deliveries.filter(d => d.status === 'DELIVERED').length,
      failed: deliveries.filter(d => d.status === 'FAILED').length,
      totalDeliveryFees: deliveries.reduce((sum, d) => sum + Number(d.deliveryFee), 0),
      averageRating: deliveries.filter(d => d.customerRating).length > 0
        ? deliveries.reduce((sum, d) => sum + (d.customerRating || 0), 0) / deliveries.filter(d => d.customerRating).length
        : null,
    }

    // Get available drivers
    const availableDrivers = await prisma.staff.findMany({
      where: {
        role: 'DELIVERY_DRIVER',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            name: true,
            phone: true,
          },
        },
        deliveriesCompleted: true,
        averageRating: true,
      },
      orderBy: {
        deliveriesCompleted: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      deliveries,
      stats,
      availableDrivers,
    })
  } catch (error) {
    console.error('[ADMIN FARM DELIVERIES] Error fetching deliveries:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch deliveries',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/farm-deliveries
 * Create a new delivery for an order
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const {
      orderId,
      driverId,
      pickupAddress,
      pickupLatitude,
      pickupLongitude,
      estimatedPickupTime,
      estimatedDeliveryTime,
      estimatedDistance,
      estimatedDuration,
      deliveryFee,
      driverEarnings,
    } = body

    // Validate order exists and has delivery details
    const order = await prisma.farmOrder.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.fulfillmentType !== 'DELIVERY') {
      return NextResponse.json(
        { success: false, message: 'Order is not a delivery order' },
        { status: 400 }
      )
    }

    if (!order.deliveryAddress || !order.deliveryLatitude || !order.deliveryLongitude) {
      return NextResponse.json(
        { success: false, message: 'Order missing delivery location details' },
        { status: 400 }
      )
    }

    // Check if delivery already exists
    const existingDelivery = await prisma.farmDelivery.findUnique({
      where: { orderId },
    })

    if (existingDelivery) {
      return NextResponse.json(
        { success: false, message: 'Delivery already exists for this order' },
        { status: 400 }
      )
    }

    // Generate unique tracking code
    const trackingCode = `FD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create delivery
    const delivery = await prisma.farmDelivery.create({
      data: {
        orderId,
        driverId: driverId || null,
        status: driverId ? 'ASSIGNED' : 'PENDING',
        pickupAddress,
        pickupLatitude: pickupLatitude ? parseFloat(pickupLatitude) : null,
        pickupLongitude: pickupLongitude ? parseFloat(pickupLongitude) : null,
        deliveryAddress: order.deliveryAddress,
        deliveryLatitude: order.deliveryLatitude,
        deliveryLongitude: order.deliveryLongitude,
        deliveryInstructions: order.deliveryInstructions || null,
        estimatedPickupTime: estimatedPickupTime ? new Date(estimatedPickupTime) : null,
        estimatedDeliveryTime: estimatedDeliveryTime ? new Date(estimatedDeliveryTime) : null,
        estimatedDistance: estimatedDistance ? parseFloat(estimatedDistance) : null,
        estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : null,
        deliveryFee,
        driverEarnings: driverEarnings || null,
        trackingCode,
        publicTrackingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/track/${trackingCode}`,
        assignedAt: driverId ? new Date() : null,
      },
    })

    // Create initial status update
    await prisma.farmDeliveryStatusUpdate.create({
      data: {
        deliveryId: delivery.id,
        status: driverId ? 'ASSIGNED' : 'PENDING',
        note: driverId ? `Delivery assigned to driver` : 'Delivery created, awaiting driver assignment',
        updatedBy: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      delivery,
      message: 'Delivery created successfully',
    })
  } catch (error) {
    console.error('[ADMIN FARM DELIVERIES] Error creating delivery:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create delivery',
      },
      { status: 500 }
    )
  }
}
