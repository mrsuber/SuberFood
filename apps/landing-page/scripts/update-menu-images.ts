import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function updateMenuImages() {
  try {
    console.log('Fetching current menu items...')

    // Get all menu items
    const menuItems = await prisma.menuItem.findMany({
      orderBy: { name: 'asc' }
    })

    console.log(`Found ${menuItems.length} menu items:\n`)
    menuItems.forEach(item => {
      console.log(`- ${item.name} (ID: ${item.id})`)
    })

    // Update each menu item with appropriate image
    const updates = [
      { name: 'Caprese Salad', image: '/images/menu/caprese-salad.jpg' },
      { name: 'Grilled Herb Chicken', image: '/images/menu/grilled-chicken.jpg' },
      { name: 'Classic Tiramisu', image: '/images/menu/tiramisu.jpg' },
      { name: 'Teriyaki Chicken Bowl', image: '/images/menu/teriyaki-bowl.jpg' },
    ]

    console.log('\nUpdating menu items with images...\n')

    for (const update of updates) {
      const menuItem = menuItems.find(item => item.name === update.name)
      if (menuItem) {
        await prisma.menuItem.update({
          where: { id: menuItem.id },
          data: { image: update.image }
        })
        console.log(`✓ Updated "${update.name}" with image: ${update.image}`)
      } else {
        console.log(`✗ Menu item "${update.name}" not found`)
      }
    }

    console.log('\n✓ All menu items updated successfully!')
  } catch (error) {
    console.error('Error updating menu images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateMenuImages()
