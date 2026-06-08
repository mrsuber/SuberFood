import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/menu/categories
 * Get all menu categories with restaurant information
 */
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.menuCategory.findMany({
      include: {
        restaurant: true,
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: [
        { restaurant: { name: 'asc' } },
        { displayOrder: 'asc' },
      ],
    })

    return NextResponse.json({
      success: true,
      categories,
    })
  } catch (error) {
    console.error('Error fetching menu categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu categories' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/menu/categories
 * Create a new menu category
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.restaurantId) {
      return NextResponse.json(
        { error: 'Missing required fields: name and restaurantId are required' },
        { status: 400 }
      )
    }

    // Get the highest display order for this restaurant
    const maxDisplayOrder = await prisma.menuCategory.findFirst({
      where: {
        restaurantId: body.restaurantId,
      },
      orderBy: {
        displayOrder: 'desc',
      },
      select: {
        displayOrder: true,
      },
    })

    const displayOrder = (maxDisplayOrder?.displayOrder ?? 0) + 1

    // Create the category
    const newCategory = await prisma.menuCategory.create({
      data: {
        name: body.name,
        restaurantId: body.restaurantId,
        description: body.description || null,
        displayOrder,
        isActive: body.isActive ?? true,
      },
      include: {
        restaurant: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Menu category created successfully',
      category: newCategory,
    })
  } catch (error) {
    console.error('Error creating menu category:', error)
    return NextResponse.json(
      { error: 'Failed to create menu category' },
      { status: 500 }
    )
  }
}
