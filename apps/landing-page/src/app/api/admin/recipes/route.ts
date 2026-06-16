import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRecipeAvailability } from '@/lib/inventory'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/recipes
 * Get all recipes with their availability status
 */
export async function GET(req: NextRequest) {
  try {
    // Fetch all recipes with their ingredients and menu item details
    const recipes = await prisma.recipe.findMany({
      where: { isActive: true },
      include: {
        menuItem: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
          },
        },
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
      orderBy: {
        menuItem: {
          name: 'asc',
        },
      },
    })

    // Calculate availability for each recipe
    const recipesWithAvailability = await Promise.all(
      recipes.map(async (recipe) => {
        // Check availability for the recipe's default serving size
        const availability = await checkRecipeAvailability(recipe.id, recipe.servingSize)

        // Map ingredients to frontend format
        const ingredients = recipe.ingredients.map((ing) => {
          const item = ing.inventoryItem
          const available = item.isCompound ? item.wipStock : item.rawStock
          const needed = ing.quantity

          let status: 'ok' | 'low' | 'out' = 'ok'
          if (available === 0) {
            status = 'out'
          } else if (available < needed) {
            status = 'low'
          }

          return {
            name: item.name,
            quantity: needed,
            unit: item.unit,
            available,
            status,
          }
        })

        return {
          id: recipe.id,
          menuItemId: recipe.menuItemId,
          menuItemName: recipe.menuItem.name,
          servingSize: recipe.servingSize,
          prepTime: recipe.prepTime || 0,
          cookTime: recipe.cookTime || 0,
          totalCost: recipe.totalCost || 0,
          costPerServing: recipe.costPerServing || 0,
          canMake: availability.available,
          canMakeServings: availability.maxServings,
          ingredients,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: recipesWithAvailability,
    })
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch recipes',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
