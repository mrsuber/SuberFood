import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      menuItemId,
      quantity,
      type,
      restaurantId,
      tableNumber,
      deliveryAddress,
      pickupTime,
      customerName,
      phoneNumber,
      total
    } = body;

    // Validate required fields
    if (!menuItemId || !quantity || !type || !customerName || !phoneNumber || !total) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate order type specific fields
    if (type === 'DINE_IN' && !tableNumber) {
      return NextResponse.json(
        { error: 'Table number is required for dine-in orders' },
        { status: 400 }
      );
    }

    if (type === 'DELIVERY' && !deliveryAddress) {
      return NextResponse.json(
        { error: 'Delivery address is required for delivery orders' },
        { status: 400 }
      );
    }

    if (type === 'TAKEAWAY' && !pickupTime) {
      return NextResponse.json(
        { error: 'Pickup time is required for takeaway orders' },
        { status: 400 }
      );
    }

    // Get menu item to verify it exists and get the price
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId }
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create the order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        restaurantId,
        type,
        status: 'PENDING',
        subtotal: total,
        total,
        customerName,
        phoneNumber,
        tableNumber: type === 'DINE_IN' ? tableNumber : null,
        deliveryAddress: type === 'DELIVERY' ? deliveryAddress : null,
        pickupTime: type === 'TAKEAWAY' ? new Date(pickupTime) : null,
        items: {
          create: [
            {
              menuItemId,
              quantity,
              price: menuItem.price,
            }
          ]
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
        type: {
          in: ['DINE_IN', 'TAKEAWAY', 'DELIVERY']
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
