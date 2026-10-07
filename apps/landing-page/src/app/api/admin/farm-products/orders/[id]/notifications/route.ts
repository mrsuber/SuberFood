import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Notification templates for the 3-step process
const NOTIFICATION_TEMPLATES = {
  STEP_1: (productName: string, price: number) =>
    `Hi! I'm at the farm. ${productName} is available at ${price} XAF. Should I lock in your order?`,
  STEP_2: (orderNumber: string) =>
    `Your order ${orderNumber} is ready in Buea! Would you like to pick it up or should we deliver it to you?`,
  STEP_3: (orderNumber: string) =>
    `Order ${orderNumber} is being fulfilled. Please sign upon receipt/delivery.`,
}

// GET /api/admin/farm-products/orders/[id]/notifications - Get all notifications for an order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify order exists
    const order = await prisma.farmOrder.findUnique({
      where: { id },
      select: {
        id: true,
        orderNumber: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order not found',
        },
        { status: 404 }
      )
    }

    // Get all notifications for this order
    const notifications = await prisma.orderNotification.findMany({
      where: { orderId: id },
      orderBy: {
        sentAt: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        order,
        notifications,
      },
    })
  } catch (error: any) {
    console.error('Error fetching order notifications:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch notifications',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// POST /api/admin/farm-products/orders/[id]/notifications - Create/send a notification
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const {
      step, // 1, 2, or 3
      message, // Custom message or use template
      sentVia = 'MANUAL', // SMS, WHATSAPP, CALL, MANUAL
      response, // Customer response (optional)
      productName, // For step 1 template
      price, // For step 1 template
    } = body

    // Validate step
    if (!step || ![1, 2, 3].includes(step)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Step must be 1, 2, or 3',
        },
        { status: 400 }
      )
    }

    // Get order info
    const order = await prisma.farmOrder.findUnique({
      where: { id },
      select: {
        id: true,
        orderNumber: true,
        guestPhone: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order not found',
        },
        { status: 404 }
      )
    }

    // Generate message based on template or use custom message
    let finalMessage = message
    let template = ''

    if (!finalMessage) {
      // Use template
      switch (step) {
        case 1:
          if (!productName || !price) {
            return NextResponse.json(
              {
                success: false,
                message: 'Product name and price are required for Step 1 notification',
              },
              { status: 400 }
            )
          }
          template = NOTIFICATION_TEMPLATES.STEP_1(productName, price)
          finalMessage = template
          break
        case 2:
          template = NOTIFICATION_TEMPLATES.STEP_2(order.orderNumber)
          finalMessage = template
          break
        case 3:
          template = NOTIFICATION_TEMPLATES.STEP_3(order.orderNumber)
          finalMessage = template
          break
      }
    }

    // Create notification record
    const notification = await prisma.orderNotification.create({
      data: {
        orderId: id,
        step,
        template: template || 'Custom message',
        message: finalMessage,
        sentAt: new Date(),
        sentVia,
        response: response || null,
        respondedAt: response ? new Date() : null,
      },
    })

    return NextResponse.json({
      success: true,
      data: notification,
      message: `Step ${step} notification created successfully`,
    })
  } catch (error: any) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create notification',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
