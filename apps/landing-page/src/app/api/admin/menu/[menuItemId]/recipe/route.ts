import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/menu/[menuItemId]/recipe
 * Create a new recipe for a menu item
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { menuItemId: string } }
) {
  try {
    const { menuItemId } = params
    const body = await req.json()
    const {
      name,
      servingSize,
      prepTime,
      cookTime,
      instructions,
      ingredients,
    } = body

    // Check if menu item exists
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
    })

    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      )
    }

    // Create recipe with ingredients
    const recipe = await prisma.recipe.create({
      data: {
        menuItemId,
        name,
        servingSize,
        prepTime,
        cookTime,
        instructions,
        ingredients: {
          create: ingredients.map((ing: any) => ({
            inventoryItemId: ing.inventoryItemId,
            quantity: ing.quantity,
            unit: ing.unit,
            notes: ing.notes || null,
          })),
        },
      },
      include: {
        ingredients: {
          include: {
            inventoryItem: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: recipe,
    })
  } catch (error) {
    console.error('Error creating recipe:', error)
    return NextResponse.json(
      {
        error: 'Failed to create recipe',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/menu/[menuItemId]/recipe
 * Update existing recipe for a menu item
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
      servingSize,
      prepTime,
      cookTime,
      instructions,
      ingredients,
    } = body

    // Find existing recipe
    const existingRecipe = await prisma.recipe.findUnique({
      where: { menuItemId },
    })

    if (!existingRecipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    // Delete existing ingredients
    await prisma.recipeIngredient.deleteMany({
      where: { recipeId: existingRecipe.id },
    })

    // Update recipe with new ingredients
    const recipe = await prisma.recipe.update({
      where: { id: existingRecipe.id },
      data: {
        name,
        servingSize,
        prepTime,
        cookTime,
        instructions,
        ingredients: {
          create: ingredients.map((ing: any) => ({
            inventoryItemId: ing.inventoryItemId,
            quantity: ing.quantity,
            unit: ing.unit,
            notes: ing.notes || null,
          })),
        },
      },
      include: {
        ingredients: {
          include: {
            inventoryItem: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: recipe,
    })
  } catch (error) {
    console.error('Error updating recipe:', error)
    return NextResponse.json(
      {
        error: 'Failed to update recipe',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
