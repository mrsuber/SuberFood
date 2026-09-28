import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

// POST /api/wallet/deposit - Add money to wallet
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { amount, method, metadata } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId: session.user.id },
      });
    }

    const amountDecimal = new Decimal(amount);
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore.add(amountDecimal);

    // Create transaction and update wallet in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create wallet transaction
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'DEPOSIT',
          amount: amountDecimal,
          balanceBefore,
          balanceAfter,
          description: `Deposit via ${method || 'Cash'}`,
          referenceType: 'DEPOSIT',
          metadata: metadata || {},
          createdBy: session.user.id,
        },
      });

      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: balanceAfter,
          totalDeposits: wallet.totalDeposits.add(amountDecimal),
        },
      });

      return { transaction, wallet: updatedWallet };
    });

    return NextResponse.json({
      success: true,
      transaction: result.transaction,
      wallet: result.wallet,
    });
  } catch (error) {
    console.error('Error processing deposit:', error);
    return NextResponse.json(
      { error: 'Failed to process deposit' },
      { status: 500 }
    );
  }
}
