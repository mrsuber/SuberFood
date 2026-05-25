import { NextRequest, NextResponse } from 'next/server'
import { getAvailableMenuItems } from '@/lib/inventory'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/menu/available
 * Get all menu items with their availability based on current inventory
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const restaurantId = searchParams.get('restaurantId')

    const menuItems = await getAvailableMenuItems(restaurantId || undefined)

    // Filter to only available items for public API
    const onlyAvailable = searchParams.get('onlyAvailable') === 'true'
    const filteredItems = onlyAvailable
      ? menuItems.filter((item) => item.available && item.isAvailable)
      : menuItems

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
        available: item.available,
        maxServings: item.maxServings,
        missingIngredients: item.missingIngredients,
        isAvailable: item.isAvailable,
        hasRecipe: !!item.recipe,
      })),
    })
  } catch (error) {
    console.error('Error fetching available menu items:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch menu items',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
