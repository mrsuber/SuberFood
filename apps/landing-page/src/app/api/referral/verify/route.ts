import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/referral/verify - Submit verification documents
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
    const { idCardUrl, photoUrl, phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Get referral code
    const referralCode = await prisma.referralCode.findUnique({
      where: { userId: session.user.id },
      include: { verification: true },
    });

    if (!referralCode) {
      return NextResponse.json(
        { error: 'Referral code not found. Please create one first.' },
        { status: 404 }
      );
    }

    // Check if already verified
    if (referralCode.verification?.status === 'VERIFIED') {
      return NextResponse.json(
        { error: 'Account already verified' },
        { status: 400 }
      );
    }

    // Create or update verification
    const verification = await prisma.userVerification.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        referralCodeId: referralCode.id,
        idCardUrl,
        photoUrl,
        phoneNumber,
        status: 'PENDING',
      },
      update: {
        idCardUrl,
        photoUrl,
        phoneNumber,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      verification,
      message: 'Verification submitted successfully. Admin will review soon.',
    });
  } catch (error) {
    console.error('Error submitting verification:', error);
    return NextResponse.json(
      { error: 'Failed to submit verification' },
      { status: 500 }
    );
  }
}
