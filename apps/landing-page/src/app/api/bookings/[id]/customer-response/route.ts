import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

// POST /api/bookings/[id]/customer-response - Customer approves or declines confirmed price
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

    const body = await req.json();
    const { approved, newQuantity } = body;

    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'Approval status is required' },
        { status: 400 }
      );
    }

    // Get booking
    const booking = await prisma.farmOrder.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        user: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only respond to your own bookings' },
        { status: 403 }
      );
    }

    if (booking.bookingStatus !== 'PRICE_CONFIRMED') {
      return NextResponse.json(
        { error: 'Price has not been confirmed yet' },
        { status: 400 }
      );
    }

    // Update booking based on response
    const updatedBooking = await prisma.$transaction(async (tx) => {
      let updateData: any = {
        customerApprovedAt: new Date(),
      };

      if (approved) {
        // Customer approved the price
        updateData.bookingStatus = 'CUSTOMER_APPROVED';
        updateData.status = 'CONFIRMED';

        // If quantity changed, update it
        if (newQuantity && newQuantity !== Number(booking.items[0]?.quantity)) {
          // Recalculate total based on new quantity
          const pricePerUnit = booking.confirmedTotal!.dividedBy(booking.items[0]?.quantity || 1);
          const newTotal = pricePerUnit.times(newQuantity);

          updateData.confirmedTotal = newTotal;
          updateData.totalAmount = newTotal;
          updateData.subtotal = newTotal;

          // Update item quantity
          await tx.farmOrderItem.update({
            where: { id: booking.items[0].id },
            data: {
              quantity: new Decimal(newQuantity),
              totalPrice: newTotal,
            },
          });

          // Recalculate profit if cost data available
          if (booking.totalCost) {
            const newCostRatio = new Decimal(newQuantity).dividedBy(booking.items[0]?.quantity || 1);
            const newCost = booking.totalCost.times(newCostRatio);
            updateData.totalCost = newCost;
            updateData.profitAmount = newTotal.minus(newCost);
          }
        }
      } else {
        // Customer declined
        updateData.bookingStatus = 'CUSTOMER_DECLINED';
        updateData.status = 'CANCELLED';
        updateData.cancelledAt = new Date();
      }

      // Update order
      const updated = await tx.farmOrder.update({
        where: { id: params.id },
        data: updateData,
      });

      // Add status history
      await tx.farmOrderStatusHistory.create({
        data: {
          orderId: params.id,
          status: updateData.status || booking.status,
          note: approved
            ? `Customer approved price${newQuantity ? ` with adjusted quantity: ${newQuantity}` : ''}`
            : 'Customer declined price',
          updatedBy: session.user.id,
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: approved
        ? 'Booking approved! We will collect your order from the farm.'
        : 'Booking cancelled. Thank you for letting us know.',
    });
  } catch (error) {
    console.error('Error processing customer response:', error);
    return NextResponse.json(
      { error: 'Failed to process response' },
      { status: 500 }
    );
  }
}
