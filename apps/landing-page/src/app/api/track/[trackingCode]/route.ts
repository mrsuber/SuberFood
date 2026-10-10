import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/track/[trackingCode]
 * Public endpoint for customers to track their delivery
 * No authentication required
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ trackingCode: string }> }
) {
  try {
    const { trackingCode } = await params

    const delivery = await prisma.farmDelivery.findUnique({
      where: { trackingCode },
      select: {
        id: true,
        status: true,
        estimatedDeliveryTime: true,
        actualDeliveryTime: true,
        deliveryAddress: true,
        deliveryInstructions: true,
        createdAt: true,
        assignedAt: true,

        // Hide exact coordinates for privacy
        // deliveryLatitude: true,
        // deliveryLongitude: true,

        driver: {
          select: {
            user: {
              select: {
                name: true,
                phone: true, // Show for customer contact
              },
            },
            averageRating: true,
          },
        },

        order: {
          select: {
            orderNumber: true,
            guestName: true,
            totalAmount: true,
            items: {
              select: {
                productName: true,
                quantity: true,
                unit: true,
                productImage: true,
              },
            },
          },
        },

        statusUpdates: {
          select: {
            status: true,
            note: true,
            createdAt: true,
            // Hide exact location for privacy, just show timestamp
          },
          orderBy: { createdAt: 'desc' },
        },

        // Get only recent location (not full history for privacy)
        locationUpdates: {
          select: {
            latitude: true,
            longitude: true,
            createdAt: true,
            speed: true,
            heading: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1, // Only most recent location
        },
      },
    })

    if (!delivery) {
      return NextResponse.json(
        { success: false, message: 'Delivery not found' },
        { status: 404 }
      )
    }

    // Calculate estimated arrival time
    let estimatedArrival = delivery.estimatedDeliveryTime

    // If in transit, calculate based on current position (simplified)
    if (delivery.status === 'IN_TRANSIT' && delivery.locationUpdates.length > 0) {
      // In a real implementation, you would calculate distance to destination
      // and estimate time based on current speed
      // For now, just use the estimated delivery time
    }

    return NextResponse.json({
      success: true,
      tracking: {
        orderNumber: delivery.order.orderNumber,
        customerName: delivery.order.guestName,
        status: delivery.status,
        estimatedArrival,
        actualDeliveryTime: delivery.actualDeliveryTime,
        deliveryAddress: delivery.deliveryAddress,
        deliveryInstructions: delivery.deliveryInstructions,

        driver: delivery.driver ? {
          name: delivery.driver.user.name,
          phone: delivery.driver.user.phone,
          rating: delivery.driver.averageRating,
        } : null,

        items: delivery.order.items,
        totalAmount: delivery.order.totalAmount,

        timeline: delivery.statusUpdates.map(update => ({
          status: update.status,
          note: update.note,
          timestamp: update.createdAt,
        })),

        currentLocation: delivery.locationUpdates.length > 0 ? {
          latitude: delivery.locationUpdates[0].latitude,
          longitude: delivery.locationUpdates[0].longitude,
          lastUpdate: delivery.locationUpdates[0].createdAt,
          speed: delivery.locationUpdates[0].speed,
          heading: delivery.locationUpdates[0].heading,
        } : null,
      },
    })
  } catch (error) {
    console.error('[PUBLIC TRACKING] Error fetching delivery tracking:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch tracking information',
      },
      { status: 500 }
    )
  }
}
