import { NextRequest, NextResponse } from 'next/server'
import { getAvailableMenuItems } from '@/lib/inventory'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/menu
 * Get menu items filtered by inventory availability
 * This is the public-facing menu API
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const restaurantId = searchParams.get('restaurantId')
    const categoryId = searchParams.get('categoryId')

    const menuItems = await getAvailableMenuItems(restaurantId || undefined)

    // Filter to only available items for public menu
    const availableItems = menuItems.filter((item) => item.available && item.isAvailable)

    // Filter by category if provided
    const filteredItems = categoryId
      ? availableItems.filter((item) => item.category.id === categoryId)
      : availableItems

    return NextResponse.json({
      success: true,
      data: filteredItems.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        salePrice: item.salePrice,
        image: item.image,
        category: item.category.name,
        categoryId: item.category.id,
        isAvailable: item.isAvailable,
      })),
    })
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch menu items',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
