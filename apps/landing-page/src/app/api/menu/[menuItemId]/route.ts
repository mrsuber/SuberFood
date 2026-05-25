import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * PATCH /api/menu/[menuItemId]
 * Update menu item properties
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { menuItemId: string } }
) {
  try {
    const { menuItemId } = params
    const body = await req.json()
    const {
      name,
      description,
      price,
      salePrice,
      image,
      gallery,
      isAvailable,
    } = body

    // Build update data object, only including provided fields
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = price
    if (salePrice !== undefined) updateData.salePrice = salePrice
    if (image !== undefined) updateData.image = image
    if (gallery !== undefined) updateData.gallery = gallery
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable

    const menuItem = await prisma.menuItem.update({
      where: { id: menuItemId },
      data: updateData,
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
