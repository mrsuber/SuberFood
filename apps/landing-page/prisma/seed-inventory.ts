import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding inventory data...')

  // Create Inventory Items
  const flour = await prisma.inventoryItem.create({
    data: {
      name: 'All-Purpose Flour',
      category: 'FLOUR_GRAIN',
      unit: 'KG',
      currentStock: 25,
      minimumStock: 50,
      maximumStock: 200,
      reorderPoint: 40,
      reorderQuantity: 100,
      costPerUnit: 2.50,
      supplier: 'Grain Mills Inc',
      storageLocation: 'Pantry A',
      description: 'Premium all-purpose flour for baking',
    },
  })

  const sugar = await prisma.inventoryItem.create({
    data: {
      name: 'Granulated Sugar',
      category: 'SUGAR_SWEETENER',
      unit: 'KG',
      currentStock: 80,
      minimumStock: 30,
      maximumStock: 150,
      reorderPoint: 35,
      reorderQuantity: 75,
      costPerUnit: 1.80,
      supplier: 'Sweet Supply Co',
      storageLocation: 'Pantry A',
      description: 'Fine granulated white sugar',
    },
  })

  const chocolate = await prisma.inventoryItem.create({
    data: {
      name: 'Dark Chocolate (70%)',
      category: 'CHOCOLATE_COCOA',
      unit: 'KG',
      currentStock: 5,
      minimumStock: 10,
      maximumStock: 50,
      reorderPoint: 8,
      reorderQuantity: 20,
      costPerUnit: 12.50,
      supplier: 'Cocoa Traders',
      storageLocation: 'Pantry B',
      description: '70% cocoa dark chocolate for baking',
    },
  })

  const eggs = await prisma.inventoryItem.create({
    data: {
      name: 'Fresh Eggs',
      category: 'EGGS',
      unit: 'PCS',
      currentStock: 120,
      minimumStock: 100,
      maximumStock: 500,
      reorderPoint: 120,
      reorderQuantity: 200,
      costPerUnit: 0.30,
      supplier: 'Farm Fresh Eggs',
      storageLocation: 'Fridge 1',
      description: 'Grade A large eggs',
    },
  })

  const milk = await prisma.inventoryItem.create({
    data: {
      name: 'Whole Milk',
      category: 'DAIRY',
      unit: 'L',
      currentStock: 15,
      minimumStock: 20,
      maximumStock: 100,
      reorderPoint: 18,
      reorderQuantity: 50,
      costPerUnit: 1.50,
      supplier: 'Dairy Best',
      storageLocation: 'Fridge 2',
      description: 'Fresh whole milk 3.5% fat',
    },
  })

  const vanilla = await prisma.inventoryItem.create({
    data: {
      name: 'Vanilla Extract',
      category: 'BAKING_SUPPLIES',
      unit: 'ML',
      currentStock: 0,
      minimumStock: 500,
      maximumStock: 2000,
      reorderPoint: 400,
      reorderQuantity: 1000,
      costPerUnit: 0.05,
      supplier: 'Flavor House',
      storageLocation: 'Pantry B',
      description: 'Pure vanilla extract',
    },
  })

  const butter = await prisma.inventoryItem.create({
    data: {
      name: 'Unsalted Butter',
      category: 'DAIRY',
      unit: 'KG',
      currentStock: 12,
      minimumStock: 15,
      maximumStock: 75,
      reorderPoint: 18,
      reorderQuantity: 30,
      costPerUnit: 8.50,
      supplier: 'Dairy Best',
      storageLocation: 'Fridge 2',
      description: 'Premium unsalted butter',
    },
  })

  const bakingPowder = await prisma.inventoryItem.create({
    data: {
      name: 'Baking Powder',
      category: 'BAKING_SUPPLIES',
      unit: 'G',
      currentStock: 800,
      minimumStock: 500,
      maximumStock: 3000,
      reorderPoint: 600,
      reorderQuantity: 1500,
      costPerUnit: 0.015,
      supplier: 'Baking Essentials',
      storageLocation: 'Pantry B',
      description: 'Double-acting baking powder',
    },
  })

  const cocoa = await prisma.inventoryItem.create({
    data: {
      name: 'Cocoa Powder',
      category: 'CHOCOLATE_COCOA',
      unit: 'G',
      currentStock: 1500,
      minimumStock: 1000,
      maximumStock: 5000,
      reorderPoint: 1200,
      reorderQuantity: 2500,
      costPerUnit: 0.025,
      supplier: 'Cocoa Traders',
      storageLocation: 'Pantry B',
      description: 'Dutch-process cocoa powder',
    },
  })

  const bananas = await prisma.inventoryItem.create({
    data: {
      name: 'Bananas',
      category: 'FRUITS',
      unit: 'KG',
      currentStock: 8,
      minimumStock: 5,
      maximumStock: 25,
      reorderPoint: 6,
      reorderQuantity: 15,
      costPerUnit: 2.20,
      supplier: 'Fresh Fruit Market',
      storageLocation: 'Counter',
      description: 'Ripe bananas for baking',
    },
  })

  console.log('✅ Created 10 inventory items')

  // Get menu items if they exist (you may need to create these first)
  console.log('🔍 Looking for menu items...')

  // For demo purposes, we'll create recipes manually if menu items don't exist
  // In production, you'd link to actual menu items from your restaurants

  console.log('✅ Inventory seeding complete!')
  console.log('\nCreated items:')
  console.log('- All-Purpose Flour (25 KG) - LOW STOCK')
  console.log('- Granulated Sugar (80 KG)')
  console.log('- Dark Chocolate (5 KG) - CRITICAL')
  console.log('- Fresh Eggs (120 PCS)')
  console.log('- Whole Milk (15 L) - LOW STOCK')
  console.log('- Vanilla Extract (0 ML) - OUT OF STOCK')
  console.log('- Unsalted Butter (12 KG) - LOW STOCK')
  console.log('- Baking Powder (800 G)')
  console.log('- Cocoa Powder (1500 G)')
  console.log('- Bananas (8 KG)')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
