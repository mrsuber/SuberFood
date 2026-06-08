import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { hash } from 'bcryptjs'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function createUser() {
  try {
    const email = 'msiysinyuy@gmail.com'
    const password = 'Msb1@@@@'
    const firstName = 'Martin'
    const lastName = 'Siysinyuy'

    console.log(`\nCreating user: ${email}`)
    console.log('='.repeat(50))

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('\n❌ User already exists. Updating password instead...')

      const hashedPassword = await hash(password, 12)

      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        }
      })

      console.log('\n✓ Password updated successfully!')
      console.log(`  ID: ${updatedUser.id}`)
      console.log(`  Email: ${updatedUser.email}`)
      console.log(`  Name: ${updatedUser.name}`)
      console.log(`  Role: ${updatedUser.role}`)
      return
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        role: 'CUSTOMER',
        emailVerified: new Date(),
        loginCount: 0,
      }
    })

    console.log('\n✓ User created successfully!')
    console.log(`  ID: ${user.id}`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Name: ${user.name}`)
    console.log(`  Role: ${user.role}`)
    console.log(`\nYou can now sign in with:`)
    console.log(`  Email: ${email}`)
    console.log(`  Password: ${password}`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createUser()
