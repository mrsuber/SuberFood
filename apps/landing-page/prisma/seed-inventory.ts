import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding inventory data...')

  // Clear existing data
  await prisma.preparationBatch.deleteMany()
  await prisma.preparationRecipeInput.deleteMany()
  await prisma.preparationRecipe.deleteMany()
  await prisma.stockMovement.deleteMany()
  await prisma.inventoryItem.deleteMany()

  console.log('🗑️  Cleared existing inventory data')

  // Create RAW Inventory Items
  const flour = await prisma.inventoryItem.create({
    data: {
      name: 'All-Purpose Flour',
      category: 'FLOUR_GRAIN',
      unit: 'KG',
      rawStock: 25,
      wipStock: 0,
      consumedStock: 0,
      totalPurchased: 25,
      minimumStock: 50,
      maximumStock: 200,
      reorderPoint: 40,
      reorderQuantity: 100,
      costPerUnit: 2.50,
      supplier: 'Grain Mills Inc',
      storageLocation: 'Pantry A',
      description: 'Premium all-purpose flour for baking',
      isCompound: false,
    },
  })

  const sugar = await prisma.inventoryItem.create({
    data: {
      name: 'Granulated Sugar',
      category: 'SUGAR_SWEETENER',
      unit: 'KG',
      rawStock: 80,
      wipStock: 0,
      consumedStock: 0,
      totalPurchased: 80,
      minimumStock: 30,
      maximumStock: 150,
      reorderPoint: 35,
      reorderQuantity: 75,
      costPerUnit: 1.80,
      supplier: 'Sweet Supply Co',
      storageLocation: 'Pantry A',
      description: 'Fine granulated white sugar',
      isCompound: false,
    },
  })

  const chocolate = await prisma.inventoryItem.create({
    data: {
      name: 'Dark Chocolate (70%)',
      category: 'CHOCOLATE_COCOA',
      unit: 'KG',
      rawStock: 5,
      wipStock: 0,
      consumedStock: 0,
      totalPurchased: 5,
      minimumStock: 10,
      maximumStock: 50,
      reorderPoint: 8,
      reorderQuantity: 20,
      costPerUnit: 12.50,
      supplier: 'Cocoa Traders',
      storageLocation: 'Pantry B',
      description: '70% cocoa dark chocolate for baking',
      isCompound: false,
    },
  })

  const eggs = await prisma.inventoryItem.create({
    data: {
      name: 'Fresh Eggs',
      category: 'EGGS',
      unit: 'PCS',
      rawStock: 120,
      wipStock: 0,
      consumedStock: 0,
      totalPurchased: 120,
      minimumStock: 100,
      maximumStock: 500,
      reorderPoint: 120,
      reorderQuantity: 200,
      costPerUnit: 0.30,
      supplier: 'Farm Fresh Eggs',
      storageLocation: 'Fridge 1',
      description: 'Grade A large eggs',
      isCompound: false,
    },
  })

  const milk = await prisma.inventoryItem.create({
    data: {
      name: 'Whole Milk',
      category: 'DAIRY',
      unit: 'L',
      rawStock: 15,
      wipStock: 0,
      consumedStock: 0,
      totalPurchased: 15,
      minimumStock: 20,
      maximumStock: 100,
      reorderPoint: 18,
      reorderQuantity: 50,
      costPerUnit: 1.50,
      supplier: 'Dairy Best',
      storageLocation: 'Fridge 2',
      description: 'Fresh whole milk 3.5% fat',
      isCompound: false,
    },
  })

  const vanilla = await prisma.inventoryItem.create({
    data: {
      name: 'Vanilla Extract',
      category: 'BAKING_SUPPLIES',
      unit: 'ML',
      rawStock: 0,
      wipStock: 0,
      consumedStock: 0,
      totalPurchased: 0,
      minimumStock: 500,
      maximumStock: 2000,
      reorderPoint: 400,
      reorderQuantity: 1000,
      costPerUnit: 0.05,
      supplier: 'Flavor House',
      storageLocation: 'Pantry B',
      description: 'Pure vanilla extract',
      isCompound: false,
    },
  })

  const butter = await prisma.inventoryItem.create({
    data: {
      name: 'Unsalted Butter',
      category: 'DAIRY',
      unit: 'KG',
      rawStock: 12,
      wipStock: 0,
      consumedStock: 0,
      totalPurchased: 12,
      minimumStock: 15,
      maximumStock: 75,
      reorderPoint: 18,
      reorderQuantity: 30,
      costPerUnit: 8.50,
      supplier: 'Dairy Best',
      storageLocation: 'Fridge 2',
      description: 'Premium unsalted butter',
      isCompound: false,
    },
  })

  const bakingPowder = await prisma.inventoryItem.create({
    data: {
      name: 'Baking Powder',
      category: 'BAKING_SUPPLIES',
      unit: 'G',
      rawStock: 800,
      wipStock: 0,
      consumedStock: 0,
      totalPurchased: 800,
      minimumStock: 500,
      maximumStock: 3000,
      reorderPoint: 600,
      reorderQuantity: 1500,
      costPerUnit: 0.015,
      supplier: 'Baking Essentials',
      storageLocation: 'Pantry B',
      description: 'Double-acting baking powder',
      isCompound: false,
    },
  })

  const cocoa = await prisma.inventoryItem.create({
    data: {
      name: 'Cocoa Powder',
      category: 'CHOCOLATE_COCOA',
      unit: 'G',
      rawStock: 1500,
      wipStock: 0,
      consumedStock: 0,
      totalPurchased: 1500,
      minimumStock: 1000,
      maximumStock: 5000,
      reorderPoint: 1200,
      reorderQuantity: 2500,
      costPerUnit: 0.025,
      supplier: 'Cocoa Traders',
      storageLocation: 'Pantry B',
      description: 'Dutch-process cocoa powder',
      isCompound: false,
    },
  })

  const bananas = await prisma.inventoryItem.create({
    data: {
      name: 'Bananas',
      category: 'FRUITS',
      unit: 'KG',
      rawStock: 8,
      wipStock: 0,
      consumedStock: 0,
      totalPurchased: 8,
      minimumStock: 5,
      maximumStock: 25,
      reorderPoint: 6,
      reorderQuantity: 15,
      costPerUnit: 2.20,
      supplier: 'Fresh Fruit Market',
      storageLocation: 'Counter',
      description: 'Ripe bananas for baking',
      isCompound: false,
    },
  })

  // Create raw ingredients for compound ingredients
  const rawBeans = await prisma.inventoryItem.create({
    data: {
      name: 'Dry Beans',
      category: 'VEGETABLES',
      unit: 'KG',
      rawStock: 10,
      wipStock: 0,
      consumedStock: 0,
      totalPurchased: 10,
      minimumStock: 5,
      maximumStock: 50,
      reorderPoint: 7,
      reorderQuantity: 20,
      costPerUnit: 3.50,
      supplier: 'Grain & Bean Co',
      storageLocation: 'Pantry A',
      description: 'Dry red kidney beans',
      isCompound: false,
    },
  })

  const salt = await prisma.inventoryItem.create({
    data: {
      name: 'Table Salt',
      category: 'SPICES_HERBS',
      unit: 'G',
      rawStock: 1000,
      wipStock: 0,
      consumedStock: 0,
      totalPurchased: 1000,
      minimumStock: 500,
      maximumStock: 5000,
      reorderPoint: 600,
      reorderQuantity: 2000,
      costPerUnit: 0.002,
      supplier: 'Spice Traders',
      storageLocation: 'Pantry A',
      description: 'Iodized table salt',
      isCompound: false,
    },
  })

  console.log('✅ Created 12 raw inventory items')

  // Create a COMPOUND ingredient (Pre-boiled Salted Beans)
  const preboiledBeans = await prisma.inventoryItem.create({
    data: {
      name: 'Pre-boiled Salted Beans',
      category: 'VEGETABLES',
      unit: 'KG',
      rawStock: 0,
      wipStock: 0,
      consumedStock: 0,
      totalPurchased: 0,
      minimumStock: 2,
      maximumStock: 10,
      costPerUnit: 0, // Calculated from inputs
      storageLocation: 'Freezer 1',
      description: 'Pre-boiled red beans with salt, ready to use',
      isCompound: true,
    },
  })

  // Create preparation recipe for pre-boiled beans
  const beansPrepRecipe = await prisma.preparationRecipe.create({
    data: {
      name: 'Pre-boiled Salted Beans',
      outputItemId: preboiledBeans.id,
      outputQuantity: 2.5,
      outputUnit: 'KG',
      prepTime: 120,
      instructions: '1. Rinse beans thoroughly\n2. Soak in water for 8 hours\n3. Drain and add fresh water\n4. Add salt\n5. Boil for 90 minutes until tender\n6. Drain and cool\n7. Store in freezer',
      storageLocation: 'Freezer 1',
      shelfLifeDays: 90,
      inputs: {
        create: [
          {
            inventoryItemId: rawBeans.id,
            quantity: 2,
            unit: 'KG',
            notes: 'Soaked overnight',
          },
          {
            inventoryItemId: salt.id,
            quantity: 50,
            unit: 'G',
            notes: 'Add during boiling',
          },
        ],
      },
    },
  })

  console.log('✅ Created 1 compound ingredient and preparation recipe')

  // Create sample menu item recipe to test order integration
  console.log('\n📋 Creating sample recipe for menu item...')

  // First check if there's a menu item we can link to
  const sampleMenuItem = await prisma.menuItem.findFirst()

  if (sampleMenuItem) {
    // Check if recipe already exists
    const existingRecipe = await prisma.recipe.findUnique({
      where: { menuItemId: sampleMenuItem.id }
    })

    if (!existingRecipe) {
      const sampleRecipe = await prisma.recipe.create({
        data: {
          menuItemId: sampleMenuItem.id,
          name: 'Sample Dish Recipe',
          servingSize: 1,
          prepTime: 15,
          cookTime: 20,
          instructions: '1. Prepare ingredients\n2. Cook\n3. Serve',
          ingredients: {
            create: [
              {
                inventoryItemId: flour.id,
                quantity: 0.5,
                unit: 'KG',
                notes: 'For the base',
              },
              {
                inventoryItemId: eggs.id,
                quantity: 2,
                unit: 'PCS',
                notes: 'For binding',
              },
              {
                inventoryItemId: sugar.id,
                quantity: 0.2,
                unit: 'KG',
                notes: 'For sweetness',
              },
            ],
          },
        },
      })
      console.log(`✅ Created sample recipe for ${sampleMenuItem.name}`)
      console.log(`   - Uses: Flour (0.5 KG), Eggs (2 PCS), Sugar (0.2 KG)`)
    } else {
      console.log(`ℹ️  Recipe already exists for ${sampleMenuItem.name}`)
    }
  } else {
    console.log('ℹ️  No menu items found, skipping recipe creation')
  }

  console.log('\n✅ Inventory seeding complete!')
  console.log('\n📦 RAW INGREDIENTS (12 items):')
  console.log('- All-Purpose Flour: 25 KG raw (LOW STOCK)')
  console.log('- Granulated Sugar: 80 KG raw')
  console.log('- Dark Chocolate: 5 KG raw (CRITICAL)')
  console.log('- Fresh Eggs: 120 PCS raw')
  console.log('- Whole Milk: 15 L raw (LOW STOCK)')
  console.log('- Vanilla Extract: 0 ML raw (OUT OF STOCK)')
  console.log('- Unsalted Butter: 12 KG raw (LOW STOCK)')
  console.log('- Baking Powder: 800 G raw')
  console.log('- Cocoa Powder: 1500 G raw')
  console.log('- Bananas: 8 KG raw')
  console.log('- Dry Beans: 10 KG raw')
  console.log('- Table Salt: 1000 G raw')

  console.log('\n🧪 COMPOUND INGREDIENTS (1 item):')
  console.log('- Pre-boiled Salted Beans: 0 KG (ready to prepare)')

  console.log('\n📋 PREPARATION RECIPES:')
  console.log('- Pre-boiled Salted Beans (requires 2 KG beans + 50 G salt → produces 2.5 KG)')

  console.log('\n💡 Next steps:')
  console.log('1. Use /admin/inventory/prepare to bulk-prepare compound ingredients')
  console.log('2. Raw ingredients will move to WIP state when prepared')
  console.log('3. WIP ingredients will move to CONSUMED when served to customers')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
