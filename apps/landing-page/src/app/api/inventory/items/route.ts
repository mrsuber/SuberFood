import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/inventory/items
 * Create a new inventory item
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      category,
      unit,
      rawStock,
      minimumStock,
      maximumStock,
      reorderPoint,
      reorderQuantity,
      costPerUnit,
      supplier,
      storageLocation,
      description,
      isCompound,
      totalPurchased,
      imageUrl,
      size,
    } = body

    if (!name || !category || !unit || rawStock === undefined || minimumStock === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, unit, rawStock, minimumStock' },
        { status: 400 }
      )
    }

    const item = await prisma.inventoryItem.create({
      data: {
        name,
        category,
        unit,
        rawStock,
        wipStock: 0,
        consumedStock: 0,
        totalPurchased: totalPurchased || rawStock,
        minimumStock,
        maximumStock,
        reorderPoint,
        reorderQuantity,
        costPerUnit,
        supplier: supplier || null,
        storageLocation: storageLocation || null,
        description: description || null,
        isCompound,
        imageUrl: imageUrl || null,
        size: size || null,
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Inventory item created successfully',
      data: item,
    })
  } catch (error) {
    console.error('Error creating inventory item:', error)
    return NextResponse.json(
      {
        error: 'Failed to create inventory item',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/inventory/items
 * Get all inventory items
 */
export async function GET() {
  try {
    const items = await prisma.inventoryItem.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: items,
    })
  } catch (error) {
    console.error('Error fetching inventory items:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch inventory items',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
