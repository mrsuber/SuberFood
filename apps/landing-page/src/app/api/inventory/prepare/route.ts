import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * POST /api/inventory/prepare
 * Create a preparation batch and move raw ingredients to WIP
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { preparationRecipeId, batchQuantity } = body

    if (!preparationRecipeId || !batchQuantity || batchQuantity < 1) {
      return NextResponse.json(
        { error: 'Invalid request. preparationRecipeId and batchQuantity (>= 1) are required.' },
        { status: 400 }
      )
    }

    // Fetch preparation recipe with inputs
    const recipe = await prisma.preparationRecipe.findUnique({
      where: { id: preparationRecipeId },
      include: {
        inputs: {
          include: {
            inventoryItem: true,
          },
        },
        outputItem: true,
      },
    })

    if (!recipe) {
      return NextResponse.json({ error: 'Preparation recipe not found' }, { status: 404 })
    }

    // Validate that we have enough raw stock
    const insufficientIngredients: string[] = []
    for (const input of recipe.inputs) {
      const requiredQuantity = input.quantity * batchQuantity
      if (input.inventoryItem.rawStock < requiredQuantity) {
        insufficientIngredients.push(
          `${input.inventoryItem.name}: need ${requiredQuantity} ${input.unit}, have ${input.inventoryItem.rawStock} ${input.inventoryItem.unit}`
        )
      }
    }

    if (insufficientIngredients.length > 0) {
      return NextResponse.json(
        {
          error: 'Insufficient raw stock',
          details: insufficientIngredients,
        },
        { status: 400 }
      )
    }

    // Use a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      const ingredientsUsed: Record<string, any> = {}
      const stockMovements = []

      // Deduct raw stock from each input ingredient
      for (const input of recipe.inputs) {
        const requiredQuantity = input.quantity * batchQuantity
        const item = input.inventoryItem

        // Update the raw ingredient (decrease rawStock, increase wipStock)
        const updatedItem = await tx.inventoryItem.update({
          where: { id: item.id },
          data: {
            rawStock: { decrement: requiredQuantity },
            wipStock: { increment: requiredQuantity },
          },
        })

        // Track what was used
        ingredientsUsed[item.id] = {
          name: item.name,
          quantity: requiredQuantity,
          unit: input.unit,
        }

        // Create stock movement record for raw → WIP transition
        const movement = await tx.stockMovement.create({
          data: {
            inventoryItemId: item.id,
            type: 'PRODUCTION',
            quantity: requiredQuantity,
            unit: input.unit,
            affectedState: 'RAW',
            previousRaw: item.rawStock,
            newRaw: updatedItem.rawStock,
            previousWip: item.wipStock,
            newWip: updatedItem.wipStock,
            previousConsumed: item.consumedStock,
            newConsumed: item.consumedStock,
            referenceType: 'PreparationBatch',
            notes: `Used in preparation of ${recipe.name}`,
          },
        })

        stockMovements.push(movement)
      }

      // Calculate total output quantity
      const totalOutputQuantity = recipe.outputQuantity * batchQuantity

      // Generate unique batch number
      const batchNumber = `BATCH-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`

      // Calculate expiry date if shelf life is defined
      let expiryDate: Date | undefined
      if (recipe.shelfLifeDays) {
        expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + recipe.shelfLifeDays)
      }

      // Create preparation batch record
      const batch = await tx.preparationBatch.create({
        data: {
          preparationRecipeId: recipe.id,
          batchNumber,
          quantityProduced: totalOutputQuantity,
          quantityRemaining: totalOutputQuantity,
          quantityConsumed: 0,
          ingredientsUsed,
          expiryDate,
          notes: `Prepared ${batchQuantity} batch(es)`,
        },
      })

      // Update the compound ingredient's WIP stock
      const updatedOutputItem = await tx.inventoryItem.update({
        where: { id: recipe.outputItemId },
        data: {
          wipStock: { increment: totalOutputQuantity },
        },
      })

      // Create stock movement for the compound ingredient
      await tx.stockMovement.create({
        data: {
          inventoryItemId: recipe.outputItemId,
          type: 'PRODUCTION',
          quantity: totalOutputQuantity,
          unit: recipe.outputUnit,
          affectedState: 'WIP',
          previousRaw: updatedOutputItem.rawStock - totalOutputQuantity,
          newRaw: updatedOutputItem.rawStock,
          previousWip: updatedOutputItem.wipStock - totalOutputQuantity,
          newWip: updatedOutputItem.wipStock,
          previousConsumed: updatedOutputItem.consumedStock,
          newConsumed: updatedOutputItem.consumedStock,
          referenceType: 'PreparationBatch',
          referenceId: batch.id,
          notes: `Prepared ${totalOutputQuantity} ${recipe.outputUnit} of ${recipe.name}`,
        },
      })

      return {
        batch,
        stockMovements,
        outputQuantity: totalOutputQuantity,
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully prepared ${result.outputQuantity} ${recipe.outputUnit} of ${recipe.name}`,
      data: {
        batchId: result.batch.id,
        batchNumber: result.batch.batchNumber,
        quantityProduced: result.batch.quantityProduced,
        expiryDate: result.batch.expiryDate,
        ingredientsUsed: result.batch.ingredientsUsed,
      },
    })
  } catch (error) {
    console.error('Error preparing batch:', error)
    return NextResponse.json(
      {
        error: 'Failed to prepare batch',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/inventory/prepare
 * Get all preparation recipes with stock availability
 */
export async function GET() {
  try {
    const recipes = await prisma.preparationRecipe.findMany({
      where: { isActive: true },
      include: {
        inputs: {
          include: {
            inventoryItem: true,
          },
        },
        outputItem: true,
        batches: {
          orderBy: { productionDate: 'desc' },
          take: 5, // Last 5 batches
        },
      },
    })

    // Calculate availability for each recipe
    const recipesWithAvailability = recipes.map((recipe) => {
      let canPrepare = true
      let maxBatches = Infinity
      const inputsWithStatus = recipe.inputs.map((input) => {
        const requiredPerBatch = input.quantity
        const available = input.inventoryItem.rawStock
        const maxPossible = Math.floor(available / requiredPerBatch)

        maxBatches = Math.min(maxBatches, maxPossible)

        let status: 'ok' | 'low' | 'out' = 'ok'
        if (available === 0) {
          status = 'out'
          canPrepare = false
        } else if (available < input.inventoryItem.minimumStock) {
          status = 'low'
        }

        return {
          id: input.id,
          name: input.inventoryItem.name,
          quantity: input.quantity,
          unit: input.unit,
          available: input.inventoryItem.rawStock,
          notes: input.notes,
          status,
        }
      })

      return {
        id: recipe.id,
        name: recipe.name,
        outputQuantity: recipe.outputQuantity,
        outputUnit: recipe.outputUnit,
        prepTime: recipe.prepTime,
        shelfLifeDays: recipe.shelfLifeDays,
        instructions: recipe.instructions,
        storageLocation: recipe.storageLocation,
        currentStock: recipe.outputItem.rawStock,
        wipStock: recipe.outputItem.wipStock,
        inputs: inputsWithStatus,
        canPrepare,
        maxBatches: maxBatches === Infinity ? 0 : maxBatches,
        recentBatches: recipe.batches.map((batch) => ({
          id: batch.id,
          batchNumber: batch.batchNumber,
          quantityProduced: batch.quantityProduced,
          quantityRemaining: batch.quantityRemaining,
          productionDate: batch.productionDate,
          expiryDate: batch.expiryDate,
        })),
      }
    })

    return NextResponse.json({
      success: true,
      data: recipesWithAvailability,
    })
  } catch (error) {
    console.error('Error fetching preparation recipes:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch preparation recipes',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
