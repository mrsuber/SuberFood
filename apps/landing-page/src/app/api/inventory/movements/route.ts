import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/inventory/movements
 * Get all stock movements with inventory item details
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const itemId = searchParams.get('itemId')

    const movements = await prisma.stockMovement.findMany({
      where: itemId ? { inventoryItemId: itemId } : undefined,
      include: {
        inventoryItem: {
          select: {
            name: true,
            unit: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    const formattedMovements = movements.map((movement) => ({
      id: movement.id,
      inventoryItemName: movement.inventoryItem.name,
      type: movement.type,
      quantity: movement.quantity,
      unit: movement.unit,
      affectedState: movement.affectedState,
      previousRaw: movement.previousRaw,
      newRaw: movement.newRaw,
      previousWip: movement.previousWip,
      newWip: movement.newWip,
      previousConsumed: movement.previousConsumed,
      newConsumed: movement.newConsumed,
      referenceType: movement.referenceType,
      referenceId: movement.referenceId,
      notes: movement.notes,
      createdAt: movement.createdAt,
    }))

    return NextResponse.json({
      success: true,
      data: formattedMovements,
    })
  } catch (error) {
    console.error('Error fetching stock movements:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch stock movements',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inventory/movements
 * Create a new stock movement (purchase, usage, adjustment, etc.)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      inventoryItemId,
      type,
      affectedState,
      quantity,
      notes,
      referenceType,
      referenceId,
    } = body

    // Validate required fields
    if (!inventoryItemId || !type || !affectedState || quantity === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: inventoryItemId, type, affectedState, quantity' },
        { status: 400 }
      )
    }

    // Get current inventory item
    const item = await prisma.inventoryItem.findUnique({
      where: { id: inventoryItemId },
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      )
    }

    // Calculate new stock levels based on affected state
    let newRaw = item.rawStock
    let newWip = item.wipStock
    let newConsumed = item.consumedStock

    switch (affectedState) {
      case 'RAW':
        newRaw = item.rawStock + quantity
        break
      case 'WIP':
        newWip = item.wipStock + quantity
        break
      case 'CONSUMED':
        newConsumed = item.consumedStock + quantity
        break
      default:
        return NextResponse.json(
          { error: 'Invalid affectedState. Must be RAW, WIP, or CONSUMED' },
          { status: 400 }
        )
    }

    // Create the stock movement and update inventory in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create stock movement record
      const movement = await tx.stockMovement.create({
        data: {
          inventoryItemId,
          type,
          affectedState,
          quantity,
          unit: item.unit,
          previousRaw: item.rawStock,
          newRaw,
          previousWip: item.wipStock,
          newWip,
          previousConsumed: item.consumedStock,
          newConsumed,
          notes,
          referenceType,
          referenceId,
        },
      })

      // Update inventory item stock levels
      const updatedItem = await tx.inventoryItem.update({
        where: { id: inventoryItemId },
        data: {
          rawStock: newRaw,
          wipStock: newWip,
          consumedStock: newConsumed,
          totalPurchased:
            type === 'PURCHASE'
              ? item.totalPurchased + quantity
              : item.totalPurchased,
        },
      })

      return { movement, updatedItem }
    })

    return NextResponse.json({
      success: true,
      message: 'Stock movement recorded successfully',
      data: result,
    })
  } catch (error) {
    console.error('Error creating stock movement:', error)
    return NextResponse.json(
      {
        error: 'Failed to create stock movement',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
