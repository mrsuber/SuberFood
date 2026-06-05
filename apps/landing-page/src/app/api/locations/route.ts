import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/locations
 * Public endpoint to list all restaurant locations
 *
 * Query params:
 * - city: Filter by city
 * - state: Filter by state
 * - type: Filter by restaurant type (CLASSICAL_FINE_DINING, CAFETERIA, QUICK_SERVICE)
 * - status: Filter by status (OPEN, CLOSED, TEMPORARILY_CLOSED) - defaults to OPEN
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const type = searchParams.get('type');
    const status = searchParams.get('status') || 'OPEN'; // Default to OPEN restaurants

    // Build dynamic filter
    const where: any = {
      status: status as any,
    };

    if (city) {
      where.city = {
        contains: city,
        mode: 'insensitive',
      };
    }

    if (state) {
      where.state = {
        contains: state,
        mode: 'insensitive',
      };
    }

    if (type) {
      where.type = type as any;
    }

    // Fetch all locations with relevant details
    const locations = await prisma.restaurant.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        description: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
        phone: true,
        email: true,
        status: true,
        openingTime: true,
        closingTime: true,
        operatingDays: true,
        capacity: true,
        rating: true,
        latitude: true,
        longitude: true,
        images: true,
        amenities: true,
        parkingInfo: true,
        accessibilityFeatures: true,
        privateRooms: true,
        outdoorSeating: true,
        currentWaitTime: true,
        // Multi-branch fields
        parentRestaurantId: true,
        // isMainBranch: true,  // Temporarily commented for Prisma client compatibility
        // branchCode: true,    // Temporarily commented for Prisma client compatibility
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        // { isMainBranch: 'desc' }, // Temporarily commented for Prisma client compatibility
        { city: 'asc' },
        { name: 'asc' },
      ],
    });

    // Group by parent restaurant if needed
    const mainBranches = locations.filter(loc => !loc.parentRestaurantId);
    const branchesWithParents = locations.filter(loc => loc.parentRestaurantId);

    return NextResponse.json({
      total: locations.length,
      mainBranches: mainBranches.length,
      branches: branchesWithParents.length,
      locations,
      // Optionally group by city for easy filtering on frontend
      cities: [...new Set(locations.map(loc => loc.city))].sort(),
      states: [...new Set(locations.map(loc => loc.state))].sort(),
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}
