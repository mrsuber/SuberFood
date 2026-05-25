import { PrismaClient, InventoryUnit } from '@prisma/client'

const prisma = new PrismaClient()

export type InventoryDeduction = {
  itemId: string
  itemName: string
  quantity: number
  unit: string
  fromRaw: number
  fromWip: number
  batchesAffected?: Array<{
    batchId: string
    batchNumber: string
    quantityUsed: number
    ingredientsConsumed: Record<string, any>
  }>
}

/**
 * Deduct inventory for a recipe/menu item
 * Handles both compound ingredients (WIP) and raw ingredients
 */
export async function deductInventoryForRecipe(
  recipeId: string,
  servings: number = 1,
  customizations?: {
    removed?: string[] // Ingredient IDs to skip
    added?: Record<string, number> // Ingredient ID → quantity to add
  }
) {
  const deductions: InventoryDeduction[] = []
  const stockMovements: any[] = []

  // Get recipe with ingredients
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      ingredients: {
        include: {
          inventoryItem: {
            include: {
              preparationRecipe: {
                include: {
                  inputs: {
                    include: {
                      inventoryItem: true,
                    },
                  },
                  batches: {
                    where: {
                      quantityRemaining: { gt: 0 },
                    },
                    orderBy: {
                      productionDate: 'asc', // FIFO - First In First Out
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!recipe) {
    throw new Error('Recipe not found')
  }

  // Calculate servings multiplier
  const multiplier = servings / recipe.servingSize

  // Process each ingredient
  for (const recipeIngredient of recipe.ingredients) {
    const item = recipeIngredient.inventoryItem

    // Skip if customization says to remove this ingredient
    if (customizations?.removed?.includes(item.id)) {
      continue
    }

    // Calculate required quantity (with customizations)
    let requiredQuantity = recipeIngredient.quantity * multiplier
    if (customizations?.added?.[item.id]) {
      requiredQuantity += customizations.added[item.id]
    }

    // Check if this is a compound ingredient (has WIP stock)
    if (item.isCompound && item.wipStock > 0) {
      // Deduct from WIP (pre-prepared batches)
      const deduction = await deductFromWIP(item.id, requiredQuantity)
      deductions.push(deduction)
    } else {
      // Deduct from raw stock
      const deduction = await deductFromRaw(item.id, requiredQuantity)
      deductions.push(deduction)
    }
  }

  return deductions
}

/**
 * Deduct from raw stock and move to consumed
 */
async function deductFromRaw(itemId: string, quantity: number): Promise<InventoryDeduction> {
  const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } })
  if (!item) throw new Error('Inventory item not found')

  if (item.rawStock < quantity) {
    throw new Error(
      `Insufficient raw stock for ${item.name}. Need ${quantity} ${item.unit}, have ${item.rawStock} ${item.unit}`
    )
  }

  // Update stock in transaction
  const updatedItem = await prisma.inventoryItem.update({
    where: { id: itemId },
    data: {
      rawStock: { decrement: quantity },
      consumedStock: { increment: quantity },
    },
  })

  // Log movement
  await prisma.stockMovement.create({
    data: {
      inventoryItemId: itemId,
      type: 'USAGE',
      quantity: -quantity,
      unit: item.unit,
      affectedState: 'RAW',
      previousRaw: item.rawStock,
      newRaw: updatedItem.rawStock,
      previousWip: item.wipStock,
      newWip: updatedItem.wipStock,
      previousConsumed: item.consumedStock,
      newConsumed: updatedItem.consumedStock,
      referenceType: 'Order',
      notes: `Used ${quantity} ${item.unit} for order`,
    },
  })

  return {
    itemId: item.id,
    itemName: item.name,
    quantity,
    unit: item.unit,
    fromRaw: quantity,
    fromWip: 0,
  }
}

/**
 * Deduct from WIP batches (compound ingredients)
 * Uses FIFO (First In First Out) and tracks proportional ingredient consumption
 */
async function deductFromWIP(itemId: string, quantity: number): Promise<InventoryDeduction> {
  const item = await prisma.inventoryItem.findUnique({
    where: { id: itemId },
    include: {
      preparationRecipe: {
        include: {
          inputs: {
            include: {
              inventoryItem: true,
            },
          },
          batches: {
            where: { quantityRemaining: { gt: 0 } },
            orderBy: { productionDate: 'asc' },
          },
        },
      },
    },
  })

  if (!item) throw new Error('Inventory item not found')
  if (item.wipStock < quantity) {
    throw new Error(
      `Insufficient WIP stock for ${item.name}. Need ${quantity} ${item.unit}, have ${item.wipStock} ${item.unit}`
    )
  }

  let remainingToDeduct = quantity
  const batchesAffected: any[] = []

  // Deduct from batches using FIFO
  for (const batch of item.preparationRecipe!.batches) {
    if (remainingToDeduct <= 0) break

    const deductFromBatch = Math.min(remainingToDeduct, batch.quantityRemaining)
    const proportionUsed = deductFromBatch / batch.quantityProduced

    // Calculate proportional ingredient consumption
    const ingredientsUsed = batch.ingredientsUsed as Record<string, any>
    const ingredientsConsumed: Record<string, any> = {}

    for (const [ingredientId, ingredientData] of Object.entries(ingredientsUsed)) {
      const { quantity: originalQty, unit } = ingredientData as { quantity: number; unit: string }
      const consumedQty = originalQty * proportionUsed

      ingredientsConsumed[ingredientId] = {
        name: (ingredientData as any).name,
        quantity: consumedQty,
        unit,
      }

      // Update the raw ingredient's consumed stock
      await prisma.inventoryItem.update({
        where: { id: ingredientId },
        data: {
          wipStock: { decrement: consumedQty },
          consumedStock: { increment: consumedQty },
        },
      })

      // Log movement for the raw ingredient
      const rawItem = await prisma.inventoryItem.findUnique({ where: { id: ingredientId } })
      if (rawItem) {
        await prisma.stockMovement.create({
          data: {
            inventoryItemId: ingredientId,
            type: 'USAGE',
            quantity: -consumedQty,
            unit: unit as InventoryUnit,
            affectedState: 'WIP',
            previousRaw: rawItem.rawStock,
            newRaw: rawItem.rawStock,
            previousWip: rawItem.wipStock + consumedQty,
            newWip: rawItem.wipStock,
            previousConsumed: rawItem.consumedStock - consumedQty,
            newConsumed: rawItem.consumedStock,
            referenceType: 'PreparationBatch',
            referenceId: batch.id,
            notes: `Consumed from batch ${batch.batchNumber}`,
          },
        })
      }
    }

    // Update batch
    await prisma.preparationBatch.update({
      where: { id: batch.id },
      data: {
        quantityRemaining: { decrement: deductFromBatch },
        quantityConsumed: { increment: deductFromBatch },
      },
    })

    batchesAffected.push({
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      quantityUsed: deductFromBatch,
      ingredientsConsumed,
    })

    remainingToDeduct -= deductFromBatch
  }

  // Update compound ingredient stock
  await prisma.inventoryItem.update({
    where: { id: itemId },
    data: {
      wipStock: { decrement: quantity },
      consumedStock: { increment: quantity },
    },
  })

  // Log movement for compound ingredient
  await prisma.stockMovement.create({
    data: {
      inventoryItemId: itemId,
      type: 'USAGE',
      quantity: -quantity,
      unit: item.unit,
      affectedState: 'WIP',
      previousRaw: item.rawStock,
      newRaw: item.rawStock,
      previousWip: item.wipStock + quantity,
      newWip: item.wipStock,
      previousConsumed: item.consumedStock - quantity,
      newConsumed: item.consumedStock,
      referenceType: 'Order',
      notes: `Used ${quantity} ${item.unit} from WIP for order`,
    },
  })

  return {
    itemId: item.id,
    itemName: item.name,
    quantity,
    unit: item.unit,
    fromRaw: 0,
    fromWip: quantity,
    batchesAffected,
  }
}

/**
 * Check if recipe can be prepared with current stock
 */
export async function checkRecipeAvailability(recipeId: string, servings: number = 1) {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      ingredients: {
        include: {
          inventoryItem: true,
        },
      },
    },
  })

  if (!recipe) return { available: false, missing: [] }

  const multiplier = servings / recipe.servingSize
  const missing: Array<{ name: string; need: number; have: number; unit: string }> = []

  for (const ingredient of recipe.ingredients) {
    const required = ingredient.quantity * multiplier
    const item = ingredient.inventoryItem
    const available = item.isCompound ? item.wipStock : item.rawStock

    if (available < required) {
      missing.push({
        name: item.name,
        need: required,
        have: available,
        unit: item.unit,
      })
    }
  }

  return {
    available: missing.length === 0,
    missing,
  }
}
