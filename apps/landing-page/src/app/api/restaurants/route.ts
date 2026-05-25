import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: {
        status: 'OPEN'
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        postalCode: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
