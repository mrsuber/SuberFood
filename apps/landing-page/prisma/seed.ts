import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean existing data (optional - comment out if you want to preserve existing data)
  console.log('🗑️  Cleaning existing data...')
  await prisma.orderItem.deleteMany()
  await prisma.orderPreparation.deleteMany()
  await prisma.order.deleteMany()
  await prisma.reservation.deleteMany()
  await prisma.recipeIngredient.deleteMany()
  await prisma.recipe.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.menuCategory.deleteMany()
  await prisma.stockMovement.deleteMany()
  await prisma.inventoryItem.deleteMany()
  await prisma.maintenanceLog.deleteMany()
  await prisma.equipment.deleteMany()
  await prisma.staff.deleteMany()
  await prisma.table.deleteMany()
  await prisma.restaurant.deleteMany()
  await prisma.user.deleteMany()

  // Create Admin User
  console.log('👤 Creating admin user...')
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@suberfoods.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  // Create Customer Users
  console.log('👥 Creating customer users...')
  const customerPassword = await bcrypt.hash('password123', 10)
  const customers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        password: customerPassword,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        password: customerPassword,
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1234567891',
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    }),
  ])

  // Create Restaurant Locations
  console.log('🏢 Creating restaurant locations...')
  const downtown = await prisma.restaurant.create({
    data: {
      name: 'SuberFood Downtown',
      slug: 'suberfood-downtown',
      type: 'CLASSICAL_FINE_DINING',
      description: 'Our flagship fine dining location in the heart of the city',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      phone: '+1-212-555-0001',
      email: 'downtown@suberfoods.com',
      status: 'OPEN',
      openingTime: '11:00',
      closingTime: '23:00',
      capacity: 80,
      rating: 4.8,
      parkingInfo: 'Valet parking available',
      story: 'Established in 2020, our downtown location brings farm-to-table excellence to the city center.',
      privateRooms: true,
      outdoorSeating: true,
      branchCode: 'NYC-001',
      isMainBranch: true,
    },
  })

  const uptown = await prisma.restaurant.create({
    data: {
      name: 'SuberFood Uptown',
      slug: 'suberfood-uptown',
      type: 'CAFETERIA',
      description: 'Quick service cafeteria-style dining for busy professionals',
      address: '456 Park Avenue',
      city: 'New York',
      state: 'NY',
      postalCode: '10022',
      phone: '+1-212-555-0002',
      email: 'uptown@suberfoods.com',
      status: 'OPEN',
      openingTime: '08:00',
      closingTime: '20:00',
      capacity: 50,
      rating: 4.5,
      parkingInfo: 'Street parking available',
      story: 'Opened in 2021 to serve the uptown community with healthy, fast food options.',
      privateRooms: false,
      outdoorSeating: false,
      branchCode: 'NYC-002',
      isMainBranch: false,
    },
  })

  const brooklynClosed = await prisma.restaurant.create({
    data: {
      name: 'SuberFood Brooklyn (Temporarily Closed)',
      slug: 'suberfood-brooklyn',
      type: 'QUICK_SERVICE',
      description: 'Quick service location undergoing renovations',
      address: '789 Brooklyn Avenue',
      city: 'Brooklyn',
      state: 'NY',
      postalCode: '11201',
      phone: '+1-718-555-0003',
      email: 'brooklyn@suberfoods.com',
      status: 'TEMPORARILY_CLOSED',
      openingTime: '10:00',
      closingTime: '21:00',
      capacity: 40,
      rating: 4.3,
      parkingInfo: 'Parking lot available',
      story: 'Currently undergoing renovations to better serve our community.',
      privateRooms: false,
      outdoorSeating: true,
      branchCode: 'BK-001',
      isMainBranch: false,
    },
  })

  // Create Tables for Restaurants
  console.log('🪑 Creating tables...')
  const downtownTables = await Promise.all([
    ...Array.from({ length: 15 }, (_, i) =>
      prisma.table.create({
        data: {
          restaurantId: downtown.id,
          tableNumber: `T${(i + 1).toString().padStart(2, '0')}`,
          capacity: i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
          isAvailable: true,
        },
      })
    ),
  ])

  // Create Staff Members
  console.log('👨‍🍳 Creating staff members...')
  const chefPassword = await bcrypt.hash('chef123', 10)

  const chef1User = await prisma.user.create({
    data: {
      email: 'chef.james@suberfoods.com',
      password: chefPassword,
      firstName: 'James',
      lastName: 'Wilson',
      phone: '+1234567892',
      role: 'RESTAURANT_STAFF',
      status: 'ACTIVE',
    },
  })

  const chef1 = await prisma.staff.create({
    data: {
      userId: chef1User.id,
      restaurantId: downtown.id,
      role: 'CHEF',
      status: 'ACTIVE',
      employeeId: 'EMP-001',
      hireDate: new Date('2020-06-01'),
      salary: 65000,
      workSchedule: {
        monday: ['09:00-17:00'],
        tuesday: ['09:00-17:00'],
        wednesday: ['09:00-17:00'],
        thursday: ['09:00-17:00'],
        friday: ['09:00-17:00'],
      },
    },
  })

  const waiter1User = await prisma.user.create({
    data: {
      email: 'waiter.sarah@suberfoods.com',
      password: chefPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+1234567893',
      role: 'RESTAURANT_STAFF',
      status: 'ACTIVE',
    },
  })

  const waiter1 = await prisma.staff.create({
    data: {
      userId: waiter1User.id,
      restaurantId: downtown.id,
      role: 'WAITER',
      status: 'ACTIVE',
      employeeId: 'EMP-002',
      hireDate: new Date('2021-03-15'),
      hourlyRate: 18.5,
      workSchedule: {
        monday: ['11:00-19:00'],
        tuesday: ['11:00-19:00'],
        friday: ['17:00-23:00'],
        saturday: ['17:00-23:00'],
        sunday: ['11:00-19:00'],
      },
    },
  })

  const manager1User = await prisma.user.create({
    data: {
      email: 'manager.uptow@suberfoods.com',
      password: chefPassword,
      firstName: 'Michael',
      lastName: 'Brown',
      phone: '+1234567894',
      role: 'RESTAURANT_MANAGER',
      status: 'ACTIVE',
    },
  })

  const manager1 = await prisma.staff.create({
    data: {
      userId: manager1User.id,
      restaurantId: uptown.id,
      role: 'MANAGER',
      status: 'ACTIVE',
      employeeId: 'EMP-003',
      hireDate: new Date('2021-01-10'),
      salary: 75000,
    },
  })

  // Create Equipment
  console.log('🔧 Creating equipment...')
  const equipment = await Promise.all([
    prisma.equipment.create({
      data: {
        restaurantId: downtown.id,
        name: 'Industrial Oven',
        type: 'COOKING_APPLIANCE',
        status: 'OPERATIONAL',
        manufacturer: 'KitchenPro',
        model: 'KP-5000',
        serialNumber: 'SN-12345',
        purchaseDate: new Date('2020-05-15'),
        purchasePrice: 8500,
        lastMaintenanceDate: new Date('2024-11-01'),
        nextMaintenanceDate: new Date('2025-02-01'),
      },
    }),
    prisma.equipment.create({
      data: {
        restaurantId: downtown.id,
        name: 'Walk-in Refrigerator',
        type: 'REFRIGERATION',
        status: 'OPERATIONAL',
        manufacturer: 'CoolMaster',
        model: 'CM-300',
        serialNumber: 'SN-67890',
        purchaseDate: new Date('2020-05-20'),
        purchasePrice: 12000,
        lastMaintenanceDate: new Date('2024-10-15'),
        nextMaintenanceDate: new Date('2025-01-15'),
      },
    }),
    prisma.equipment.create({
      data: {
        restaurantId: downtown.id,
        name: 'Commercial Mixer',
        type: 'FOOD_PREP',
        status: 'OPERATIONAL',
        manufacturer: 'MixPro',
        model: 'MP-200',
        serialNumber: 'SN-11223',
        purchaseDate: new Date('2021-02-10'),
        purchasePrice: 1500,
      },
    }),
    prisma.equipment.create({
      data: {
        restaurantId: uptown.id,
        name: 'Gas Range Stove',
        type: 'COOKING_APPLIANCE',
        status: 'MAINTENANCE_REQUIRED',
        manufacturer: 'KitchenPro',
        model: 'KP-3000',
        serialNumber: 'SN-44556',
        purchaseDate: new Date('2021-06-01'),
        purchasePrice: 3500,
        lastMaintenanceDate: new Date('2024-09-01'),
      },
    }),
  ])

  // Create Inventory Items
  console.log('📦 Creating inventory items...')
  const flour = await prisma.inventoryItem.create({
    data: {
      restaurantId: downtown.id,
      name: 'All-Purpose Flour',
      category: 'FLOUR_GRAIN',
      unit: 'KG',
      rawStock: 50,
      minimumStock: 20,
      costPerUnit: 2.5,
      supplier: 'Local Mill Co.',
      storageLocation: 'Pantry A',
    },
  })

  const chicken = await prisma.inventoryItem.create({
    data: {
      restaurantId: downtown.id,
      name: 'Chicken Breast',
      category: 'POULTRY',
      unit: 'KG',
      rawStock: 30,
      minimumStock: 15,
      costPerUnit: 8.5,
      supplier: 'Fresh Farms Inc.',
      storageLocation: 'Walk-in Fridge',
    },
  })

  const tomatoes = await prisma.inventoryItem.create({
    data: {
      restaurantId: downtown.id,
      name: 'Fresh Tomatoes',
      category: 'VEGETABLES',
      unit: 'KG',
      rawStock: 25,
      minimumStock: 10,
      costPerUnit: 3.2,
      supplier: 'Green Valley Produce',
      storageLocation: 'Produce Cooler',
    },
  })

  const oliveoil = await prisma.inventoryItem.create({
    data: {
      restaurantId: downtown.id,
      name: 'Extra Virgin Olive Oil',
      category: 'OILS_FATS',
      unit: 'L',
      rawStock: 15,
      minimumStock: 5,
      costPerUnit: 12.0,
      supplier: 'Mediterranean Imports',
      storageLocation: 'Pantry B',
    },
  })

  const basil = await prisma.inventoryItem.create({
    data: {
      restaurantId: downtown.id,
      name: 'Fresh Basil',
      category: 'SPICES_HERBS',
      unit: 'G',
      rawStock: 500,
      minimumStock: 200,
      costPerUnit: 0.05,
      supplier: 'Herb Gardens LLC',
      storageLocation: 'Herb Fridge',
    },
  })

  const cheese = await prisma.inventoryItem.create({
    data: {
      restaurantId: downtown.id,
      name: 'Parmesan Cheese',
      category: 'DAIRY',
      unit: 'KG',
      rawStock: 10,
      minimumStock: 3,
      costPerUnit: 18.0,
      supplier: 'Artisan Cheese Co.',
      storageLocation: 'Cheese Fridge',
    },
  })

  // Uptown location inventory
  const rice = await prisma.inventoryItem.create({
    data: {
      restaurantId: uptown.id,
      name: 'Jasmine Rice',
      category: 'FLOUR_GRAIN',
      unit: 'KG',
      rawStock: 40,
      minimumStock: 15,
      costPerUnit: 3.5,
      supplier: 'Asian Market Wholesale',
      storageLocation: 'Dry Storage',
    },
  })

  const beef = await prisma.inventoryItem.create({
    data: {
      restaurantId: uptown.id,
      name: 'Ground Beef',
      category: 'MEAT',
      unit: 'KG',
      rawStock: 20,
      minimumStock: 10,
      costPerUnit: 10.5,
      supplier: 'Prime Meats Co.',
      storageLocation: 'Meat Freezer',
    },
  })

  // Create Menu Categories
  console.log('📋 Creating menu categories...')
  const appetizers = await prisma.menuCategory.create({
    data: {
      restaurantId: downtown.id,
      name: 'Appetizers',
      description: 'Start your meal with our delicious starters',
      displayOrder: 1,
    },
  })

  const mains = await prisma.menuCategory.create({
    data: {
      restaurantId: downtown.id,
      name: 'Main Courses',
      description: 'Our signature entrees',
      displayOrder: 2,
    },
  })

  const desserts = await prisma.menuCategory.create({
    data: {
      restaurantId: downtown.id,
      name: 'Desserts',
      description: 'Sweet endings to your perfect meal',
      displayOrder: 3,
    },
  })

  const uptownQuick = await prisma.menuCategory.create({
    data: {
      restaurantId: uptown.id,
      name: 'Quick Bowls',
      description: 'Healthy and fast bowl options',
      displayOrder: 1,
    },
  })

  const uptownSandwiches = await prisma.menuCategory.create({
    data: {
      restaurantId: uptown.id,
      name: 'Sandwiches',
      description: 'Fresh made-to-order sandwiches',
      displayOrder: 2,
    },
  })

  // Create Menu Items
  console.log('🍽️ Creating menu items...')
  const grilledChicken = await prisma.menuItem.create({
    data: {
      categoryId: mains.id,
      name: 'Grilled Herb Chicken',
      description: 'Tender chicken breast marinated in fresh herbs, served with seasonal vegetables',
      price: 24.99,
      isAvailable: true,
      isVegetarian: false,
      isGlutenFree: true,
      calories: 450,
      preparationTime: 25,
      allergens: ['dairy'],
      isChefRecommended: true,
      isPopular: true,
      averageRating: 4.7,
      reviewCount: 128,
    },
  })

  const capreseSalad = await prisma.menuItem.create({
    data: {
      categoryId: appetizers.id,
      name: 'Caprese Salad',
      description: 'Fresh mozzarella, tomatoes, and basil drizzled with balsamic reduction',
      price: 12.99,
      isAvailable: true,
      isVegetarian: true,
      isGlutenFree: true,
      calories: 220,
      preparationTime: 10,
      allergens: ['dairy'],
      isPopular: true,
      averageRating: 4.5,
      reviewCount: 89,
    },
  })

  const tiramisu = await prisma.menuItem.create({
    data: {
      categoryId: desserts.id,
      name: 'Classic Tiramisu',
      description: 'Layered espresso-soaked ladyfingers with mascarpone cream',
      price: 9.99,
      isAvailable: true,
      isVegetarian: true,
      calories: 380,
      preparationTime: 5,
      allergens: ['dairy', 'eggs', 'gluten'],
      isChefRecommended: true,
      averageRating: 4.9,
      reviewCount: 156,
    },
  })

  const chickenBowl = await prisma.menuItem.create({
    data: {
      categoryId: uptownQuick.id,
      name: 'Teriyaki Chicken Bowl',
      description: 'Grilled chicken over jasmine rice with vegetables and teriyaki sauce',
      price: 13.99,
      isAvailable: true,
      preparationTime: 12,
      calories: 520,
      isPopular: true,
      averageRating: 4.4,
      reviewCount: 67,
    },
  })

  // Create Recipes
  console.log('📝 Creating recipes...')
  const grilledChickenRecipe = await prisma.recipe.create({
    data: {
      menuItemId: grilledChicken.id,
      name: 'Grilled Herb Chicken Recipe',
      servingSize: 1,
      instructions: '1. Marinate chicken in herbs and olive oil for 2 hours\n2. Grill on medium-high heat for 6-7 minutes per side\n3. Let rest for 5 minutes before serving',
      prepTime: 15,
      cookTime: 20,
    },
  })

  await prisma.recipeIngredient.createMany({
    data: [
      {
        recipeId: grilledChickenRecipe.id,
        inventoryItemId: chicken.id,
        quantity: 0.25,
        unit: 'KG',
      },
      {
        recipeId: grilledChickenRecipe.id,
        inventoryItemId: oliveoil.id,
        quantity: 0.03,
        unit: 'L',
        notes: 'for marinade',
      },
      {
        recipeId: grilledChickenRecipe.id,
        inventoryItemId: basil.id,
        quantity: 10,
        unit: 'G',
        notes: 'chopped fresh',
      },
    ],
  })

  const capreseRecipe = await prisma.recipe.create({
    data: {
      menuItemId: capreseSalad.id,
      name: 'Caprese Salad Recipe',
      servingSize: 1,
      instructions: '1. Slice tomatoes and mozzarella\n2. Arrange alternating slices\n3. Add fresh basil leaves\n4. Drizzle with olive oil and balsamic',
      prepTime: 10,
      cookTime: 0,
    },
  })

  await prisma.recipeIngredient.createMany({
    data: [
      {
        recipeId: capreseRecipe.id,
        inventoryItemId: tomatoes.id,
        quantity: 0.15,
        unit: 'KG',
        notes: 'sliced',
      },
      {
        recipeId: capreseRecipe.id,
        inventoryItemId: basil.id,
        quantity: 5,
        unit: 'G',
        notes: 'fresh leaves',
      },
      {
        recipeId: capreseRecipe.id,
        inventoryItemId: oliveoil.id,
        quantity: 0.02,
        unit: 'L',
        notes: 'for drizzling',
      },
    ],
  })

  // Create Reservations
  console.log('📅 Creating reservations...')
  await prisma.reservation.createMany({
    data: [
      {
        restaurantId: downtown.id,
        userId: customers[0].id,
        tableId: downtownTables[0].id,
        reservationDate: new Date('2025-01-10'),
        reservationTime: '19:00',
        partySize: 2,
        status: 'CONFIRMED',
        specialRequests: 'Window seat preferred',
      },
      {
        restaurantId: downtown.id,
        userId: customers[1].id,
        tableId: downtownTables[5].id,
        reservationDate: new Date('2025-01-12'),
        reservationTime: '20:00',
        partySize: 4,
        status: 'PENDING',
        specialRequests: 'Anniversary celebration',
      },
      {
        restaurantId: downtown.id,
        userId: customers[0].id,
        reservationDate: new Date('2025-01-08'),
        reservationTime: '18:30',
        partySize: 2,
        status: 'COMPLETED',
      },
    ],
  })

  // Create Sample Orders
  console.log('🛒 Creating orders...')
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2025-001',
      userId: customers[0].id,
      restaurantId: downtown.id,
      waiterId: waiter1.id,
      type: 'DINE_IN',
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      paymentMethod: 'CREDIT_CARD',
      subtotal: 37.98,
      tax: 3.04,
      total: 41.02,
      tableNumber: 'T05',
      customerName: 'John Doe',
      phoneNumber: '+1234567890',
    },
  })

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order1.id,
        menuItemId: grilledChicken.id,
        quantity: 1,
        price: 24.99,
      },
      {
        orderId: order1.id,
        menuItemId: capreseSalad.id,
        quantity: 1,
        price: 12.99,
      },
    ],
  })

  await prisma.orderPreparation.create({
    data: {
      orderId: order1.id,
      chefId: chef1.id,
      status: 'SERVED',
      startedAt: new Date('2025-01-05T18:15:00'),
      readyAt: new Date('2025-01-05T18:40:00'),
      servedAt: new Date('2025-01-05T18:45:00'),
    },
  })

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2025-002',
      userId: customers[1].id,
      restaurantId: uptown.id,
      type: 'TAKEAWAY',
      status: 'CONFIRMED',
      paymentStatus: 'PENDING',
      paymentMethod: 'CASH',
      subtotal: 13.99,
      tax: 1.12,
      total: 15.11,
      pickupTime: new Date('2025-01-08T12:30:00'),
      customerName: 'Jane Smith',
      phoneNumber: '+1234567891',
    },
  })

  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      menuItemId: chickenBowl.id,
      quantity: 1,
      price: 13.99,
    },
  })

  // Create Stock Movements
  console.log('📊 Creating stock movements...')
  await prisma.stockMovement.createMany({
    data: [
      {
        inventoryItemId: chicken.id,
        type: 'PURCHASE',
        quantity: 30,
        unit: 'KG',
        affectedState: 'RAW',
        previousRaw: 0,
        newRaw: 30,
        reason: 'Initial stock purchase',
        performedBy: admin.id,
      },
      {
        inventoryItemId: chicken.id,
        type: 'USAGE',
        quantity: 0.25,
        unit: 'KG',
        affectedState: 'CONSUMED',
        previousRaw: 30,
        newRaw: 29.75,
        previousConsumed: 0,
        newConsumed: 0.25,
        referenceType: 'Order',
        referenceId: order1.id,
        reason: 'Used for Order ORD-2025-001',
        performedBy: chef1.id,
      },
      {
        inventoryItemId: flour.id,
        type: 'PURCHASE',
        quantity: 50,
        unit: 'KG',
        affectedState: 'RAW',
        previousRaw: 0,
        newRaw: 50,
        reason: 'Weekly flour delivery',
        performedBy: admin.id,
      },
    ],
  })

  console.log('✅ Database seeding completed successfully!')
  console.log('')
  console.log('📊 Summary:')
  console.log('  - Admin: admin@suberfoods.com / admin123')
  console.log('  - Locations: 3 restaurants (2 open, 1 temporarily closed)')
  console.log('  - Staff: 3 members across locations')
  console.log('  - Equipment: 4 items')
  console.log('  - Inventory: 8 items across 2 locations')
  console.log('  - Menu: 5 categories, 4 items with recipes')
  console.log('  - Orders: 2 sample orders')
  console.log('  - Reservations: 3 reservations')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
