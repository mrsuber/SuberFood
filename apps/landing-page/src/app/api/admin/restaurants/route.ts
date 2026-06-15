import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/restaurants
 * Get all restaurants (admin view)
 */
export async function GET(request: NextRequest) {
  try {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        _count: {
          select: {
            menuCategories: true,
            staff: true,
            equipment: true,
            reservations: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      restaurants,
    })
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/restaurants
 * Create a new restaurant location
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Generate slug from name
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Generate branch code (simple auto-increment for now)
    const restaurantCount = await prisma.restaurant.count()
    const branchCode = `LOC-${(restaurantCount + 1).toString().padStart(3, '0')}`

    const newRestaurant = await prisma.restaurant.create({
      data: {
        name: body.name,
        slug,
        type: body.type,
        description: body.description || null,
        address: body.address,
        city: body.city,
        state: body.state,
        postalCode: body.postalCode,
        phone: body.phone,
        email: body.email,
        status: body.status || 'CLOSED',
        openingTime: body.openingTime || null,
        closingTime: body.closingTime || null,
        capacity: body.capacity || 0,
        parkingInfo: body.parkingInfo || null,
        story: body.story || null,
        privateRooms: body.privateRooms || false,
        outdoorSeating: body.outdoorSeating || false,
        images: body.images || [],
        branchCode,
        isMainBranch: false, // New locations are not main branches by default
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Restaurant location created successfully',
      restaurant: newRestaurant,
    })
  } catch (error) {
    console.error('Error creating restaurant:', error)
    return NextResponse.json(
      { error: 'Failed to create restaurant' },
      { status: 500 }
    )
  }
}
