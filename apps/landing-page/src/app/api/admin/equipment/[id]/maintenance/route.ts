import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/equipment/[id]/maintenance
 * Get maintenance logs for specific equipment
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

    const { id: equipmentId } = params;

    // Verify equipment exists
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });

    if (!equipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      );
    }

    const maintenanceLogs = await prisma.maintenanceLog.findMany({
      where: { equipmentId },
      orderBy: {
        startDate: 'desc',
      },
    });

    const stats = {
      total: maintenanceLogs.length,
      completed: maintenanceLogs.filter(log => log.completedDate !== null).length,
      pending: maintenanceLogs.filter(log => log.completedDate === null).length,
      totalCost: maintenanceLogs.reduce((sum, log) => sum + log.cost, 0),
      byType: maintenanceLogs.reduce((acc, log) => {
        acc[log.maintenanceType] = (acc[log.maintenanceType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      equipment,
      maintenanceLogs,
      stats,
    });
  } catch (error) {
    console.error('Error fetching maintenance logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch maintenance logs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/equipment/[id]/maintenance
 * Log new maintenance for equipment
 *
 * Body:
 * - maintenanceType: Type of maintenance (ROUTINE, REPAIR, EMERGENCY, INSPECTION)
 * - description: Description of maintenance work
 * - cost: Cost of maintenance
 * - performedBy?: Name of technician or company
 * - performedById?: Staff ID if performed internally
 * - startDate: Start date (ISO string)
 * - completedDate?: Completion date (ISO string) - optional if ongoing
 * - notes?: Additional notes
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

    const userRole = session.user.role;
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'RESTAURANT_MANAGER', 'RESTAURANT_STAFF'];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id: equipmentId } = params;
    const body = await request.json();
    const {
      maintenanceType,
      description,
      cost,
      performedBy,
      performedById,
      startDate,
      completedDate,
      notes,
    } = body;

    // Validate required fields
    if (!maintenanceType || !description || cost === undefined || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields: maintenanceType, description, cost, startDate' },
        { status: 400 }
      );
    }

    // Verify equipment exists
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      );
    }

    // Create maintenance log
    const maintenanceLog = await prisma.maintenanceLog.create({
      data: {
        equipmentId,
        maintenanceType,
        description,
        cost: parseFloat(cost),
        performedBy: performedBy || null,
        performedById: performedById || null,
        startDate: new Date(startDate),
        completedDate: completedDate ? new Date(completedDate) : null,
        notes: notes || null,
      },
    });

    // Update equipment maintenance dates and status
    const updateData: any = {
      lastMaintenanceDate: new Date(startDate),
    };

    // If this is completed maintenance, update equipment status
    if (completedDate) {
      updateData.status = 'OPERATIONAL';
    } else {
      updateData.status = 'UNDER_MAINTENANCE';
    }

    // If this is routine maintenance, schedule next one (e.g., 90 days later)
    if (maintenanceType === 'ROUTINE' && completedDate) {
      const nextDate = new Date(completedDate);
      nextDate.setDate(nextDate.getDate() + 90);
      updateData.nextMaintenanceDate = nextDate;
    }

    await prisma.equipment.update({
      where: { id: equipmentId },
      data: updateData,
    });

    return NextResponse.json({
      message: 'Maintenance log created successfully',
      maintenanceLog,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating maintenance log:', error);
    return NextResponse.json(
      { error: 'Failed to create maintenance log' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/equipment/[id]/maintenance/[logId]
 * Update maintenance log (mainly to mark as completed)
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

    const body = await request.json();
    const { logId, completedDate, notes, cost } = body;

    if (!logId) {
      return NextResponse.json(
        { error: 'Missing logId in request body' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (completedDate !== undefined) updateData.completedDate = completedDate ? new Date(completedDate) : null;
    if (notes !== undefined) updateData.notes = notes;
    if (cost !== undefined) updateData.cost = parseFloat(cost);

    const updatedLog = await prisma.maintenanceLog.update({
      where: { id: logId },
      data: updateData,
    });

    // If maintenance is now complete, update equipment status
    if (completedDate) {
      await prisma.equipment.update({
        where: { id: updatedLog.equipmentId },
        data: {
          status: 'OPERATIONAL',
        },
      });
    }

    return NextResponse.json({
      message: 'Maintenance log updated successfully',
      maintenanceLog: updatedLog,
    });
  } catch (error) {
    console.error('Error updating maintenance log:', error);
    return NextResponse.json(
      { error: 'Failed to update maintenance log' },
      { status: 500 }
    );
  }
}
