import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * PATCH /api/menu/[menuItemId]
 * Update menu item properties (isAvailable, etc.)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { menuItemId: string } }
) {
  try {
    const { menuItemId } = params
    const body = await req.json()
    const { isAvailable } = body

    if (typeof isAvailable !== 'boolean') {
      return NextResponse.json(
        { error: 'isAvailable must be a boolean' },
        { status: 400 }
      )
    }

    const menuItem = await prisma.menuItem.update({
      where: { id: menuItemId },
      data: { isAvailable },
    })

    return NextResponse.json({
      success: true,
      data: menuItem,
    })
  } catch (error) {
    console.error('Error updating menu item:', error)
    return NextResponse.json(
      {
        error: 'Failed to update menu item',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
