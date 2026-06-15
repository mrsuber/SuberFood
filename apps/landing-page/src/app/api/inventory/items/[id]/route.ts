import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

/**
 * GET /api/inventory/items/[id]
 * Get a single inventory item by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: params.id },
      include: {
        preparationRecipe: {
          include: {
            inputs: {
              include: {
                inventoryItem: true,
              },
            },
          },
        },
        recipeIngredients: {
          include: {
            recipe: {
              include: {
                menuItem: true,
              },
            },
          },
        },
      },
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: item,
    })
  } catch (error) {
    console.error('Error fetching inventory item:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch inventory item',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/inventory/items/[id]
 * Update an inventory item
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const {
      name,
      category,
      unit,
      minimumStock,
      maximumStock,
      reorderPoint,
      reorderQuantity,
      costPerUnit,
      supplier,
      storageLocation,
      description,
      isCompound,
      isActive,
    } = body

    // Don't allow updating stock levels here - use stock movement endpoints
    const item = await prisma.inventoryItem.update({
      where: { id: params.id },
      data: {
        name,
        category,
        unit,
        minimumStock,
        maximumStock,
        reorderPoint,
        reorderQuantity,
        costPerUnit,
        supplier,
        storageLocation,
        description,
        isCompound,
        isActive,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: item,
    })
  } catch (error) {
    console.error('Error updating inventory item:', error)
    return NextResponse.json(
      {
        error: 'Failed to update inventory item',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/inventory/items/[id]
 * Soft delete an inventory item (set isActive to false)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.inventoryItem.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return NextResponse.json({
      success: true,
      message: 'Inventory item deactivated successfully',
      data: item,
    })
  } catch (error) {
    console.error('Error deleting inventory item:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete inventory item',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
