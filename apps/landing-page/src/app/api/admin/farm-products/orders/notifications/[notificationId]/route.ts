import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// PUT /api/admin/farm-products/orders/notifications/[notificationId] - Update notification with customer response
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    const { notificationId } = await params
    const body = await request.json()

    const { response } = body

    if (!response) {
      return NextResponse.json(
        {
          success: false,
          message: 'Response is required',
        },
        { status: 400 }
      )
    }

    // Check if notification exists
    const existingNotification = await prisma.orderNotification.findUnique({
      where: { id: notificationId },
    })

    if (!existingNotification) {
      return NextResponse.json(
        {
          success: false,
          message: 'Notification not found',
        },
        { status: 404 }
      )
    }

    // Update notification with customer response
    const notification = await prisma.orderNotification.update({
      where: { id: notificationId },
      data: {
        response,
        respondedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      data: notification,
      message: 'Customer response recorded successfully',
    })
  } catch (error: any) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update notification',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
