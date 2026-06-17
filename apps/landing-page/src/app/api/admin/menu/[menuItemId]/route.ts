import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/menu/[id]
 * Get a single menu item
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { menuItemId: string } }
) {
  try {
    const menuItem = await prisma.menuItem.findUnique({
      where: {
        id: params.menuItemId,
      },
      include: {
        category: {
          include: {
            restaurant: true,
          },
        },
        recipe: {
          include: {
            ingredients: {
              include: {
                inventoryItem: true,
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
      menuItem,
    })
  } catch (error) {
    console.error('Error fetching menu item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu item' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/menu/[id]
 * Update a menu item
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { menuItemId: string } }
) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.categoryId || !body.price) {
      return NextResponse.json(
        { error: 'Missing required fields: name, categoryId, and price are required' },
        { status: 400 }
      )
    }

    // Update the menu item
    const updatedMenuItem = await prisma.menuItem.update({
      where: {
        id: params.menuItemId,
      },
      data: {
        name: body.name,
        categoryId: body.categoryId,
        description: body.description || null,
        image: body.image || null,
        images: body.images !== undefined ? body.images : undefined,
        price: body.price,
        salePrice: body.salePrice || null,
        preparationTime: body.preparationTime || null,
        calories: body.calories || null,
        nutritionInfo: body.nutritionInfo !== undefined ? body.nutritionInfo : undefined,
        spiceLevel: body.spiceLevel || null,
        isAvailable: body.isAvailable ?? true,
        isVegetarian: body.isVegetarian ?? false,
        isVegan: body.isVegan ?? false,
        isGlutenFree: body.isGlutenFree ?? false,
        isKeto: body.isKeto ?? false,
        isHalal: body.isHalal ?? false,
        isKosher: body.isKosher ?? false,
        isChefRecommended: body.isChefRecommended ?? false,
        isSeasonal: body.isSeasonal ?? false,
        isPopular: body.isPopular ?? false,
        allergens: body.allergens || [],
        ingredients: body.ingredients || null,
        winePairing: body.winePairing || null,
      },
      include: {
        category: {
          include: {
            restaurant: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Menu item updated successfully',
      menuItem: updatedMenuItem,
    })
  } catch (error) {
    console.error('Error updating menu item:', error)
    return NextResponse.json(
      { error: 'Failed to update menu item' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/menu/[id]
 * Delete a menu item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { menuItemId: string } }
) {
  try {
    await prisma.menuItem.delete({
      where: {
        id: params.menuItemId,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting menu item:', error)
    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    )
  }
}
