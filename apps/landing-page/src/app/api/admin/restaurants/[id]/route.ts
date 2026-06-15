import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/restaurants/[id]
 * Get single restaurant details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
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
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      restaurant,
    })
  } catch (error) {
    console.error('Error fetching restaurant:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurant' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/restaurants/[id]
 * Update restaurant details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Generate slug from name
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: params.id },
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
        status: body.status,
        openingTime: body.openingTime || null,
        closingTime: body.closingTime || null,
        capacity: body.capacity || 0,
        parkingInfo: body.parkingInfo || null,
        story: body.story || null,
        privateRooms: body.privateRooms || false,
        outdoorSeating: body.outdoorSeating || false,
        images: body.images || [],
      },
    })

    return NextResponse.json({
      success: true,
      restaurant: updatedRestaurant,
    })
  } catch (error) {
    console.error('Error updating restaurant:', error)
    return NextResponse.json(
      { error: 'Failed to update restaurant' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/restaurants/[id]
 * Delete restaurant (soft delete by setting status to CLOSED)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Soft delete - set status to CLOSED
    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: params.id },
      data: { status: 'CLOSED' },
    })

    return NextResponse.json({
      success: true,
      message: 'Restaurant closed successfully',
      restaurant: updatedRestaurant,
    })
  } catch (error) {
    console.error('Error deleting restaurant:', error)
    return NextResponse.json(
      { error: 'Failed to delete restaurant' },
      { status: 500 }
    )
  }
}
