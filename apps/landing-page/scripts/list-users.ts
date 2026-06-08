import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function listUsers() {
  try {
    console.log('\nListing all users in database:')
    console.log('='.repeat(70))

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        loginCount: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    if (users.length === 0) {
      console.log('\n❌ No users found in database')
      return
    }

    console.log(`\n✓ Found ${users.length} user(s):\n`)

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Name: ${user.name || `${user.firstName} ${user.lastName}`}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Created: ${user.createdAt}`)
      console.log(`   Last Login: ${user.lastLoginAt || 'Never'}`)
      console.log(`   Login Count: ${user.loginCount}`)
      console.log('')
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listUsers()
