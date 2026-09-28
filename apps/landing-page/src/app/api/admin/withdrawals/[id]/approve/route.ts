import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

// POST /api/admin/withdrawals/[id]/approve - Approve or reject withdrawal
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
    const { approved, adminNotes } = body;

    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'Approval status is required' },
        { status: 400 }
      );
    }

    // Get withdrawal request
    const withdrawalRequest = await prisma.withdrawalRequest.findUnique({
      where: { id: params.id },
      include: {
        wallet: true,
      },
    });

    if (!withdrawalRequest) {
      return NextResponse.json(
        { error: 'Withdrawal request not found' },
        { status: 404 }
      );
    }

    if (withdrawalRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'This withdrawal has already been processed' },
        { status: 400 }
      );
    }

    // Process approval
    const result = await prisma.$transaction(async (tx) => {
      if (approved) {
        // Check sufficient balance
        if (withdrawalRequest.wallet.balance.lessThan(withdrawalRequest.amount)) {
          throw new Error('Insufficient wallet balance');
        }

        const balanceBefore = withdrawalRequest.wallet.balance;
        const balanceAfter = balanceBefore.minus(withdrawalRequest.amount);

        // Create withdrawal transaction
        const transaction = await tx.walletTransaction.create({
          data: {
            walletId: withdrawalRequest.walletId,
            type: 'WITHDRAWAL',
            amount: withdrawalRequest.amount,
            balanceBefore,
            balanceAfter,
            description: `Withdrawal via ${withdrawalRequest.method}`,
            referenceType: 'WITHDRAWAL',
            referenceId: withdrawalRequest.id,
            createdBy: session.user.id,
          },
        });

        // Update wallet balance
        await tx.wallet.update({
          where: { id: withdrawalRequest.walletId },
          data: {
            balance: balanceAfter,
            totalWithdrawals: withdrawalRequest.wallet.totalWithdrawals.add(withdrawalRequest.amount),
          },
        });

        // Update withdrawal request
        const updated = await tx.withdrawalRequest.update({
          where: { id: params.id },
          data: {
            status: 'COMPLETED',
            reviewedBy: session.user.id,
            reviewedAt: new Date(),
            adminNotes,
          },
        });

        return { withdrawalRequest: updated, transaction };
      } else {
        // Reject withdrawal
        const updated = await tx.withdrawalRequest.update({
          where: { id: params.id },
          data: {
            status: 'REJECTED',
            reviewedBy: session.user.id,
            reviewedAt: new Date(),
            adminNotes,
          },
        });

        return { withdrawalRequest: updated };
      }
    });

    return NextResponse.json({
      success: true,
      ...result,
      message: approved
        ? 'Withdrawal approved successfully'
        : 'Withdrawal rejected',
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process withdrawal' },
      { status: 500 }
    );
  }
}
