import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const prisma = new PrismaClient()

// Mapping of product slugs to Unsplash image URLs
const productImages: Record<string, string> = {
  // Fresh Vegetables
  'fresh-tomatoes': 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800&q=80',
  'fresh-cucumber': 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=800&q=80',
  'bell-peppers': 'https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?w=800&q=80',
  'green-cabbage': 'https://images.unsplash.com/photo-1594282486084-4a177b5f0e3e?w=800&q=80',
  'fresh-carrots': 'https://images.unsplash.com/photo-1582515073490-39981397c445?w=800&q=80',
  'fresh-beetroot': 'https://images.unsplash.com/photo-1590506793940-c726de1c6b48?w=800&q=80',
  'red-onions': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&q=80',
  'fresh-okra': 'https://images.unsplash.com/photo-1631703239831-5e9c8fe7f13a?w=800&q=80',
  'african-eggplant': 'https://images.unsplash.com/photo-1659261200833-ec8761558af7?w=800&q=80',
  'green-beans': 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=800&q=80',
  'fresh-peas': 'https://images.unsplash.com/photo-1585584114963-503344a119b0?w=800&q=80',
  'pumpkin': 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=800&q=80',

  // Tubers
  'sweet-potatoes': 'https://images.unsplash.com/photo-1596097635780-70cf39436aac?w=800&q=80',
  'cassava': 'https://images.unsplash.com/photo-1604917488981-41c44b22d8cc?w=800&q=80',
  'white-yam': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
  'irish-potatoes': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80',
  'cocoyam': 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=800&q=80',

  // Fruits
  'bananas': 'https://images.unsplash.com/photo-1603833797131-3c0a798d2f9b?w=800&q=80',
  'plantains': 'https://images.unsplash.com/photo-1591411768683-52d740e97f5c?w=800&q=80',
  'pineapples': 'https://images.unsplash.com/photo-1550828486-e43a093a9161?w=800&q=80',
  'mangoes': 'https://images.unsplash.com/photo-1605027990121-cbae9d39199d?w=800&q=80',
  'papayas': 'https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=800&q=80',
  'oranges': 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=800&q=80',
  'avocados': 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&q=80',
  'watermelon': 'https://images.unsplash.com/photo-1563114773-84221bd59d5d?w=800&q=80',
  'guavas': 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=800&q=80',
  'passion-fruit': 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=800&q=80',

  // Grains & Cereals
  'maize-corn': 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800&q=80',
  'african-rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
  'pearl-millet': 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&q=80',
  'sorghum': 'https://images.unsplash.com/photo-1509310628565-4a8797071eed?w=800&q=80',

  // Legumes
  'cowpeas': 'https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=800&q=80',
  'groundnuts': 'https://images.unsplash.com/photo-1585559604959-c640ce098e4d?w=800&q=80',
  'soybeans': 'https://images.unsplash.com/photo-1566843972142-a1e8f7d5ce7b?w=800&q=80',
  'chickpeas': 'https://images.unsplash.com/photo-1538116175606-e1c0f13e6c65?w=800&q=80',
  'red-lentils': 'https://images.unsplash.com/photo-1593795899630-19cb2f74d436?w=800&q=80',
  'kidney-beans': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80',

  // Leafy Greens
  'african-spinach': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&q=80',
  'kale': 'https://images.unsplash.com/photo-1557844352-761f2565b576?w=800&q=80',
  'amaranth-leaves': 'https://images.unsplash.com/photo-1622205313162-be1d5712a43f?w=800&q=80',
  'bitter-leaf': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
  'huckleberry-leaves': 'https://images.unsplash.com/photo-1530317096211-d1b6115a4c6d?w=800&q=80',
  'lettuce': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800&q=80',

  // Herbs & Spices
  'fresh-ginger': 'https://images.unsplash.com/photo-1599639957043-f3aa5c986398?w=800&q=80',
  'garlic': 'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=800&q=80',
  'scotch-bonnet-peppers': 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&q=80',
  'scent-leaf': 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=800&q=80',
}

async function main() {
  console.log('🖼️  Starting farm product image update...')

  let updatedCount = 0
  let notFoundCount = 0

  for (const [slug, imageUrl] of Object.entries(productImages)) {
    try {
      const product = await prisma.farmProduct.findUnique({
        where: { slug },
      })

      if (product) {
        await prisma.farmProduct.update({
          where: { slug },
          data: {
            thumbnail: imageUrl,
            images: [imageUrl],
          },
        })
        console.log(`✅ Updated ${slug}`)
        updatedCount++
      } else {
        console.log(`⚠️  Product not found: ${slug}`)
        notFoundCount++
      }
    } catch (error) {
      console.error(`❌ Error updating ${slug}:`, error)
    }
  }

  console.log('')
  console.log('📊 Update Summary:')
  console.log(`  - Successfully updated: ${updatedCount} products`)
  console.log(`  - Not found: ${notFoundCount} products`)
  console.log('')
  console.log('✨ All product images updated with high-quality Unsplash photos!')
}

main()
  .catch((e) => {
    console.error('❌ Error updating product images:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
