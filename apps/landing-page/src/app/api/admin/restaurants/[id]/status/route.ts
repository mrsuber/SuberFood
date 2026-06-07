import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * PUT /api/admin/restaurants/[id]/status
 * Update restaurant status (OPEN, CLOSED, TEMPORARILY_CLOSED)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status } = body

    if (!['OPEN', 'CLOSED', 'TEMPORARILY_CLOSED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be OPEN, CLOSED, or TEMPORARILY_CLOSED' },
        { status: 400 }
      )
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: params.id },
      data: { status },
    })

    return NextResponse.json({
      success: true,
      message: `Restaurant status updated to ${status}`,
      restaurant: updatedRestaurant,
    })
  } catch (error) {
    console.error('Error updating restaurant status:', error)
    return NextResponse.json(
      { error: 'Failed to update restaurant status' },
      { status: 500 }
    )
  }
}
