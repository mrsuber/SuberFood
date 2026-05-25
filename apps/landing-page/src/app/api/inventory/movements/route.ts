import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
