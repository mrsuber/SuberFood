import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/staff/[id]
 * Get detailed information about a specific staff member
 */
export async function GET(
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
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'RESTAURANT_MANAGER'];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = params;

    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
            createdAt: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
            address: true,
            branchCode: true,
          },
        },
        ordersAsChef: {
          select: {
            id: true,
            orderId: true,
            status: true,
            createdAt: true,
            readyAt: true,
          },
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
        ordersAsWaiter: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
        deliveries: {
          select: {
            id: true,
            orderId: true,
            status: true,
            assignedAt: true,
            deliveredAt: true,
            isPaid: true,
            amountCollected: true,
          },
          take: 10,
          orderBy: {
            assignedAt: 'desc',
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

    // Calculate performance metrics
    const performanceMetrics = {
      ordersAsChef: staff.ordersAsChef.length,
      ordersAsWaiter: staff.ordersAsWaiter.length,
      deliveries: staff.deliveries.length,
      deliveriesCompleted: staff.deliveries.filter(d => d.status === 'DELIVERED').length,
      unpaidDeliveries: staff.deliveries.filter(d => d.status === 'DELIVERED' && !d.isPaid).length,
      totalCollected: staff.deliveries
        .filter(d => d.isPaid && d.amountCollected)
        .reduce((sum, d) => sum + (d.amountCollected || 0), 0),
    };

    return NextResponse.json({
      ...staff,
      performanceMetrics,
    });
  } catch (error) {
    console.error('Error fetching staff details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff details' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/staff/[id]
 * Update staff member information
 */
export async function PUT(
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
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'RESTAURANT_MANAGER'];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();

    // Check if staff exists
    const existingStaff = await prisma.staff.findUnique({
      where: { id },
    });

    if (!existingStaff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (body.role !== undefined) updateData.role = body.role;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.hourlyRate !== undefined) updateData.hourlyRate = body.hourlyRate ? parseFloat(body.hourlyRate) : null;
    if (body.salary !== undefined) updateData.salary = body.salary ? parseFloat(body.salary) : null;
    if (body.workSchedule !== undefined) updateData.workSchedule = body.workSchedule;
    if (body.restaurantId !== undefined) updateData.restaurantId = body.restaurantId;

    // Handle termination
    if (body.status === 'TERMINATED' && !existingStaff.terminationDate) {
      updateData.terminationDate = new Date();
    }

    // Update staff
    const updatedStaff = await prisma.staff.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Staff member updated successfully',
      staff: updatedStaff,
    });
  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json(
      { error: 'Failed to update staff member' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/staff/[id]
 * Deactivate (soft delete) a staff member
 */
export async function DELETE(
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
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN'];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only SUPER_ADMIN and ADMIN can deactivate staff.' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Check if staff exists
    const existingStaff = await prisma.staff.findUnique({
      where: { id },
    });

    if (!existingStaff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting status to TERMINATED
    const updatedStaff = await prisma.staff.update({
      where: { id },
      data: {
        status: 'TERMINATED',
        terminationDate: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Staff member deactivated successfully',
      staff: updatedStaff,
    });
  } catch (error) {
    console.error('Error deactivating staff:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate staff member' },
      { status: 500 }
    );
  }
}
