import { NextRequest, NextResponse } from 'next/server'
import { checkRecipeAvailability } from '@/lib/inventory'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/recipes/[recipeId]/availability
 * Check if a recipe can be made with current inventory
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { recipeId: string } }
) {
  try {
    const { recipeId } = params
    const { searchParams } = new URL(req.url)
    const servings = parseInt(searchParams.get('servings') || '1')

    const availability = await checkRecipeAvailability(recipeId, servings)

    return NextResponse.json({
      success: true,
      data: availability,
    })
  } catch (error) {
    console.error('Error checking recipe availability:', error)
    return NextResponse.json(
      {
        error: 'Failed to check recipe availability',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
