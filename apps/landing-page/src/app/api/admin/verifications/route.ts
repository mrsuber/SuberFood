import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/verifications - Get all verification requests
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

    // Get all verifications with user and referral code info
    const verifications = await prisma.userVerification.findMany({
      orderBy: [
        { status: 'asc' }, // PENDING first
        { createdAt: 'desc' },
      ],
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        referralCode: {
          select: {
            code: true,
            totalReferrals: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      verifications,
      count: verifications.length,
      pendingCount: verifications.filter(v => v.status === 'PENDING').length,
    });
  } catch (error) {
    console.error('Error fetching verifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verifications' },
      { status: 500 }
    );
  }
}
