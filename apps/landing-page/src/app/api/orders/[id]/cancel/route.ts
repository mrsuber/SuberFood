import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/orders/[id]/cancel
 * Cancel an order and restore inventory
 *
 * Body:
 * - reason: Cancellation reason (optional)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: orderId } = params;
    const body = await request.json();
    const { reason } = body;

    // Get order with items and preparation status
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            menuItem: {
              include: {
                recipe: {
                  include: {
                    ingredients: {
                      include: {
                        inventoryItem: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        preparation: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Authorization check: user must own the order OR be an admin
    const isOwner = order.userId === session.user.id;
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'RESTAURANT_MANAGER'].includes(
      session.user.role || ''
    );

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to cancel this order' },
        { status: 403 }
      );
    }

    // Check if order can be cancelled
    // Can only cancel if status is PENDING (not in preparation)
    if (order.status !== 'PENDING') {
      return NextResponse.json(
        {
          error: `Cannot cancel order with status ${order.status}. Orders can only be cancelled when PENDING.`,
        },
        { status: 400 }
      );
    }

    // Check preparation status
    if (order.preparation && order.preparation.status !== 'PENDING') {
      return NextResponse.json(
        {
          error: 'Cannot cancel order - food preparation has already started',
        },
        { status: 400 }
      );
    }

    // Restore inventory for each order item
    for (const orderItem of order.items) {
      if (!orderItem.menuItem?.recipe) continue;

      const recipe = orderItem.menuItem.recipe;

      for (const recipeIngredient of recipe.ingredients) {
        const inventoryItem = recipeIngredient.inventoryItem;
        if (!inventoryItem) continue;

        // Calculate quantity to restore (recipe quantity * number of servings ordered)
        const quantityToRestore = recipeIngredient.quantity * orderItem.quantity;

        // Restore to raw stock (since it was deducted from raw stock when order was placed)
        await prisma.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            rawStock: {
              increment: quantityToRestore,
            },
          },
        });

        // Create stock movement record for the restoration
        await prisma.stockMovement.create({
          data: {
            inventoryItemId: inventoryItem.id,
            type: 'ADJUSTMENT',
            quantity: quantityToRestore,
            unit: inventoryItem.unit,
            affectedState: 'RAW',
            reason: `Restored from cancelled order ${order.orderNumber}`,
            performedBy: session.user.email || 'system',
          },
        });
      }
    }

    // Update order status to CANCELLED
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        customerNotes: reason
          ? `${order.customerNotes ? order.customerNotes + '\n\n' : ''}Cancellation reason: ${reason}`
          : order.customerNotes,
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    // If payment was made online, process refund
    // (This would integrate with payment gateway in production)
    let refundStatus = null;
    if (order.paymentStatus === 'PAID' && order.paymentMethod !== 'CASH') {
      // TODO: Integrate with payment gateway for refund
      refundStatus = 'pending';

      // For now, just update payment status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'REFUNDED',
        },
      });
    }

    return NextResponse.json({
      message: 'Order cancelled successfully',
      order: updatedOrder,
      inventoryRestored: true,
      refundStatus,
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
