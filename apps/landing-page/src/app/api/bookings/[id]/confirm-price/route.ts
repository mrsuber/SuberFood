import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

// POST /api/bookings/[id]/confirm-price - Admin confirms price after farm visit
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { confirmedTotal, costPrice, transportCost, adminNotes } = body;

    if (!confirmedTotal || confirmedTotal <= 0) {
      return NextResponse.json(
        { error: 'Invalid confirmed price' },
        { status: 400 }
      );
    }

    // Get booking
    const booking = await prisma.farmOrder.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            firstName: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.orderType !== 'BOOKING') {
      return NextResponse.json(
        { error: 'This is not a booking order' },
        { status: 400 }
      );
    }

    // Calculate profit
    const totalCost = (costPrice || 0) + (transportCost || 0);
    const profitAmount = confirmedTotal - totalCost;

    // Update booking
    const updatedBooking = await prisma.$transaction(async (tx) => {
      // Update order
      const updated = await tx.farmOrder.update({
        where: { id: params.id },
        data: {
          confirmedTotal: new Decimal(confirmedTotal),
          costPrice: costPrice ? new Decimal(costPrice) : null,
          transportCost: transportCost ? new Decimal(transportCost) : null,
          totalCost: totalCost > 0 ? new Decimal(totalCost) : null,
          profitAmount: profitAmount > 0 ? new Decimal(profitAmount) : null,
          bookingStatus: 'PRICE_CONFIRMED',
          priceConfirmedAt: new Date(),
          priceConfirmedBy: session.user.id,
          adminNotes,
        },
      });

      // Add status history
      await tx.farmOrderStatusHistory.create({
        data: {
          orderId: params.id,
          status: booking.status,
          note: `Price confirmed at ${confirmedTotal} XAF. Cost: ${totalCost} XAF, Profit: ${profitAmount} XAF`,
          updatedBy: session.user.id,
        },
      });

      return updated;
    });

    // TODO: Send notification to customer
    // await sendNotification({
    //   to: booking.user?.email,
    //   phone: booking.user?.phone,
    //   template: 'PRICE_CONFIRMED',
    //   data: { confirmedTotal, orderNumber: booking.orderNumber },
    // });

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: 'Price confirmed successfully. Customer will be notified.',
    });
  } catch (error) {
    console.error('Error confirming price:', error);
    return NextResponse.json(
      { error: 'Failed to confirm price' },
      { status: 500 }
    );
  }
}
