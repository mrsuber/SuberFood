import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/bookings - Get all bookings (admin only)
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const productId = searchParams.get('productId');

    // Build where clause
    const where: any = {
      orderType: 'BOOKING',
    };

    if (status && status !== 'ALL') {
      where.bookingStatus = status;
    }

    // Get bookings
    const bookings = await prisma.farmOrder.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                thumbnail: true,
                category: true,
                priceMin: true,
                priceMax: true,
                confirmedPrice: true,
              },
            },
          },
        },
        statusHistory: {
          orderBy: { timestamp: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by product for easy management
    const bookingsByProduct: Record<string, any> = {};

    bookings.forEach((booking) => {
      booking.items.forEach((item) => {
        const productId = item.productId;
        if (!bookingsByProduct[productId]) {
          bookingsByProduct[productId] = {
            product: item.product,
            bookings: [],
            totalQuantity: 0,
            totalCustomers: 0,
          };
        }
        bookingsByProduct[productId].bookings.push({
          ...booking,
          item,
        });
        bookingsByProduct[productId].totalQuantity += Number(item.quantity);
        bookingsByProduct[productId].totalCustomers += 1;
      });
    });

    return NextResponse.json({
      success: true,
      bookings,
      bookingsByProduct,
      stats: {
        total: bookings.length,
        pendingPrice: bookings.filter((b) => b.bookingStatus === 'PENDING_PRICE').length,
        priceConfirmed: bookings.filter((b) => b.bookingStatus === 'PRICE_CONFIRMED').length,
        customerApproved: bookings.filter((b) => b.bookingStatus === 'CUSTOMER_APPROVED').length,
        collected: bookings.filter((b) => b.bookingStatus === 'COLLECTED').length,
      },
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
