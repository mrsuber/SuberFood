import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export const dynamic = 'force-dynamic'

// GET /api/admin/delivery-zones - Get all delivery zones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')

    // Build where clause
    const where: any = {}

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const zones = await prisma.deliveryZone.findMany({
      where,
      include: {
        areas: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      data: zones,
    })
  } catch (error: any) {
    console.error('Error fetching delivery zones:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch delivery zones',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// POST /api/admin/delivery-zones - Create a new delivery zone
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      name,
      description,
      deliveryFee,
      areas = [], // Array of area names: ["Molyko", "Great Soppo", etc.]
      isActive = true,
    } = body

    // Validate required fields
    if (!name || deliveryFee === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: 'Name and delivery fee are required',
        },
        { status: 400 }
      )
    }

    if (parseFloat(deliveryFee) < 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Delivery fee cannot be negative',
        },
        { status: 400 }
      )
    }

    // Check for duplicate zone name
    const existingZone = await prisma.deliveryZone.findUnique({
      where: { name },
    })

    if (existingZone) {
      return NextResponse.json(
        {
          success: false,
          message: `A delivery zone named "${name}" already exists`,
        },
        { status: 400 }
      )
    }

    // Create delivery zone with areas
    const zone = await prisma.deliveryZone.create({
      data: {
        name,
        description: description || null,
        deliveryFee: new Decimal(deliveryFee),
        isActive,
        areas: {
          create: areas.map((areaName: string) => ({
            areaName,
          })),
        },
      },
      include: {
        areas: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: zone,
      message: 'Delivery zone created successfully',
    })
  } catch (error: any) {
    console.error('Error creating delivery zone:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create delivery zone',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
