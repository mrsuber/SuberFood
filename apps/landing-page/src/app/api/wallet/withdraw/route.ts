import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

// POST /api/wallet/withdraw - Request withdrawal
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
    const { amount, method, phoneNumber, accountDetails } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!method) {
      return NextResponse.json(
        { error: 'Withdrawal method is required' },
        { status: 400 }
      );
    }

    // Validate method
    const validMethods = ['CASH', 'MTN_MOMO', 'ORANGE_MOMO', 'BANK_TRANSFER'];
    if (!validMethods.includes(method)) {
      return NextResponse.json(
        { error: 'Invalid withdrawal method' },
        { status: 400 }
      );
    }

    // Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    const amountDecimal = new Decimal(amount);

    // Check sufficient balance
    if (wallet.balance.lessThan(amountDecimal)) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Create withdrawal request
    const withdrawalRequest = await prisma.withdrawalRequest.create({
      data: {
        walletId: wallet.id,
        amount: amountDecimal,
        method,
        phoneNumber,
        accountDetails,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      withdrawalRequest,
      message: 'Withdrawal request submitted. Admin will process it soon.',
    });
  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    return NextResponse.json(
      { error: 'Failed to create withdrawal request' },
      { status: 500 }
    );
  }
}

// GET /api/wallet/withdraw - Get withdrawal requests
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    });

    if (!wallet) {
      return NextResponse.json({ withdrawalRequests: [] });
    }

    // Get withdrawal requests
    const withdrawalRequests = await prisma.withdrawalRequest.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      withdrawalRequests,
    });
  } catch (error) {
    console.error('Error fetching withdrawal requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch withdrawal requests' },
      { status: 500 }
    );
  }
}
