import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/menu/[menuItemId]
 * Get full menu item details with recipe and ingredients
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { menuItemId: string } }
) {
  try {
    const { menuItemId } = params

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        recipe: {
          include: {
            ingredients: {
              include: {
                inventoryItem: {
                  select: {
                    id: true,
                    name: true,
                    unit: true,
                    rawStock: true,
                    wipStock: true,
                    isCompound: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: menuItem,
    })
  } catch (error) {
    console.error('Error fetching menu item:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch menu item',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
