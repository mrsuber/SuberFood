import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const prisma = new PrismaClient()

// Mapping of product slugs to Unsplash image URLs
const productImages: Record<string, string> = {
  // Fresh Vegetables
  'fresh-tomatoes': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80',
  'fresh-cucumber': 'https://images.unsplash.com/photo-1568584711271-61300e7f7ab2?w=800&q=80',
  'bell-peppers': 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&q=80',
  'green-cabbage': 'https://images.unsplash.com/photo-1594282486084-4a177b5f0e3e?w=800&q=80',
  'fresh-carrots': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80',
  'fresh-beetroot': 'https://images.unsplash.com/photo-1590506793990-79a7e23d30c1?w=800&q=80',
  'red-onions': 'https://images.unsplash.com/photo-1587486936834-7568096fc7e5?w=800&q=80',
  'fresh-okra': 'https://images.unsplash.com/photo-1631703239831-5e9c8fe7f13a?w=800&q=80',
  'african-eggplant': 'https://images.unsplash.com/photo-1659261200833-ec8761558af7?w=800&q=80',
  'green-beans': 'https://images.unsplash.com/photo-1599818339803-d8c4e1178f6c?w=800&q=80',
  'fresh-peas': 'https://images.unsplash.com/photo-1588739524622-c3c7e5c0d5e9?w=800&q=80',
  'pumpkin': 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=800&q=80',

  // Tubers
  'sweet-potatoes': 'https://images.unsplash.com/photo-1589927986089-35812378d7e4?w=800&q=80',
  'cassava': 'https://images.unsplash.com/photo-1601039019070-c440e6fdd584?w=800&q=80',
  'white-yam': 'https://images.unsplash.com/photo-1584735174965-ca9d8b4f3f8d?w=800&q=80',
  'irish-potatoes': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80',
  'cocoyam': 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=800&q=80',

  // Fruits
  'bananas': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&q=80',
  'plantains': 'https://images.unsplash.com/photo-1603052080515-5cce0b6e0bb7?w=800&q=80',
  'pineapples': 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&q=80',
  'mangoes': 'https://images.unsplash.com/photo-1553279938-07c1a9e5e0f1?w=800&q=80',
  'papayas': 'https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=800&q=80',
  'oranges': 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=800&q=80',
  'avocados': 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&q=80',
  'watermelon': 'https://images.unsplash.com/photo-1587049352846-4a222e784720?w=800&q=80',
  'guavas': 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=800&q=80',
  'passion-fruit': 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=800&q=80',

  // Grains & Cereals
  'maize-corn': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&q=80',
  'african-rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
  'pearl-millet': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',
  'sorghum': 'https://images.unsplash.com/photo-1610650679074-cc37e77e81ef?w=800&q=80',

  // Legumes
  'cowpeas': 'https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=800&q=80',
  'groundnuts': 'https://images.unsplash.com/photo-1582385193655-64b77f76f34c?w=800&q=80',
  'soybeans': 'https://images.unsplash.com/photo-1599556431234-07dc2de0e5a0?w=800&q=80',
  'chickpeas': 'https://images.unsplash.com/photo-1600850186527-c46a1ea0f86f?w=800&q=80',
  'red-lentils': 'https://images.unsplash.com/photo-1607624641050-9f8d633d0b16?w=800&q=80',
  'kidney-beans': 'https://images.unsplash.com/photo-1583228096567-69707c8578a3?w=800&q=80',

  // Leafy Greens
  'african-spinach': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&q=80',
  'kale': 'https://images.unsplash.com/photo-1557844352-761f2565b576?w=800&q=80',
  'amaranth-leaves': 'https://images.unsplash.com/photo-1622205313162-be1d5712a43f?w=800&q=80',
  'bitter-leaf': 'https://images.unsplash.com/photo-1622205313162-be1d5712a43f?w=800&q=80',
  'huckleberry-leaves': 'https://images.unsplash.com/photo-1622205313162-be1d5712a43f?w=800&q=80',
  'lettuce': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800&q=80',

  // Herbs & Spices
  'fresh-ginger': 'https://images.unsplash.com/photo-1599639957043-f3aa5c986398?w=800&q=80',
  'garlic': 'https://images.unsplash.com/photo-1588756874133-78c6d6e7c451?w=800&q=80',
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
