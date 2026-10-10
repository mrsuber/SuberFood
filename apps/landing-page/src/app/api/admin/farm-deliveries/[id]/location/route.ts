import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/farm-deliveries/[id]/location
 * Update driver's GPS location (for real-time tracking)
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
      latitude,
      longitude,
      accuracy,
      altitude,
      speed,
      heading,
      batteryLevel,
    } = body

    if (!latitude || !longitude) {
      return NextResponse.json(
        { success: false, message: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    // Get delivery to verify driver
    const delivery = await prisma.farmDelivery.findUnique({
      where: { id },
      select: {
        driverId: true,
      },
    })

    if (!delivery) {
      return NextResponse.json(
        { success: false, message: 'Delivery not found' },
        { status: 404 }
      )
    }

    if (!delivery.driverId) {
      return NextResponse.json(
        { success: false, message: 'No driver assigned to this delivery' },
        { status: 400 }
      )
    }

    // Create location update
    const locationUpdate = await prisma.farmDeliveryLocationUpdate.create({
      data: {
        deliveryId: id,
        driverId: delivery.driverId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy: accuracy ? parseFloat(accuracy) : null,
        altitude: altitude ? parseFloat(altitude) : null,
        speed: speed ? parseFloat(speed) : null,
        heading: heading ? parseFloat(heading) : null,
        batteryLevel: batteryLevel ? parseInt(batteryLevel) : null,
      },
    })

    return NextResponse.json({
      success: true,
      locationUpdate,
      message: 'Location updated successfully',
    })
  } catch (error) {
    console.error('[ADMIN FARM DELIVERIES] Error updating location:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update location',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/farm-deliveries/[id]/location
 * Get recent location updates for a delivery
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const locationUpdates = await prisma.farmDeliveryLocationUpdate.findMany({
      where: { deliveryId: id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        driver: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      locationUpdates,
      count: locationUpdates.length,
    })
  } catch (error) {
    console.error('[ADMIN FARM DELIVERIES] Error fetching location updates:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch location updates',
      },
      { status: 500 }
    )
  }
}
