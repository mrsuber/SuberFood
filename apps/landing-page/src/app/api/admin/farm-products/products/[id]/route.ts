import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/admin/farm-products/products/[id] - Get single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.farmProduct.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error: any) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch product',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
