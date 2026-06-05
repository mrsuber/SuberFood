import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/equipment/[id]/usage
 * Get usage statistics and logs for specific equipment
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
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'RESTAURANT_MANAGER'];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id: equipmentId } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Verify equipment exists
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      select: {
        id: true,
        name: true,
        type: true,
        totalUsageHours: true,
        usageCount: true,
      },
    });

    if (!equipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      );
    }

    // Build where clause for date filtering
    const where: any = { equipmentId };
    if (startDate || endDate) {
      where.usedAt = {};
      if (startDate) where.usedAt.gte = new Date(startDate);
      if (endDate) where.usedAt.lte = new Date(endDate);
    }

    const usageLogs = await prisma.equipmentUsageLog.findMany({
      where,
      orderBy: {
        usedAt: 'desc',
      },
      take: limit,
    });

    // Calculate statistics
    const logsWithDuration = usageLogs.filter(log => log.durationMinutes !== null);
    const totalDurationMinutes = logsWithDuration.reduce(
      (sum, log) => sum + (log.durationMinutes || 0),
      0
    );
    const averageDuration = logsWithDuration.length > 0
      ? totalDurationMinutes / logsWithDuration.length
      : 0;

    // Group by date for trends
    const usageByDate = usageLogs.reduce((acc, log) => {
      const date = log.usedAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          count: 0,
          totalMinutes: 0,
        };
      }
      acc[date].count++;
      if (log.durationMinutes) {
        acc[date].totalMinutes += log.durationMinutes;
      }
      return acc;
    }, {} as Record<string, { date: string; count: number; totalMinutes: number }>);

    const stats = {
      totalUsageCount: equipment.usageCount,
      totalUsageHours: equipment.totalUsageHours,
      recentUsageCount: usageLogs.length,
      averageDurationMinutes: Math.round(averageDuration),
      totalDurationHours: Math.round(totalDurationMinutes / 60 * 100) / 100,
      usageByDate: Object.values(usageByDate).sort((a, b) =>
        b.date.localeCompare(a.date)
      ),
    };

    return NextResponse.json({
      equipment,
      usageLogs,
      stats,
    });
  } catch (error) {
    console.error('Error fetching usage statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/equipment/[id]/usage
 * Log equipment usage (typically called automatically when equipment is used in recipes)
 *
 * Body:
 * - orderId?: Associated order ID (optional)
 * - recipeId?: Associated recipe ID (optional)
 * - durationMinutes?: Duration of usage in minutes (optional)
 * - notes?: Additional notes (optional)
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

    const { id: equipmentId } = params;
    const body = await request.json();
    const { orderId, recipeId, durationMinutes, notes } = body;

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

    // Create usage log
    const usageLog = await prisma.equipmentUsageLog.create({
      data: {
        equipmentId,
        orderId: orderId || null,
        recipeId: recipeId || null,
        durationMinutes: durationMinutes ? parseInt(durationMinutes) : null,
        notes: notes || null,
        usedAt: new Date(),
      },
    });

    // Update equipment usage counters
    const updateData: any = {
      usageCount: {
        increment: 1,
      },
    };

    if (durationMinutes) {
      const hoursToAdd = parseInt(durationMinutes) / 60;
      updateData.totalUsageHours = {
        increment: hoursToAdd,
      };
    }

    await prisma.equipment.update({
      where: { id: equipmentId },
      data: updateData,
    });

    return NextResponse.json({
      message: 'Equipment usage logged successfully',
      usageLog,
    }, { status: 201 });
  } catch (error) {
    console.error('Error logging equipment usage:', error);
    return NextResponse.json(
      { error: 'Failed to log equipment usage' },
      { status: 500 }
    );
  }
}
