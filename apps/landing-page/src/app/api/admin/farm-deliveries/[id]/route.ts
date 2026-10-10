import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/farm-deliveries/[id]
 * Get delivery details with full history
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const delivery = await prisma.farmDelivery.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    imageUrl: true,
                  },
                },
              },
            },
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
                email: true,
              },
            },
            deliveriesCompleted: true,
            averageRating: true,
          },
        },
        statusUpdates: {
          orderBy: { createdAt: 'desc' },
        },
        locationUpdates: {
          orderBy: { createdAt: 'desc' },
          take: 50, // Last 50 location updates
        },
      },
    })

    if (!delivery) {
      return NextResponse.json(
        { success: false, message: 'Delivery not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      delivery,
    })
  } catch (error) {
    console.error('[ADMIN FARM DELIVERIES] Error fetching delivery:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch delivery',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/farm-deliveries/[id]
 * Update delivery details
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await req.json()

    const {
      driverId,
      estimatedPickupTime,
      estimatedDeliveryTime,
      estimatedDistance,
      estimatedDuration,
      deliveryFee,
      driverEarnings,
      driverNotes,
      adminNotes,
    } = body

    const delivery = await prisma.farmDelivery.update({
      where: { id },
      data: {
        ...(driverId !== undefined && { driverId }),
        ...(estimatedPickupTime && { estimatedPickupTime: new Date(estimatedPickupTime) }),
        ...(estimatedDeliveryTime && { estimatedDeliveryTime: new Date(estimatedDeliveryTime) }),
        ...(estimatedDistance !== undefined && { estimatedDistance: parseFloat(estimatedDistance) }),
        ...(estimatedDuration !== undefined && { estimatedDuration: parseInt(estimatedDuration) }),
        ...(deliveryFee !== undefined && { deliveryFee }),
        ...(driverEarnings !== undefined && { driverEarnings }),
        ...(driverNotes !== undefined && { driverNotes }),
        ...(adminNotes !== undefined && { adminNotes }),
      },
    })

    return NextResponse.json({
      success: true,
      delivery,
      message: 'Delivery updated successfully',
    })
  } catch (error) {
    console.error('[ADMIN FARM DELIVERIES] Error updating delivery:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update delivery',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/farm-deliveries/[id]
 * Cancel/delete a delivery
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Mark as cancelled instead of deleting
    const delivery = await prisma.farmDelivery.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    })

    // Add status update
    await prisma.farmDeliveryStatusUpdate.create({
      data: {
        deliveryId: id,
        status: 'CANCELLED',
        note: 'Delivery cancelled by admin',
        updatedBy: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Delivery cancelled successfully',
    })
  } catch (error) {
    console.error('[ADMIN FARM DELIVERIES] Error cancelling delivery:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to cancel delivery',
      },
      { status: 500 }
    )
  }
}
