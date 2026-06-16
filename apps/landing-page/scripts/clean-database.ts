import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') })
dotenv.config({ path: path.join(__dirname, '../.env') })

const prisma = new PrismaClient()

async function cleanDatabase() {
  try {
    console.log('🧹 Starting database cleanup...')

    // Delete in order to respect foreign key constraints
    console.log('Deleting order items...')
    await prisma.orderItem.deleteMany({})

    console.log('Deleting orders...')
    await prisma.order.deleteMany({})

    console.log('Deleting recipe ingredients...')
    await prisma.recipeIngredient.deleteMany({})

    console.log('Deleting preparation recipe inputs...')
    await prisma.preparationRecipeInput.deleteMany({})

    console.log('Deleting preparation recipes...')
    await prisma.preparationRecipe.deleteMany({})

    console.log('Deleting recipes...')
    await prisma.recipe.deleteMany({})

    console.log('Deleting menu items...')
    await prisma.menuItem.deleteMany({})

    console.log('Deleting menu categories...')
    await prisma.menuCategory.deleteMany({})

    console.log('Deleting inventory movements...')
    await prisma.inventoryMovement.deleteMany({})

    console.log('Deleting inventory batches...')
    await prisma.inventoryBatch.deleteMany({})

    console.log('Deleting inventory items...')
    await prisma.inventoryItem.deleteMany({})

    console.log('✅ Database cleanup completed successfully!')
    console.log('')
    console.log('📋 Summary:')
    console.log('- All inventory items deleted')
    console.log('- All recipes deleted')
    console.log('- All menu items deleted')
    console.log('- All menu categories deleted')
    console.log('- All orders deleted')
    console.log('')
    console.log('You can now start fresh with your breakfast eggs! 🍳')
  } catch (error) {
    console.error('❌ Error cleaning database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

cleanDatabase()
