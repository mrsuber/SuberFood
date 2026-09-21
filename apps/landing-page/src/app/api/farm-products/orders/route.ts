import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export const dynamic = 'force-dynamic'

// POST /api/farm-products/orders - Create a new farm product order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      items,
      deliveryMethod,
      contactInfo,
      deliveryAddress,
      subtotal,
      deliveryFee,
      totalAmount,
    } = body

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No items in order' },
        { status: 400 }
      )
    }

    if (!contactInfo?.fullName || !contactInfo?.phone) {
      return NextResponse.json(
        { success: false, message: 'Contact information is required' },
        { status: 400 }
      )
    }

    if (deliveryMethod === 'delivery' && !deliveryAddress?.street) {
      return NextResponse.json(
        { success: false, message: 'Delivery address is required for delivery orders' },
        { status: 400 }
      )
    }

    // Generate order number
    const orderNumber = `FPO-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`

    // Create order with items
    const order = await prisma.farmOrder.create({
      data: {
        orderNumber,
        isGuest: true, // For now, all orders are guest orders (can be updated for authenticated users)
        guestName: contactInfo.fullName,
        guestPhone: contactInfo.phone,
        guestEmail: contactInfo.email || null,

        fulfillmentType: deliveryMethod === 'delivery' ? 'DELIVERY' : 'PICKUP',

        // Delivery details
        deliveryAddress: deliveryAddress
          ? `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.region}`
          : null,
        deliveryCity: deliveryAddress?.city || null,
        deliveryState: deliveryAddress?.region || null,
        deliveryPhone: contactInfo.phone,
        deliveryInstructions: deliveryAddress?.additionalInfo || null,

        // Pickup details
        pickupLocation: deliveryMethod === 'pickup' ? 'SuberFood Distribution Center, Douala' : null,

        // Amounts
        subtotal: new Decimal(subtotal),
        deliveryFee: new Decimal(deliveryFee),
        totalAmount: new Decimal(totalAmount),

        // Payment
        paymentMethod: 'MOBILE_MONEY', // Will be determined by PayWithCamsol
        paymentStatus: 'PENDING',

        // Status
        status: 'PENDING',

        // Order items
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.name,
            productSku: item.productSlug,
            productImage: null,
            purchaseType: item.priceType === 'retail' ? 'RETAIL' : 'BULK',
            quantity: new Decimal(item.quantity),
            unit: item.unit,
            pricePerUnit: new Decimal(item.price),
            totalPrice: new Decimal(item.price * item.quantity),
          })),
        },

        // Status history
        statusHistory: {
          create: {
            status: 'PENDING',
            note: 'Order created',
          },
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: order,
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create order',
      },
      { status: 500 }
    )
  }
}

// GET /api/farm-products/orders - Get user's orders (for authenticated users)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orderNumber = searchParams.get('orderNumber')

    if (orderNumber) {
      // Get specific order by order number
      const order = await prisma.farmOrder.findUnique({
        where: { orderNumber },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          statusHistory: {
            orderBy: {
              timestamp: 'desc',
            },
          },
        },
      })

      if (!order) {
        return NextResponse.json(
          { success: false, message: 'Order not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: order,
      })
    }

    // Get all orders (this would typically be filtered by userId for authenticated users)
    const orders = await prisma.farmOrder.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
      include: {
        items: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: orders,
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch orders',
      },
      { status: 500 }
    )
  }
}
