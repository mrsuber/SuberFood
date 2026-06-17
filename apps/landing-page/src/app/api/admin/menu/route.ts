import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/menu
 * Get all menu items (admin view)
 */
export async function GET(request: NextRequest) {
  try {
    const menuItems = await prisma.menuItem.findMany({
      include: {
        category: {
          include: {
            restaurant: true,
          },
        },
      },
      orderBy: [
        { category: { restaurant: { name: 'asc' } } },
        { category: { displayOrder: 'asc' } },
      ],
    })

    return NextResponse.json({
      success: true,
      menuItems,
    })
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/menu
 * Create a new menu item
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.categoryId || !body.price) {
      return NextResponse.json(
        { error: 'Missing required fields: name, categoryId, and price are required' },
        { status: 400 }
      )
    }

    // Create the menu item
    const newMenuItem = await prisma.menuItem.create({
      data: {
        name: body.name,
        categoryId: body.categoryId,
        description: body.description || null,
        image: body.image || null,
        images: body.images || [],
        price: body.price,
        salePrice: body.salePrice || null,
        preparationTime: body.preparationTime || null,
        calories: body.calories || null,
        nutritionInfo: body.nutritionInfo || null,
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
      message: 'Menu item created successfully',
      menuItem: newMenuItem,
    })
  } catch (error) {
    console.error('Error creating menu item:', error)
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    )
  }
}
