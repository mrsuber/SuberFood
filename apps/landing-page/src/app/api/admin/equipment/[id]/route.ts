import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/equipment/[id]
 * Get detailed information about specific equipment
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

    const userRole = session.user.role;
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'RESTAURANT_MANAGER', 'RESTAURANT_STAFF'];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = params;

    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
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
        maintenanceLogs: {
          orderBy: {
            startDate: 'desc',
          },
        },
        usageLogs: {
          orderBy: {
            usedAt: 'desc',
          },
          take: 50,
        },
        _count: {
          select: {
            maintenanceLogs: true,
            usageLogs: true,
          },
        },
      },
    });

    if (!equipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      );
    }

    // Calculate metrics
    const totalMaintenanceCost = equipment.maintenanceLogs.reduce(
      (sum, log) => sum + log.cost,
      0
    );

    const completedMaintenance = equipment.maintenanceLogs.filter(
      log => log.completedDate !== null
    ).length;

    const pendingMaintenance = equipment.maintenanceLogs.filter(
      log => log.completedDate === null
    ).length;

    // Calculate average usage duration
    const usageWithDuration = equipment.usageLogs.filter(log => log.durationMinutes !== null);
    const averageUsageDuration = usageWithDuration.length > 0
      ? usageWithDuration.reduce((sum, log) => sum + (log.durationMinutes || 0), 0) / usageWithDuration.length
      : 0;

    return NextResponse.json({
      ...equipment,
      metrics: {
        totalMaintenanceCost,
        completedMaintenance,
        pendingMaintenance,
        totalUsageLogs: equipment._count.usageLogs,
        averageUsageDuration: Math.round(averageUsageDuration),
      },
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment details' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/equipment/[id]
 * Update equipment information
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

    // Check if equipment exists
    const existingEquipment = await prisma.equipment.findUnique({
      where: { id },
    });

    if (!existingEquipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.manufacturer !== undefined) updateData.manufacturer = body.manufacturer || null;
    if (body.model !== undefined) updateData.model = body.model || null;
    if (body.serialNumber !== undefined) updateData.serialNumber = body.serialNumber || null;
    if (body.purchasePrice !== undefined) updateData.purchasePrice = body.purchasePrice ? parseFloat(body.purchasePrice) : null;
    if (body.maintenanceCostBudget !== undefined) updateData.maintenanceCostBudget = body.maintenanceCostBudget ? parseFloat(body.maintenanceCostBudget) : null;
    if (body.notes !== undefined) updateData.notes = body.notes || null;

    if (body.purchaseDate !== undefined) {
      updateData.purchaseDate = body.purchaseDate ? new Date(body.purchaseDate) : null;
    }
    if (body.warrantyExpiry !== undefined) {
      updateData.warrantyExpiry = body.warrantyExpiry ? new Date(body.warrantyExpiry) : null;
    }
    if (body.lastMaintenanceDate !== undefined) {
      updateData.lastMaintenanceDate = body.lastMaintenanceDate ? new Date(body.lastMaintenanceDate) : null;
    }
    if (body.nextMaintenanceDate !== undefined) {
      updateData.nextMaintenanceDate = body.nextMaintenanceDate ? new Date(body.nextMaintenanceDate) : null;
    }

    // Update equipment
    const updatedEquipment = await prisma.equipment.update({
      where: { id },
      data: updateData,
      include: {
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
      message: 'Equipment updated successfully',
      equipment: updatedEquipment,
    });
  } catch (error) {
    console.error('Error updating equipment:', error);
    return NextResponse.json(
      { error: 'Failed to update equipment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/equipment/[id]
 * Delete equipment (hard delete)
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

    const userRole = session.user.role;
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN'];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only SUPER_ADMIN and ADMIN can delete equipment.' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Check if equipment exists
    const existingEquipment = await prisma.equipment.findUnique({
      where: { id },
    });

    if (!existingEquipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      );
    }

    // Better approach: Mark as RETIRED instead of hard delete
    const updatedEquipment = await prisma.equipment.update({
      where: { id },
      data: {
        status: 'RETIRED',
      },
    });

    return NextResponse.json({
      message: 'Equipment marked as retired',
      equipment: updatedEquipment,
    });
  } catch (error) {
    console.error('Error retiring equipment:', error);
    return NextResponse.json(
      { error: 'Failed to retire equipment' },
      { status: 500 }
    );
  }
}
