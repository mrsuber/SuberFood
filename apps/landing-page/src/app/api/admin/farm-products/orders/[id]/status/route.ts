import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// PATCH /api/admin/farm-products/orders/[id]/status - Update order status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await req.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { success: false, message: 'Status is required' },
        { status: 400 }
      )
    }

    // Valid statuses
    const validStatuses = [
      'PENDING',
      'CONFIRMED',
      'PREPARING',
      'READY_FOR_PICKUP',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'COMPLETED',
      'CANCELLED',
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      )
    }

    // Update order
    const order = await prisma.farmOrder.update({
      where: { id },
      data: {
        status,
        completedAt: status === 'COMPLETED' || status === 'DELIVERED' ? new Date() : null,
        cancelledAt: status === 'CANCELLED' ? new Date() : null,
        statusHistory: {
          create: {
            status,
            note: `Order status updated to ${status}`,
          },
        },
      },
      include: {
        items: true,
        statusHistory: {
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order status updated successfully',
    })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update order status',
      },
      { status: 500 }
    )
  }
}
