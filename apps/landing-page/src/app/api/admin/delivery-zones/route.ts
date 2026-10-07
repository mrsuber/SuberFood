import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export const dynamic = 'force-dynamic'

// GET /api/admin/delivery-zones - Get all delivery zones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const region = searchParams.get('region')
    const isActive = searchParams.get('isActive')

    // Build where clause
    const where: any = {}

    if (city) {
      where.city = city
    }

    if (region) {
      where.region = region
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const zones = await prisma.deliveryZone.findMany({
      where,
      orderBy: [
        { region: 'asc' },
        { city: 'asc' },
        { name: 'asc' },
      ],
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
      region,
      city,
      fee,
      latitude,
      longitude,
      radius,
      isActive = true,
      createdBy,
    } = body

    // Validate required fields
    if (!name || !region || !city || fee === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: 'Name, region, city, and fee are required',
        },
        { status: 400 }
      )
    }

    if (parseFloat(fee) < 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Delivery fee cannot be negative',
        },
        { status: 400 }
      )
    }

    // Check for duplicate zone name in same city
    const existingZone = await prisma.deliveryZone.findFirst({
      where: {
        name,
        city,
      },
    })

    if (existingZone) {
      return NextResponse.json(
        {
          success: false,
          message: `A delivery zone named "${name}" already exists in ${city}`,
        },
        { status: 400 }
      )
    }

    // Create delivery zone
    const zone = await prisma.deliveryZone.create({
      data: {
        name,
        region,
        city,
        fee: new Decimal(fee),
        latitude: latitude ? new Decimal(latitude) : null,
        longitude: longitude ? new Decimal(longitude) : null,
        radius: radius ? new Decimal(radius) : null,
        isActive,
        createdBy: createdBy || null,
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
