import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/admin/verifications/[id]/review - Approve or reject verification
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
    const { approved, rejectionReason } = body;

    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'Approval status is required' },
        { status: 400 }
      );
    }

    if (!approved && !rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required when rejecting' },
        { status: 400 }
      );
    }

    // Get verification
    const verification = await prisma.userVerification.findUnique({
      where: { id: params.id },
      include: {
        referralCode: true,
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      );
    }

    if (verification.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'This verification has already been processed' },
        { status: 400 }
      );
    }

    // Update verification and referral code
    const result = await prisma.$transaction(async (tx) => {
      // Update verification
      const updated = await tx.userVerification.update({
        where: { id: params.id },
        data: {
          status: approved ? 'VERIFIED' : 'REJECTED',
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          rejectionReason: approved ? null : rejectionReason,
        },
      });

      // Update referral code
      await tx.referralCode.update({
        where: { id: verification.referralCodeId },
        data: {
          isVerified: approved,
          isSuspended: !approved,
          suspensionReason: approved ? null : rejectionReason,
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      verification: result,
      message: approved
        ? 'Verification approved. User can now earn referral commissions.'
        : 'Verification rejected',
    });
  } catch (error) {
    console.error('Error processing verification:', error);
    return NextResponse.json(
      { error: 'Failed to process verification' },
      { status: 500 }
    );
  }
}
