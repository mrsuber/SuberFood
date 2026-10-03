import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/delivery-zones - Get all active delivery zones
export async function GET(req: NextRequest) {
  try {
    const deliveryZones = await prisma.deliveryZone.findMany({
      where: { isActive: true },
      include: {
        areas: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      deliveryZones,
    });
  } catch (error) {
    console.error('Error fetching delivery zones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery zones' },
      { status: 500 }
    );
  }
}

// POST /api/delivery-zones - Create new delivery zone (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, description, deliveryFee, areas } = body;

    if (!name || !deliveryFee) {
      return NextResponse.json(
        { error: 'Name and delivery fee are required' },
        { status: 400 }
      );
    }

    // Create delivery zone with areas
    const deliveryZone = await prisma.deliveryZone.create({
      data: {
        name,
        description,
        deliveryFee,
        areas: {
          create: (areas || []).map((areaName: string) => ({
            areaName,
          })),
        },
      },
      include: {
        areas: true,
      },
    });

    return NextResponse.json({
      success: true,
      deliveryZone,
    });
  } catch (error) {
    console.error('Error creating delivery zone:', error);
    return NextResponse.json(
      { error: 'Failed to create delivery zone' },
      { status: 500 }
    );
  }
}
