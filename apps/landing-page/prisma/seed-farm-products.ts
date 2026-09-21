import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting farm products seeding...')

  // Clean existing farm products data
  console.log('🗑️  Cleaning existing farm products data...')
  await prisma.farmProductReview.deleteMany()
  await prisma.farmOrderItem.deleteMany()
  await prisma.farmOrderStatusHistory.deleteMany()
  await prisma.farmOrder.deleteMany()
  await prisma.farmCartItem.deleteMany()
  await prisma.farmCart.deleteMany()
  await prisma.farmProduct.deleteMany()

  console.log('🥬 Creating farm products...')

  // LEAFY GREENS
  const spinach = await prisma.farmProduct.create({
    data: {
      sku: 'FP-LEA-SPI-001',
      slug: 'fresh-spinach',
      name: 'Fresh Spinach',
      description: 'Locally grown organic spinach, harvested fresh daily. Rich in iron and vitamins.',
      category: 'LEAFY_GREENS',
      subcategory: 'Leafy Vegetables',

      priceType: 'BOTH',
      retailPrice: 2500, // XAF per kg
      retailUnit: 'kg',
      retailMinQty: 0.5,
      bulkPrice: 18000, // XAF per crate (10kg)
      bulkUnit: 'crate',
      bulkQtyPerUnit: 10,
      bulkMinOrder: 2,

      stockQuantity: 85,
      stockUnit: 'kg',
      lowStockThreshold: 20,
      reorderPoint: 30,

      farmSource: 'Green Valley Farm, Bafoussam',
      harvestDate: new Date('2025-01-18'),
      expiryDate: new Date('2025-01-25'),
      batchNumber: 'SPN-250118-001',

      isOrganic: true,
      isCertified: true,
      isInSeason: true,
      isFeatured: true,

      weight: 1,
      weightUnit: 'kg',

      status: 'ACTIVE',
      isAvailable: true,
    },
  })

  const lettuce = await prisma.farmProduct.create({
    data: {
      sku: 'FP-LEA-LET-002',
      slug: 'romaine-lettuce',
      name: 'Romaine Lettuce',
      description: 'Crisp and fresh romaine lettuce, perfect for salads and sandwiches.',
      category: 'LEAFY_GREENS',

      priceType: 'RETAIL_ONLY',
      retailPrice: 1800,
      retailUnit: 'kg',
      retailMinQty: 0.25,

      stockQuantity: 45,
      stockUnit: 'kg',
      lowStockThreshold: 15,

      farmSource: 'Bamenda Organic Farms',
      harvestDate: new Date('2025-01-19'),
      expiryDate: new Date('2025-01-26'),
      batchNumber: 'LET-250119-001',

      isOrganic: true,
      isCertified: true,
      isInSeason: true,

      status: 'ACTIVE',
      isAvailable: true,
    },
  })

  // FRESH VEGETABLES
  const tomatoes = await prisma.farmProduct.create({
    data: {
      sku: 'FP-FRE-TOM-003',
      slug: 'fresh-tomatoes',
      name: 'Fresh Tomatoes',
      description: 'Juicy ripe tomatoes, locally sourced. Great for cooking and salads.',
      category: 'FRESH_VEGETABLES',

      priceType: 'BOTH',
      retailPrice: 2000,
      retailUnit: 'kg',
      retailMinQty: 0.5,
      bulkPrice: 35000,
      bulkUnit: 'basket',
      bulkQtyPerUnit: 20,
      bulkMinOrder: 1,

      stockQuantity: 150,
      stockUnit: 'kg',
      lowStockThreshold: 30,
      reorderPoint: 50,

      farmSource: 'Buea Farm Cooperative',
      harvestDate: new Date('2025-01-17'),
      expiryDate: new Date('2025-01-27'),
      batchNumber: 'TOM-250117-002',

      isOrganic: false,
      isCertified: true,
      isInSeason: true,
      isFeatured: true,

      status: 'ACTIVE',
      isAvailable: true,
    },
  })

  const carrots = await prisma.farmProduct.create({
    data: {
      sku: 'FP-ROO-CAR-004',
      slug: 'organic-carrots',
      name: 'Organic Carrots',
      description: 'Sweet, crunchy organic carrots. High in beta-carotene and vitamins.',
      category: 'ROOT_VEGETABLES',

      priceType: 'BOTH',
      retailPrice: 1500,
      retailUnit: 'kg',
      retailMinQty: 1,
      bulkPrice: 12000,
      bulkUnit: 'bag',
      bulkQtyPerUnit: 10,
      bulkMinOrder: 3,

      stockQuantity: 200,
      stockUnit: 'kg',
      lowStockThreshold: 50,
      reorderPoint: 80,

      farmSource: 'Dschang Vegetable Farms',
      harvestDate: new Date('2025-01-15'),
      expiryDate: new Date('2025-02-15'),
      batchNumber: 'CAR-250115-001',

      isOrganic: true,
      isCertified: true,
      isInSeason: true,

      status: 'ACTIVE',
      isAvailable: true,
    },
  })

  // FRUITS
  const bananas = await prisma.farmProduct.create({
    data: {
      sku: 'FP-FRU-BAN-005',
      slug: 'fresh-bananas',
      name: 'Fresh Bananas',
      description: 'Sweet and ripe bananas from local plantations. Rich in potassium.',
      category: 'FRUITS',

      priceType: 'BOTH',
      retailPrice: 1200,
      retailUnit: 'kg',
      retailMinQty: 1,
      bulkPrice: 22000,
      bulkUnit: 'bunch',
      bulkQtyPerUnit: 25,
      bulkMinOrder: 2,

      stockQuantity: 180,
      stockUnit: 'kg',
      lowStockThreshold: 40,
      reorderPoint: 60,

      farmSource: 'Tiko Banana Plantation',
      harvestDate: new Date('2025-01-16'),
      expiryDate: new Date('2025-01-30'),
      batchNumber: 'BAN-250116-003',

      isOrganic: false,
      isCertified: true,
      isInSeason: true,
      isFeatured: true,

      status: 'ACTIVE',
      isAvailable: true,
    },
  })

  const avocados = await prisma.farmProduct.create({
    data: {
      sku: 'FP-FRU-AVO-006',
      slug: 'organic-avocados',
      name: 'Organic Avocados',
      description: 'Creamy organic avocados, perfect for guacamole or toast. Packed with healthy fats.',
      category: 'FRUITS',

      priceType: 'RETAIL_ONLY',
      retailPrice: 3500,
      retailUnit: 'kg',
      retailMinQty: 0.5,

      stockQuantity: 65,
      stockUnit: 'kg',
      lowStockThreshold: 15,
      reorderPoint: 25,

      farmSource: 'Kumba Fruit Farms',
      harvestDate: new Date('2025-01-14'),
      expiryDate: new Date('2025-01-28'),
      batchNumber: 'AVO-250114-001',

      isOrganic: true,
      isCertified: true,
      isInSeason: true,
      isFeatured: true,

      status: 'ACTIVE',
      isAvailable: true,
    },
  })

  // LEGUMES
  const beans = await prisma.farmProduct.create({
    data: {
      sku: 'FP-LEG-BEA-007',
      slug: 'white-beans',
      name: 'White Beans',
      description: 'High-quality white beans, perfect for traditional dishes. Rich in protein and fiber.',
      category: 'LEGUMES',

      priceType: 'BOTH',
      retailPrice: 2800,
      retailUnit: 'kg',
      retailMinQty: 1,
      bulkPrice: 25000,
      bulkUnit: 'bag',
      bulkQtyPerUnit: 10,
      bulkMinOrder: 5,

      stockQuantity: 350,
      stockUnit: 'kg',
      lowStockThreshold: 80,
      reorderPoint: 120,

      farmSource: 'Bamenda Bean Cooperative',
      harvestDate: new Date('2024-12-20'),
      batchNumber: 'BEA-241220-002',

      isOrganic: false,
      isCertified: true,
      isInSeason: false,

      status: 'ACTIVE',
      isAvailable: true,
    },
  })

  // GRAINS & CEREALS
  const rice = await prisma.farmProduct.create({
    data: {
      sku: 'FP-GRA-RIC-008',
      slug: 'local-rice',
      name: 'Local Rice (Ndop)',
      description: 'Premium local rice from Ndop plains. Aromatic and nutritious.',
      category: 'GRAINS_CEREALS',

      priceType: 'BULK_ONLY',
      bulkPrice: 45000,
      bulkUnit: 'bag',
      bulkQtyPerUnit: 50,
      bulkMinOrder: 1,

      stockQuantity: 800,
      stockUnit: 'kg',
      lowStockThreshold: 150,
      reorderPoint: 250,

      farmSource: 'Ndop Rice Mill',
      harvestDate: new Date('2024-11-30'),
      batchNumber: 'RIC-241130-005',

      isOrganic: false,
      isCertified: true,
      isInSeason: true,

      status: 'ACTIVE',
      isAvailable: true,
    },
  })

  const corn = await prisma.farmProduct.create({
    data: {
      sku: 'FP-GRA-COR-009',
      slug: 'yellow-corn',
      name: 'Yellow Corn',
      description: 'Fresh yellow corn, perfect for traditional dishes and grinding.',
      category: 'GRAINS_CEREALS',

      priceType: 'BOTH',
      retailPrice: 1800,
      retailUnit: 'kg',
      retailMinQty: 2,
      bulkPrice: 30000,
      bulkUnit: 'bag',
      bulkQtyPerUnit: 25,
      bulkMinOrder: 2,

      stockQuantity: 450,
      stockUnit: 'kg',
      lowStockThreshold: 100,
      reorderPoint: 150,

      farmSource: 'Bafut Corn Farms',
      harvestDate: new Date('2025-01-10'),
      batchNumber: 'COR-250110-001',

      isOrganic: false,
      isCertified: true,
      isInSeason: true,

      status: 'ACTIVE',
      isAvailable: true,
    },
  })

  // TUBERS
  const yam = await prisma.farmProduct.create({
    data: {
      sku: 'FP-TUB-YAM-010',
      slug: 'white-yam',
      name: 'White Yam',
      description: 'Premium quality white yam, a staple food rich in carbohydrates.',
      category: 'TUBERS',

      priceType: 'BOTH',
      retailPrice: 2500,
      retailUnit: 'kg',
      retailMinQty: 5,
      bulkPrice: 40000,
      bulkUnit: 'bag',
      bulkQtyPerUnit: 25,
      bulkMinOrder: 2,

      stockQuantity: 300,
      stockUnit: 'kg',
      lowStockThreshold: 75,
      reorderPoint: 120,

      farmSource: 'Bali Yam Farms',
      harvestDate: new Date('2024-12-28'),
      expiryDate: new Date('2025-03-28'),
      batchNumber: 'YAM-241228-002',

      isOrganic: false,
      isCertified: true,
      isInSeason: true,
      isFeatured: true,

      status: 'ACTIVE',
      isAvailable: true,
    },
  })

  const cassava = await prisma.farmProduct.create({
    data: {
      sku: 'FP-TUB-CAS-011',
      slug: 'fresh-cassava',
      name: 'Fresh Cassava',
      description: 'Fresh cassava tubers, perfect for fufu, garri, or boiling.',
      category: 'TUBERS',

      priceType: 'RETAIL_ONLY',
      retailPrice: 1200,
      retailUnit: 'kg',
      retailMinQty: 3,

      stockQuantity: 180,
      stockUnit: 'kg',
      lowStockThreshold: 40,
      reorderPoint: 70,

      farmSource: 'Muyuka Farm Cooperative',
      harvestDate: new Date('2025-01-17'),
      expiryDate: new Date('2025-01-24'),
      batchNumber: 'CAS-250117-001',

      isOrganic: false,
      isCertified: false,
      isInSeason: true,

      status: 'ACTIVE',
      isAvailable: true,
    },
  })

  // HERBS & SPICES
  const ginger = await prisma.farmProduct.create({
    data: {
      sku: 'FP-HER-GIN-012',
      slug: 'fresh-ginger',
      name: 'Fresh Ginger',
      description: 'Aromatic fresh ginger root, perfect for teas, cooking, and natural remedies.',
      category: 'HERBS_SPICES',

      priceType: 'RETAIL_ONLY',
      retailPrice: 4500,
      retailUnit: 'kg',
      retailMinQty: 0.25,

      stockQuantity: 35,
      stockUnit: 'kg',
      lowStockThreshold: 10,
      reorderPoint: 15,

      farmSource: 'Belo Spice Gardens',
      harvestDate: new Date('2025-01-12'),
      batchNumber: 'GIN-250112-001',

      isOrganic: true,
      isCertified: true,
      isInSeason: true,

      status: 'ACTIVE',
      isAvailable: true,
    },
  })

  // DAIRY & EGGS
  const eggs = await prisma.farmProduct.create({
    data: {
      sku: 'FP-DAI-EGG-013',
      slug: 'fresh-eggs',
      name: 'Fresh Farm Eggs',
      description: 'Free-range chicken eggs, collected daily. Rich in protein and nutrients.',
      category: 'DAIRY_EGGS',

      priceType: 'BOTH',
      retailPrice: 150,
      retailUnit: 'piece',
      retailMinQty: 6,
      bulkPrice: 8000,
      bulkUnit: 'crate',
      bulkQtyPerUnit: 60,
      bulkMinOrder: 2,

      stockQuantity: 420, // counting individual eggs
      stockUnit: 'piece',
      lowStockThreshold: 100,
      reorderPoint: 150,

      farmSource: 'Bamenda Poultry Farm',
      harvestDate: new Date('2025-01-20'),
      expiryDate: new Date('2025-02-10'),
      batchNumber: 'EGG-250120-001',

      isOrganic: false,
      isCertified: true,
      isInSeason: true,
      isFeatured: true,

      status: 'ACTIVE',
      isAvailable: true,
    },
  })

  // FISH & SEAFOOD
  const tilapia = await prisma.farmProduct.create({
    data: {
      sku: 'FP-FIS-TIL-014',
      slug: 'fresh-tilapia',
      name: 'Fresh Tilapia Fish',
      description: 'Fresh tilapia fish from local fish farms. Cleaned and ready to cook.',
      category: 'FISH_SEAFOOD',

      priceType: 'BOTH',
      retailPrice: 5500,
      retailUnit: 'kg',
      retailMinQty: 1,
      bulkPrice: 50000,
      bulkUnit: 'basket',
      bulkQtyPerUnit: 10,
      bulkMinOrder: 1,

      stockQuantity: 55,
      stockUnit: 'kg',
      lowStockThreshold: 15,
      reorderPoint: 25,

      farmSource: 'Santchou Fish Farm',
      harvestDate: new Date('2025-01-20'),
      expiryDate: new Date('2025-01-22'),
      batchNumber: 'TIL-250120-002',

      isOrganic: false,
      isCertified: true,
      isInSeason: true,

      status: 'ACTIVE',
      isAvailable: true,
    },
  })

  // Low stock item (for testing alerts)
  const onions = await prisma.farmProduct.create({
    data: {
      sku: 'FP-FRE-ONI-015',
      slug: 'red-onions',
      name: 'Red Onions',
      description: 'Fresh red onions, perfect for cooking. Sweet and flavorful.',
      category: 'FRESH_VEGETABLES',

      priceType: 'BOTH',
      retailPrice: 2200,
      retailUnit: 'kg',
      retailMinQty: 1,
      bulkPrice: 20000,
      bulkUnit: 'bag',
      bulkQtyPerUnit: 10,
      bulkMinOrder: 3,

      stockQuantity: 12, // Low stock!
      stockUnit: 'kg',
      lowStockThreshold: 20,
      reorderPoint: 35,

      farmSource: 'Foumbot Vegetable Market',
      harvestDate: new Date('2025-01-15'),
      expiryDate: new Date('2025-02-15'),
      batchNumber: 'ONI-250115-001',

      isOrganic: false,
      isCertified: false,
      isInSeason: true,

      status: 'ACTIVE',
      isAvailable: true,
    },
  })

  // Out of stock item (for testing)
  const garlic = await prisma.farmProduct.create({
    data: {
      sku: 'FP-HER-GAR-016',
      slug: 'fresh-garlic',
      name: 'Fresh Garlic',
      description: 'Aromatic fresh garlic bulbs. Essential for cooking.',
      category: 'HERBS_SPICES',

      priceType: 'RETAIL_ONLY',
      retailPrice: 6000,
      retailUnit: 'kg',
      retailMinQty: 0.25,

      stockQuantity: 0, // Out of stock!
      stockUnit: 'kg',
      lowStockThreshold: 5,
      reorderPoint: 10,

      farmSource: 'Bafut Spice Farms',

      isOrganic: false,
      isCertified: false,
      isInSeason: true,

      status: 'OUT_OF_STOCK',
      isAvailable: false,
    },
  })

  console.log('✅ Farm products seeding completed successfully!')
  console.log('')
  console.log('📊 Summary:')
  console.log('  - Total products: 16')
  console.log('  - Categories: 9 different types')
  console.log('  - Retail only: 5 products')
  console.log('  - Bulk only: 1 product')
  console.log('  - Both pricing: 10 products')
  console.log('  - Organic certified: 6 products')
  console.log('  - Featured products: 5 products')
  console.log('  - Low stock alerts: 1 product (Red Onions)')
  console.log('  - Out of stock: 1 product (Fresh Garlic)')
  console.log('')
  console.log('💰 All prices are in XAF (FCFA)')
  console.log('🌍 All products sourced from Cameroon farms')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding farm products:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
