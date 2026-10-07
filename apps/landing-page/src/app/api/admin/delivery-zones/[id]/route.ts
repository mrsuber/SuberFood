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

    // Check if zone exists
    const existingZone = await prisma.deliveryZone.findUnique({
      where: { id },
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
    if (body.fee !== undefined && parseFloat(body.fee) < 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Delivery fee cannot be negative',
        },
        { status: 400 }
      )
    }

    // Check for duplicate name if name or city changed
    if (
      (body.name && body.name !== existingZone.name) ||
      (body.city && body.city !== existingZone.city)
    ) {
      const newName = body.name || existingZone.name
      const newCity = body.city || existingZone.city

      const duplicate = await prisma.deliveryZone.findFirst({
        where: {
          name: newName,
          city: newCity,
          id: { not: id },
        },
      })

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message: `A delivery zone named "${newName}" already exists in ${newCity}`,
          },
          { status: 400 }
        )
      }
    }

    // Update zone
    const zone = await prisma.deliveryZone.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.region && { region: body.region }),
        ...(body.city && { city: body.city }),
        ...(body.fee !== undefined && { fee: new Decimal(body.fee) }),
        ...(body.latitude !== undefined && {
          latitude: body.latitude ? new Decimal(body.latitude) : null,
        }),
        ...(body.longitude !== undefined && {
          longitude: body.longitude ? new Decimal(body.longitude) : null,
        }),
        ...(body.radius !== undefined && {
          radius: body.radius ? new Decimal(body.radius) : null,
        }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
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
