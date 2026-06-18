import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding menu test data with recipes and nutrition...')

  // Get the first restaurant (assuming one exists)
  let restaurant = await prisma.restaurant.findFirst({
    where: { status: 'OPEN' }
  })

  if (!restaurant) {
    console.log('📍 Creating test restaurant...')
    restaurant = await prisma.restaurant.create({
      data: {
        name: 'SuberFood Main Kitchen',
        address: '123 Food Street, Yaounde',
        phone: '+237 6 12 34 56 78',
        email: 'kitchen@suberfood.com',
        status: 'OPEN',
        latitude: 3.8480,
        longitude: 11.5021,
      }
    })
  }

  // Get or create inventory items
  console.log('📦 Setting up inventory items...')

  const inventoryItems = []
  const itemsToCreate = [
    { name: 'Chicken Breast', unit: 'kg', rawStock: 50, category: 'PROTEIN' },
    { name: 'Eggs', unit: 'pieces', rawStock: 200, category: 'PROTEIN' },
    { name: 'Bread', unit: 'loaves', rawStock: 30, category: 'GRAIN' },
    { name: 'Tomatoes', unit: 'kg', rawStock: 25, category: 'VEGETABLE' },
    { name: 'Lettuce', unit: 'heads', rawStock: 40, category: 'VEGETABLE' },
    { name: 'Cheese', unit: 'kg', rawStock: 15, category: 'DAIRY' },
    { name: 'Rice', unit: 'kg', rawStock: 100, category: 'GRAIN' },
    { name: 'Beef', unit: 'kg', rawStock: 40, category: 'PROTEIN' },
    { name: 'Pasta', unit: 'kg', rawStock: 50, category: 'GRAIN' },
    { name: 'Olive Oil', unit: 'liters', rawStock: 20, category: 'OIL' },
  ]

  for (const item of itemsToCreate) {
    const existing = await prisma.inventoryItem.findFirst({
      where: { name: item.name, restaurantId: restaurant.id }
    })

    if (existing) {
      inventoryItems.push(existing)
    } else {
      const created = await prisma.inventoryItem.create({
        data: {
          ...item,
          restaurantId: restaurant.id,
          costPerUnit: 1000,
          reorderLevel: 10,
          isActive: true,
        }
      })
      inventoryItems.push(created)
    }
  }

  // Create categories
  console.log('📂 Creating menu categories...')

  const categories = []
  const categoriesToCreate = ['Breakfast', 'Main Course', 'Salads', 'Pasta Dishes']

  for (let i = 0; i < categoriesToCreate.length; i++) {
    const existing = await prisma.menuCategory.findFirst({
      where: { name: categoriesToCreate[i], restaurantId: restaurant.id }
    })

    if (!existing) {
      const category = await prisma.menuCategory.create({
        data: {
          name: categoriesToCreate[i],
          restaurantId: restaurant.id,
          displayOrder: i,
          isActive: true,
        }
      })
      categories.push(category)
    } else {
      categories.push(existing)
    }
  }

  // Sample image URLs (placeholder images)
  const sampleImages = {
    omelette: [
      'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800',
      'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800',
      'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=800',
    ],
    grilledChicken: [
      'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800',
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800',
      'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800',
    ],
    caesarSalad: [
      'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
    ],
    pastaCarbon: [
      'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800',
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
      'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800',
    ],
  }

  // Create menu items with recipes and nutrition
  console.log('🍳 Creating menu items with recipes...')

  // 1. Cheese Omelette
  console.log('  - Creating Cheese Omelette...')
  const omelette = await prisma.menuItem.create({
    data: {
      name: 'Classic Cheese Omelette',
      categoryId: categories[0].id,
      description: 'Fluffy eggs with melted cheese, served with toasted bread',
      price: 2500,
      salePrice: 2200,
      image: sampleImages.omelette[0],
      images: sampleImages.omelette,
      isAvailable: true,
      isVegetarian: true,
      preparationTime: 15,
      allergens: ['eggs', 'dairy'],
      isChefRecommended: true,
      recipe: {
        create: {
          name: 'Classic Cheese Omelette',
          servingSize: 1,
          prepTime: 10,
          cookTime: 5,
          instructions: `1. Crack 3 eggs into a bowl and whisk until smooth
2. Heat butter in a non-stick pan over medium heat
3. Pour eggs into pan and let cook for 2 minutes
4. Add grated cheese to one half of the omelette
5. Fold omelette in half and cook for another minute
6. Serve hot with toasted bread`,
          calories: 380,
          protein: '24',
          carbs: '8',
          fat: '28',
          fiber: '0',
          sodium: '520',
          sugar: '2',
          ingredients: {
            create: [
              {
                inventoryItemId: inventoryItems.find(i => i.name === 'Eggs')!.id,
                quantity: 3,
                unit: 'pieces',
                notes: 'Large eggs',
              },
              {
                inventoryItemId: inventoryItems.find(i => i.name === 'Cheese')!.id,
                quantity: 0.05,
                unit: 'kg',
                notes: 'Grated cheddar',
              },
              {
                inventoryItemId: inventoryItems.find(i => i.name === 'Bread')!.id,
                quantity: 0.1,
                unit: 'loaves',
                notes: '2 slices',
              },
            ],
          },
        },
      },
    },
  })

  // 2. Grilled Chicken
  console.log('  - Creating Grilled Chicken...')
  const chicken = await prisma.menuItem.create({
    data: {
      name: 'Herb Grilled Chicken',
      categoryId: categories[1].id,
      description: 'Tender chicken breast marinated in herbs, served with rice and vegetables',
      price: 5500,
      image: sampleImages.grilledChicken[0],
      images: sampleImages.grilledChicken,
      isAvailable: true,
      isGlutenFree: true,
      preparationTime: 35,
      spiceLevel: 2,
      allergens: [],
      isPopular: true,
      recipe: {
        create: {
          name: 'Herb Grilled Chicken',
          servingSize: 1,
          prepTime: 20,
          cookTime: 15,
          instructions: `1. Marinate chicken breast with olive oil, garlic, rosemary, and thyme
2. Let marinate for at least 15 minutes
3. Preheat grill to medium-high heat
4. Grill chicken for 6-7 minutes per side until internal temp reaches 165°F
5. Let rest for 5 minutes before slicing
6. Serve with steamed rice and grilled vegetables`,
          calories: 520,
          protein: '48',
          carbs: '42',
          fat: '14',
          fiber: '3',
          sodium: '680',
          sugar: '2',
          ingredients: {
            create: [
              {
                inventoryItemId: inventoryItems.find(i => i.name === 'Chicken Breast')!.id,
                quantity: 0.25,
                unit: 'kg',
                notes: 'Boneless, skinless',
              },
              {
                inventoryItemId: inventoryItems.find(i => i.name === 'Rice')!.id,
                quantity: 0.15,
                unit: 'kg',
                notes: 'White rice',
              },
              {
                inventoryItemId: inventoryItems.find(i => i.name === 'Olive Oil')!.id,
                quantity: 0.02,
                unit: 'liters',
              },
            ],
          },
        },
      },
    },
  })

  // 3. Caesar Salad
  console.log('  - Creating Caesar Salad...')
  const salad = await prisma.menuItem.create({
    data: {
      name: 'Classic Caesar Salad',
      categoryId: categories[2].id,
      description: 'Crispy romaine lettuce with parmesan, croutons, and Caesar dressing',
      price: 3200,
      image: sampleImages.caesarSalad[0],
      images: sampleImages.caesarSalad,
      isAvailable: true,
      isVegetarian: true,
      preparationTime: 10,
      allergens: ['dairy', 'gluten'],
      isSeasonal: true,
      recipe: {
        create: {
          name: 'Classic Caesar Salad',
          servingSize: 1,
          prepTime: 10,
          cookTime: 0,
          instructions: `1. Wash and dry lettuce thoroughly
2. Tear lettuce into bite-sized pieces
3. Add croutons and grated parmesan
4. Drizzle with Caesar dressing
5. Toss gently to combine
6. Serve immediately`,
          calories: 280,
          protein: '12',
          carbs: '18',
          fat: '18',
          fiber: '4',
          sodium: '720',
          sugar: '3',
          ingredients: {
            create: [
              {
                inventoryItemId: inventoryItems.find(i => i.name === 'Lettuce')!.id,
                quantity: 1,
                unit: 'heads',
                notes: 'Romaine lettuce',
              },
              {
                inventoryItemId: inventoryItems.find(i => i.name === 'Cheese')!.id,
                quantity: 0.03,
                unit: 'kg',
                notes: 'Parmesan',
              },
              {
                inventoryItemId: inventoryItems.find(i => i.name === 'Bread')!.id,
                quantity: 0.05,
                unit: 'loaves',
                notes: 'For croutons',
              },
            ],
          },
        },
      },
    },
  })

  // 4. Pasta Carbonara
  console.log('  - Creating Pasta Carbonara...')
  const pasta = await prisma.menuItem.create({
    data: {
      name: 'Creamy Pasta Carbonara',
      categoryId: categories[3].id,
      description: 'Traditional Italian pasta with eggs, cheese, and crispy bacon',
      price: 4800,
      salePrice: 4200,
      image: sampleImages.pastaCarbon[0],
      images: sampleImages.pastaCarbon,
      isAvailable: true,
      preparationTime: 25,
      spiceLevel: 1,
      allergens: ['eggs', 'dairy', 'gluten'],
      isChefRecommended: true,
      isPopular: true,
      recipe: {
        create: {
          name: 'Creamy Pasta Carbonara',
          servingSize: 1,
          prepTime: 10,
          cookTime: 15,
          instructions: `1. Cook pasta in salted boiling water until al dente
2. While pasta cooks, whisk eggs with grated parmesan
3. Fry bacon until crispy, set aside
4. Drain pasta, reserving 1 cup pasta water
5. Remove pan from heat, add pasta to bacon
6. Quickly stir in egg mixture, adding pasta water to create creamy sauce
7. Season with black pepper and serve immediately`,
          calories: 650,
          protein: '28',
          carbs: '78',
          fat: '24',
          fiber: '4',
          sodium: '880',
          sugar: '4',
          ingredients: {
            create: [
              {
                inventoryItemId: inventoryItems.find(i => i.name === 'Pasta')!.id,
                quantity: 0.15,
                unit: 'kg',
                notes: 'Spaghetti or fettuccine',
              },
              {
                inventoryItemId: inventoryItems.find(i => i.name === 'Eggs')!.id,
                quantity: 2,
                unit: 'pieces',
              },
              {
                inventoryItemId: inventoryItems.find(i => i.name === 'Cheese')!.id,
                quantity: 0.04,
                unit: 'kg',
                notes: 'Parmesan',
              },
            ],
          },
        },
      },
    },
  })

  console.log('✅ Seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`  - Restaurant: ${restaurant.name}`)
  console.log(`  - Inventory Items: ${inventoryItems.length}`)
  console.log(`  - Categories: ${categories.length}`)
  console.log(`  - Menu Items with Recipes: 4`)
  console.log('\n🧪 Test Features:')
  console.log('  ✓ Menu items with multiple gallery images')
  console.log('  ✓ Recipes with full nutritional information')
  console.log('  ✓ Recipes with cooking instructions')
  console.log('  ✓ Recipes with inventory-tracked ingredients')
  console.log('  ✓ Various dietary tags (vegetarian, gluten-free)')
  console.log('  ✓ Sales prices and chef recommendations')
  console.log('\n👉 Try creating a new menu item using one of these recipes!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
