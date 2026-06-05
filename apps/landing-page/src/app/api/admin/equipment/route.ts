import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/equipment
 * List all equipment with optional filters
 *
 * Query params:
 * - restaurantId: Filter by restaurant location
 * - type: Filter by equipment type
 * - status: Filter by status (OPERATIONAL, MAINTENANCE_REQUIRED, etc.)
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    // Build filter
    const where: any = {};

    if (restaurantId) {
      where.restaurantId = restaurantId;
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    const equipment = await prisma.equipment.findMany({
      where,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            branchCode: true,
          },
        },
        maintenanceLogs: {
          select: {
            id: true,
            maintenanceType: true,
            cost: true,
            startDate: true,
            completedDate: true,
          },
          orderBy: {
            startDate: 'desc',
          },
          take: 5,
        },
        _count: {
          select: {
            maintenanceLogs: true,
            usageLogs: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { type: 'asc' },
        { name: 'asc' },
      ],
    });

    // Calculate statistics
    const stats = {
      total: equipment.length,
      byType: equipment.reduce((acc, e) => {
        acc[e.type] = (acc[e.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byStatus: equipment.reduce((acc, e) => {
        acc[e.status] = (acc[e.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalMaintenanceCost: equipment.reduce((sum, e) => {
        const cost = e.maintenanceLogs.reduce((logSum, log) => logSum + log.cost, 0);
        return sum + cost;
      }, 0),
      needsMaintenance: equipment.filter(e => e.status === 'MAINTENANCE_REQUIRED').length,
    };

    return NextResponse.json({
      equipment,
      stats,
      total: equipment.length,
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/equipment
 * Add new equipment
 *
 * Body:
 * - restaurantId: Restaurant location ID
 * - name: Equipment name
 * - type: Equipment type
 * - manufacturer?: Manufacturer name
 * - model?: Model number
 * - serialNumber?: Serial number
 * - purchaseDate?: Purchase date (ISO string)
 * - purchasePrice?: Purchase price
 * - warrantyExpiry?: Warranty expiry date (ISO string)
 * - maintenanceCostBudget?: Allocated maintenance budget
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      restaurantId,
      name,
      type,
      manufacturer,
      model,
      serialNumber,
      purchaseDate,
      purchasePrice,
      warrantyExpiry,
      maintenanceCostBudget,
      notes,
    } = body;

    // Validate required fields
    if (!restaurantId || !name || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: restaurantId, name, type' },
        { status: 400 }
      );
    }

    // Verify restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true, name: true },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Create equipment
    const equipment = await prisma.equipment.create({
      data: {
        restaurantId,
        name,
        type,
        manufacturer: manufacturer || null,
        model: model || null,
        serialNumber: serialNumber || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
        maintenanceCostBudget: maintenanceCostBudget ? parseFloat(maintenanceCostBudget) : null,
        notes: notes || null,
        status: 'OPERATIONAL',
      },
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
      message: 'Equipment added successfully',
      equipment,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating equipment:', error);
    return NextResponse.json(
      { error: 'Failed to add equipment' },
      { status: 500 }
    );
  }
}
