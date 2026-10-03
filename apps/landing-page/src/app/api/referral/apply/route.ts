import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/referral/apply - Apply a referral code
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
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    // Check if user already used a referral code
    const existingReferral = await prisma.referral.findUnique({
      where: { refereeId: session.user.id },
    });

    if (existingReferral) {
      return NextResponse.json(
        { error: 'You have already used a referral code' },
        { status: 400 }
      );
    }

    // Find referral code
    const referralCode = await prisma.referralCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!referralCode) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 404 }
      );
    }

    // Check if not self-referral
    if (referralCode.userId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot use your own referral code' },
        { status: 400 }
      );
    }

    // Check if referral code is active
    if (!referralCode.isActive || referralCode.isSuspended) {
      return NextResponse.json(
        { error: 'This referral code is not active' },
        { status: 400 }
      );
    }

    // Create referral relationship
    const referral = await prisma.$transaction(async (tx) => {
      const newReferral = await tx.referral.create({
        data: {
          referrerId: referralCode.userId,
          referralCodeId: referralCode.id,
          refereeId: session.user.id,
          status: 'PENDING',
        },
      });

      // Update referral code stats
      await tx.referralCode.update({
        where: { id: referralCode.id },
        data: {
          totalReferrals: {
            increment: 1,
          },
        },
      });

      return newReferral;
    });

    return NextResponse.json({
      success: true,
      referral,
      message: `Referral code applied! You'll help your referrer earn when you make purchases.`,
    });
  } catch (error) {
    console.error('Error applying referral code:', error);
    return NextResponse.json(
      { error: 'Failed to apply referral code' },
      { status: 500 }
    );
  }
}

// GET /api/referral/apply?code=XXX - Validate referral code (before applying)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    // Find referral code
    const referralCode = await prisma.referralCode.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!referralCode) {
      return NextResponse.json(
        { valid: false, error: 'Invalid referral code' },
        { status: 404 }
      );
    }

    if (!referralCode.isActive || referralCode.isSuspended) {
      return NextResponse.json(
        { valid: false, error: 'This referral code is not active' },
        { status: 400 }
      );
    }

    const referrerName = referralCode.user.firstName || referralCode.user.lastName || 'Someone';

    return NextResponse.json({
      valid: true,
      referralCode: {
        code: referralCode.code,
        referrerName,
        totalReferrals: referralCode.totalReferrals,
      },
      message: `Valid code from ${referrerName}. You'll both benefit!`,
    });
  } catch (error) {
    console.error('Error validating referral code:', error);
    return NextResponse.json(
      { error: 'Failed to validate referral code' },
      { status: 500 }
    );
  }
}
