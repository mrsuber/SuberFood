import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { menuItemId: string } }
) {
  try {
    const { menuItemId } = params;

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: {
        category: {
          include: {
            restaurant: true
          }
        }
      }
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    // Transform the response to include restaurant info at top level
    const response = {
      ...menuItem,
      restaurantId: menuItem.category.restaurantId,
      restaurantName: menuItem.category.restaurant.name,
      restaurantSlug: menuItem.category.restaurant.slug,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
