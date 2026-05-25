import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deductInventoryForRecipe, checkRecipeAvailability } from '@/lib/inventory';

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
      total,
      customizations // { removed: ['ingredientId'], added: { 'ingredientId': quantity } }
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
      where: { id: menuItemId },
      include: {
        recipe: {
          include: {
            ingredients: {
              include: {
                inventoryItem: true
              }
            }
          }
        }
      }
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    // Check inventory availability if recipe exists
    let inventoryDeductions: any[] = []
    if (menuItem.recipe) {
      const availability = await checkRecipeAvailability(menuItem.recipe.id, quantity)

      if (!availability.available) {
        return NextResponse.json(
          {
            error: 'Insufficient inventory',
            missing: availability.missing,
            message: `Cannot fulfill order. Missing ingredients: ${availability.missing.map(m => `${m.name} (need ${m.need} ${m.unit}, have ${m.have} ${m.unit})`).join(', ')}`
          },
          { status: 400 }
        );
      }

      // Deduct inventory in a transaction
      try {
        inventoryDeductions = await deductInventoryForRecipe(
          menuItem.recipe.id,
          quantity,
          customizations
        )
      } catch (error: any) {
        return NextResponse.json(
          {
            error: 'Inventory deduction failed',
            details: error.message
          },
          { status: 400 }
        );
      }
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
              customizations: customizations || null
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

    return NextResponse.json({
      order,
      inventoryImpact: inventoryDeductions
    }, { status: 201 });
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
