import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Updating farm product images...')

  // Update Red Onions
  await prisma.farmProduct.update({
    where: { slug: 'red-onions' },
    data: {
      thumbnail: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&q=80',
        'https://images.unsplash.com/photo-1587735243615-c03f25aaff56?w=800&q=80',
      ],
    },
  })
  console.log('✓ Updated Red Onions')

  // Update Fresh Tilapia Fish
  await prisma.farmProduct.update({
    where: { slug: 'fresh-tilapia-fish' },
    data: {
      thumbnail: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800&q=80',
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
      ],
    },
  })
  console.log('✓ Updated Fresh Tilapia Fish')

  // Update Fresh Farm Eggs
  await prisma.farmProduct.update({
    where: { slug: 'fresh-farm-eggs' },
    data: {
      thumbnail: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&q=80',
        'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=800&q=80',
      ],
    },
  })
  console.log('✓ Updated Fresh Farm Eggs')

  // Update Fresh Ginger
  await prisma.farmProduct.update({
    where: { slug: 'fresh-ginger' },
    data: {
      thumbnail: 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=800&q=80',
        'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80',
      ],
    },
  })
  console.log('✓ Updated Fresh Ginger')

  console.log('\n✅ All product images updated successfully!')
}

main()
  .catch((e) => {
    console.error('Error updating product images:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
