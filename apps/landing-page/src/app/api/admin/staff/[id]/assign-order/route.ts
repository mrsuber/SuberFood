import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/staff/[id]/assign-order
 * Assign a staff member to an order
 *
 * Body:
 * - orderId: Order ID to assign
 * - assignmentType: 'chef' | 'waiter'
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

    // Check permissions
    const userRole = session.user.role;
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'RESTAURANT_MANAGER', 'RESTAURANT_STAFF'];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id: staffId } = params;
    const body = await request.json();
    const { orderId, assignmentType } = body;

    if (!orderId || !assignmentType) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, assignmentType' },
        { status: 400 }
      );
    }

    if (!['chef', 'waiter'].includes(assignmentType)) {
      return NextResponse.json(
        { error: 'Invalid assignmentType. Must be "chef" or "waiter"' },
        { status: 400 }
      );
    }

    // Check if staff exists and is active
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    if (staff.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Staff member is not active' },
        { status: 400 }
      );
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        preparation: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify staff role matches assignment type
    if (assignmentType === 'chef') {
      const chefRoles = ['CHEF', 'SOUS_CHEF', 'LINE_COOK'];
      if (!chefRoles.includes(staff.role)) {
        return NextResponse.json(
          { error: `Staff member role (${staff.role}) is not a chef role` },
          { status: 400 }
        );
      }

      // Create or update order preparation
      let preparation;
      if (order.preparation) {
        preparation = await prisma.orderPreparation.update({
          where: { orderId },
          data: {
            chefId: staffId,
            status: order.preparation.status === 'PENDING' ? 'PREPARING' : order.preparation.status,
            startedAt: order.preparation.startedAt || new Date(),
          },
        });
      } else {
        preparation = await prisma.orderPreparation.create({
          data: {
            orderId,
            chefId: staffId,
            status: 'PREPARING',
            startedAt: new Date(),
          },
        });
      }

      // Update staff performance
      await prisma.staff.update({
        where: { id: staffId },
        data: {
          ordersCompleted: {
            increment: 0, // Will increment when order is marked as ready
          },
        },
      });

      return NextResponse.json({
        message: `Chef ${staff.user.name} assigned to order ${order.orderNumber}`,
        preparation,
      });
    } else if (assignmentType === 'waiter') {
      const waiterRoles = ['WAITER', 'HOST'];
      if (!waiterRoles.includes(staff.role)) {
        return NextResponse.json(
          { error: `Staff member role (${staff.role}) is not a waiter role` },
          { status: 400 }
        );
      }

      // Update order with waiter assignment
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          waiterId: staffId,
        },
        include: {
          waiter: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return NextResponse.json({
        message: `Waiter ${staff.user.name} assigned to order ${order.orderNumber}`,
        order: updatedOrder,
      });
    }

    return NextResponse.json(
      { error: 'Invalid assignment type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error assigning staff to order:', error);
    return NextResponse.json(
      { error: 'Failed to assign staff to order' },
      { status: 500 }
    );
  }
}
