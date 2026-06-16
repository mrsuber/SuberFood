import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function main() {
  console.log('🥚 Starting to seed egg recipes...')

  // Find a restaurant first (categories are restaurant-specific)
  let restaurant = await prisma.restaurant.findFirst({
    where: { status: 'OPEN' },
  })

  if (!restaurant) {
    console.log('Creating default restaurant...')
    restaurant = await prisma.restaurant.create({
      data: {
        name: 'SuberFood Main Kitchen',
        slug: 'suberfood-main',
        type: 'FINE_DINING',
        address: 'Main Location',
        city: 'Central',
        state: 'Province',
        postalCode: '00000',
        phone: '123-456-7890',
        email: 'info@suberfoods.com',
        status: 'OPEN',
        capacity: 100,
        rating: 5.0,
        privateRooms: false,
        outdoorSeating: false,
        isMainBranch: true,
      },
    })
  }

  console.log('✓ Using restaurant:', restaurant.name)

  // First, find or create a Breakfast category
  let breakfastCategory = await prisma.menuCategory.findFirst({
    where: {
      name: 'Breakfast',
      restaurantId: restaurant.id,
    },
  })

  if (!breakfastCategory) {
    console.log('Creating Breakfast category...')
    breakfastCategory = await prisma.menuCategory.create({
      data: {
        name: 'Breakfast',
        description: 'Morning meals and breakfast items',
        displayOrder: 1,
        isActive: true,
        restaurantId: restaurant.id,
      },
    })
  }

  console.log('✓ Breakfast category ready:', breakfastCategory.id)

  // Find the eggs inventory item
  const eggsItem = await prisma.inventoryItem.findFirst({
    where: {
      name: {
        contains: 'eggs',
        mode: 'insensitive',
      },
    },
  })

  if (!eggsItem) {
    console.error('❌ No eggs found in inventory! Please add eggs first.')
    return
  }

  console.log('✓ Found eggs in inventory:', eggsItem.name)

  // Find other common ingredients
  const flour = await prisma.inventoryItem.findFirst({
    where: { name: { contains: 'flour', mode: 'insensitive' } },
  })

  const milk = await prisma.inventoryItem.findFirst({
    where: { name: { contains: 'milk', mode: 'insensitive' } },
  })

  const sugar = await prisma.inventoryItem.findFirst({
    where: { name: { contains: 'sugar', mode: 'insensitive' } },
  })

  // Egg recipes data
  const eggRecipes = [
    {
      menuItem: {
        name: 'Scrambled Eggs',
        description: 'Fluffy scrambled eggs cooked to perfection',
        price: 500,
        category: 'Breakfast',
      },
      recipe: {
        servingSize: 1,
        prepTime: 2,
        cookTime: 3,
        instructions: '1. Beat eggs in a bowl\n2. Heat butter in pan\n3. Pour eggs and stir gently\n4. Cook until fluffy',
        ingredients: [
          { item: eggsItem, quantity: 2, unit: eggsItem.unit },
          ...(milk ? [{ item: milk, quantity: 0.05, unit: milk.unit }] : []),
        ],
      },
    },
    {
      menuItem: {
        name: 'Fried Eggs (Sunny Side Up)',
        description: 'Classic fried eggs with runny yolk',
        price: 400,
        category: 'Breakfast',
      },
      recipe: {
        servingSize: 1,
        prepTime: 1,
        cookTime: 3,
        instructions: '1. Heat oil in pan\n2. Crack eggs into pan\n3. Cook until whites are set\n4. Season with salt and pepper',
        ingredients: [{ item: eggsItem, quantity: 2, unit: eggsItem.unit }],
      },
    },
    {
      menuItem: {
        name: 'Boiled Eggs',
        description: 'Perfectly boiled eggs - hard or soft',
        price: 300,
        category: 'Breakfast',
      },
      recipe: {
        servingSize: 1,
        prepTime: 1,
        cookTime: 8,
        instructions: '1. Place eggs in pot\n2. Cover with cold water\n3. Bring to boil\n4. Cook 6-8 minutes\n5. Cool in ice water',
        ingredients: [{ item: eggsItem, quantity: 2, unit: eggsItem.unit }],
      },
    },
    {
      menuItem: {
        name: 'Cheese Omelette',
        description: 'Fluffy omelette filled with melted cheese',
        price: 750,
        category: 'Breakfast',
      },
      recipe: {
        servingSize: 1,
        prepTime: 3,
        cookTime: 5,
        instructions:
          '1. Beat eggs with milk\n2. Heat butter in pan\n3. Pour eggs and let set\n4. Add cheese and fold\n5. Serve hot',
        ingredients: [
          { item: eggsItem, quantity: 3, unit: eggsItem.unit },
          ...(milk ? [{ item: milk, quantity: 0.05, unit: milk.unit }] : []),
        ],
      },
    },
    {
      menuItem: {
        name: 'Egg Sandwich',
        description: 'Fried egg sandwich on toasted bread',
        price: 600,
        category: 'Breakfast',
      },
      recipe: {
        servingSize: 1,
        prepTime: 3,
        cookTime: 5,
        instructions: '1. Fry eggs\n2. Toast bread\n3. Assemble sandwich with eggs\n4. Add condiments as desired',
        ingredients: [{ item: eggsItem, quantity: 2, unit: eggsItem.unit }],
      },
    },
  ]

  // Create menu items and recipes
  for (const recipeData of eggRecipes) {
    console.log(`\n📝 Creating: ${recipeData.menuItem.name}`)

    // Check if menu item already exists
    let menuItem = await prisma.menuItem.findFirst({
      where: { name: recipeData.menuItem.name },
    })

    if (!menuItem) {
      // Create menu item
      menuItem = await prisma.menuItem.create({
        data: {
          name: recipeData.menuItem.name,
          description: recipeData.menuItem.description,
          price: recipeData.menuItem.price,
          categoryId: breakfastCategory.id,
          isAvailable: true,
        },
      })
      console.log(`  ✓ Created menu item: ${menuItem.name}`)
    } else {
      console.log(`  → Menu item already exists: ${menuItem.name}`)
    }

    // Check if recipe already exists
    const existingRecipe = await prisma.recipe.findUnique({
      where: { menuItemId: menuItem.id },
    })

    if (existingRecipe) {
      console.log(`  → Recipe already exists, skipping...`)
      continue
    }

    // Create recipe
    const recipe = await prisma.recipe.create({
      data: {
        menuItemId: menuItem.id,
        name: recipeData.menuItem.name,
        servingSize: recipeData.recipe.servingSize,
        prepTime: recipeData.recipe.prepTime,
        cookTime: recipeData.recipe.cookTime,
        instructions: recipeData.recipe.instructions,
        isActive: true,
      },
    })
    console.log(`  ✓ Created recipe`)

    // Add ingredients to recipe
    let totalCost = 0
    for (const ingredient of recipeData.recipe.ingredients) {
      await prisma.recipeIngredient.create({
        data: {
          recipeId: recipe.id,
          inventoryItemId: ingredient.item.id,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
        },
      })

      // Calculate cost
      const ingredientCost = (ingredient.item.costPerUnit || 0) * ingredient.quantity
      totalCost += ingredientCost

      console.log(
        `    + ${ingredient.quantity} ${ingredient.unit} of ${ingredient.item.name}`
      )
    }

    // Update recipe with cost
    const costPerServing = totalCost / recipeData.recipe.servingSize
    await prisma.recipe.update({
      where: { id: recipe.id },
      data: {
        totalCost,
        costPerServing,
      },
    })

    console.log(`  ✓ Total cost: ${totalCost} FCFA (${costPerServing} FCFA/serving)`)
  }

  console.log('\n✅ Egg recipes seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding egg recipes:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
