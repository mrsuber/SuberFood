import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/locations/[id]
 * Public endpoint to get detailed information about a specific location
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const location = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        // Include parent restaurant info if this is a branch
        parentRestaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            branchCode: true,
          },
        },
        // Include child branches if this is a main branch
        branches: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
            address: true,
            branchCode: true,
            status: true,
            phone: true,
          },
          where: {
            status: 'OPEN', // Only show open branches
          },
        },
        // Include staff count by role
        staff: {
          select: {
            id: true,
            role: true,
            status: true,
          },
          where: {
            status: 'ACTIVE',
          },
        },
        // Include equipment count
        equipment: {
          select: {
            id: true,
            status: true,
          },
          where: {
            status: {
              in: ['OPERATIONAL', 'MAINTENANCE_REQUIRED'],
            },
          },
        },
      },
    });

    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    // Calculate staff statistics
    const staffStats = location.staff.reduce((acc, staff) => {
      acc[staff.role] = (acc[staff.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate equipment statistics
    const equipmentStats = {
      operational: location.equipment.filter(e => e.status === 'OPERATIONAL').length,
      maintenanceRequired: location.equipment.filter(e => e.status === 'MAINTENANCE_REQUIRED').length,
      total: location.equipment.length,
    };

    // Remove sensitive staff/equipment details from response
    const { staff, equipment, ...locationData } = location;

    return NextResponse.json({
      ...locationData,
      stats: {
        staff: staffStats,
        equipment: equipmentStats,
        totalStaff: staff.length,
        totalBranches: location.branches.length,
      },
    });
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location details' },
      { status: 500 }
    );
  }
}
