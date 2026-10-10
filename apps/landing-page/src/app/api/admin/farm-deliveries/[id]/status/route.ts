import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendDeliveryNotification } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/farm-deliveries/[id]/status
 * Update delivery status
 */
export async function POST(
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
      status,
      note,
      latitude,
      longitude,
      failureReason,
      failureNotes,
      receivedBy,
      deliveryPhotoUrl,
      signatureUrl,
      customerRating,
      customerFeedback,
    } = body

    if (!status) {
      return NextResponse.json(
        { success: false, message: 'Status is required' },
        { status: 400 }
      )
    }

    // Get current delivery
    const currentDelivery = await prisma.farmDelivery.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            orderNumber: true,
            guestName: true,
            guestPhone: true,
            guestEmail: true,
          },
        },
        driver: {
          select: {
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    })

    if (!currentDelivery) {
      return NextResponse.json(
        { success: false, message: 'Delivery not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      status: status.toUpperCase(),
    }

    // Set timing fields based on status
    const now = new Date()
    switch (status.toUpperCase()) {
      case 'PICKED_UP':
        updateData.actualPickupTime = now
        break
      case 'IN_TRANSIT':
        if (!currentDelivery.actualPickupTime) {
          updateData.actualPickupTime = now
        }
        break
      case 'ARRIVED':
        // No additional time field
        break
      case 'DELIVERED':
        updateData.actualDeliveryTime = now
        if (receivedBy) updateData.receivedBy = receivedBy
        if (deliveryPhotoUrl) updateData.deliveryPhotoUrl = deliveryPhotoUrl
        if (signatureUrl) updateData.signatureUrl = signatureUrl
        if (customerRating) updateData.customerRating = parseInt(customerRating)
        if (customerFeedback) updateData.customerFeedback = customerFeedback
        break
      case 'FAILED':
        updateData.failureReason = failureReason || 'Unknown'
        updateData.failureNotes = failureNotes || null
        break
      case 'CANCELLED':
        updateData.cancelledAt = now
        break
    }

    // Update delivery
    const delivery = await prisma.farmDelivery.update({
      where: { id },
      data: updateData,
    })

    // Create status update record
    await prisma.farmDeliveryStatusUpdate.create({
      data: {
        deliveryId: id,
        status: status.toUpperCase(),
        note: note || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        updatedBy: session.user.id,
      },
    })

    // Update driver stats if delivered successfully
    if (status.toUpperCase() === 'DELIVERED' && currentDelivery.driverId) {
      await prisma.staff.update({
        where: { id: currentDelivery.driverId },
        data: {
          deliveriesCompleted: { increment: 1 },
        },
      })
    }

    // Send delivery notification to customer
    try {
      if (
        ['IN_TRANSIT', 'ARRIVED', 'DELIVERED'].includes(status.toUpperCase()) &&
        (currentDelivery.order.guestPhone || currentDelivery.order.guestEmail)
      ) {
        await sendDeliveryNotification({
          customerName: currentDelivery.order.guestName || 'Customer',
          customerEmail: currentDelivery.order.guestEmail || undefined,
          customerPhone: currentDelivery.order.guestPhone || undefined,
          orderNumber: currentDelivery.order.orderNumber,
          orderTotal: 0, // Not needed for delivery notification
          orderStatus: status.toUpperCase(),
          driverName: currentDelivery.driver?.user.name,
          driverPhone: currentDelivery.driver?.user.phone,
          estimatedArrival: currentDelivery.estimatedDeliveryTime?.toISOString(),
          liveTrackingUrl: currentDelivery.publicTrackingUrl || undefined,
        })
      }
    } catch (notificationError) {
      console.error('[FARM DELIVERIES] Error sending delivery notification:', notificationError)
      // Don't fail the status update if notification fails
    }

    return NextResponse.json({
      success: true,
      delivery,
      message: `Delivery status updated to ${status}`,
    })
  } catch (error) {
    console.error('[ADMIN FARM DELIVERIES] Error updating status:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update status',
      },
      { status: 500 }
    )
  }
}
