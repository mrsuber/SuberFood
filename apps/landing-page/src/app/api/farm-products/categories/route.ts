import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/farm-products/categories - Get all categories with product counts
export async function GET() {
  try {
    // Get all products grouped by category
    const categoriesWithCounts = await prisma.farmProduct.groupBy({
      by: ['category'],
      where: {
        status: 'ACTIVE',
        isAvailable: true,
      },
      _count: {
        id: true,
      },
    })

    // Map to friendly format
    const categories = categoriesWithCounts.map((item) => ({
      value: item.category,
      label: item.category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      count: item._count.id,
    }))

    // Sort by count (most products first)
    categories.sort((a, b) => b.count - a.count)

    return NextResponse.json({
      success: true,
      data: categories,
    })
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
