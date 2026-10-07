import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export const dynamic = 'force-dynamic'

// GET /api/admin/delivery-zones/[id] - Get single delivery zone
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const zone = await prisma.deliveryZone.findUnique({
      where: { id },
      include: {
        areas: true,
      },
    })

    if (!zone) {
      return NextResponse.json(
        {
          success: false,
          message: 'Delivery zone not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: zone,
    })
  } catch (error: any) {
    console.error('Error fetching delivery zone:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch delivery zone',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// PUT /api/admin/delivery-zones/[id] - Update a delivery zone
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { name, description, deliveryFee, areas, isActive } = body

    // Check if zone exists
    const existingZone = await prisma.deliveryZone.findUnique({
      where: { id },
      include: {
        areas: true,
      },
    })

    if (!existingZone) {
      return NextResponse.json(
        {
          success: false,
          message: 'Delivery zone not found',
        },
        { status: 404 }
      )
    }

    // Validate fee if provided
    if (deliveryFee !== undefined && parseFloat(deliveryFee) < 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Delivery fee cannot be negative',
        },
        { status: 400 }
      )
    }

    // Check for duplicate name if name changed
    if (name && name !== existingZone.name) {
      const duplicate = await prisma.deliveryZone.findUnique({
        where: { name },
      })

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message: `A delivery zone named "${name}" already exists`,
          },
          { status: 400 }
        )
      }
    }

    // Update zone and areas in a transaction
    const zone = await prisma.$transaction(async (tx) => {
      // Update the zone
      const updated = await tx.deliveryZone.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description: description || null }),
          ...(deliveryFee !== undefined && { deliveryFee: new Decimal(deliveryFee) }),
          ...(isActive !== undefined && { isActive }),
        },
      })

      // Update areas if provided
      if (areas !== undefined) {
        // Delete existing areas
        await tx.deliveryZoneArea.deleteMany({
          where: { zoneId: id },
        })

        // Create new areas
        if (areas.length > 0) {
          await tx.deliveryZoneArea.createMany({
            data: areas.map((areaName: string) => ({
              zoneId: id,
              areaName,
            })),
          })
        }
      }

      // Fetch updated zone with areas
      return await tx.deliveryZone.findUnique({
        where: { id },
        include: {
          areas: true,
        },
      })
    })

    return NextResponse.json({
      success: true,
      data: zone,
      message: 'Delivery zone updated successfully',
    })
  } catch (error: any) {
    console.error('Error updating delivery zone:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update delivery zone',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/delivery-zones/[id] - Delete a delivery zone
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if zone exists
    const zone = await prisma.deliveryZone.findUnique({
      where: { id },
    })

    if (!zone) {
      return NextResponse.json(
        {
          success: false,
          message: 'Delivery zone not found',
        },
        { status: 404 }
      )
    }

    // Delete the zone
    await prisma.deliveryZone.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Delivery zone deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting delivery zone:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete delivery zone',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
