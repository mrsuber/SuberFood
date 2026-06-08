import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { compare } from 'bcryptjs'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function checkUser() {
  try {
    const email = 'msiysinyuy@gmail.com'
    const password = 'Msb1@@@@'

    console.log(`\nChecking user: ${email}`)
    console.log('='.repeat(50))

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
        password: true,
        createdAt: true,
        lastLoginAt: true,
        loginCount: true,
      }
    })

    if (!user) {
      console.log('❌ User not found in database')
      return
    }

    console.log('\n✓ User found:')
    console.log(`  ID: ${user.id}`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Name: ${user.name}`)
    console.log(`  First Name: ${user.firstName}`)
    console.log(`  Last Name: ${user.lastName}`)
    console.log(`  Role: ${user.role}`)
    console.log(`  Created: ${user.createdAt}`)
    console.log(`  Last Login: ${user.lastLoginAt}`)
    console.log(`  Login Count: ${user.loginCount}`)
    console.log(`  Has Password Hash: ${!!user.password}`)

    if (user.password) {
      console.log('\nVerifying password...')
      const isValid = await compare(password, user.password)

      if (isValid) {
        console.log('✓ Password is CORRECT')
      } else {
        console.log('❌ Password is INCORRECT')
        console.log('   The password in the database does not match what you provided')
      }
    } else {
      console.log('\n❌ No password hash stored (OAuth user?)')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()
