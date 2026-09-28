import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Generate unique referral code
function generateReferralCode(name: string): string {
  const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 6);
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `${cleanName}${random}`;
}

// GET /api/referral - Get user's referral details
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get or create referral code
    let referralCode = await prisma.referralCode.findUnique({
      where: { userId: session.user.id },
      include: {
        verification: true,
        referrals: {
          include: {
            referee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                createdAt: true,
              },
            },
            earnings: {
              include: {
                order: {
                  select: {
                    orderNumber: true,
                    totalAmount: true,
                    createdAt: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        earnings: {
          include: {
            order: {
              select: {
                orderNumber: true,
                totalAmount: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    // Create referral code if doesn't exist
    if (!referralCode) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const name = user.firstName || user.name || user.email.split('@')[0];
      let code = generateReferralCode(name);

      // Ensure code is unique
      let codeExists = await prisma.referralCode.findUnique({
        where: { code },
      });

      let attempts = 0;
      while (codeExists && attempts < 10) {
        code = generateReferralCode(name);
        codeExists = await prisma.referralCode.findUnique({
          where: { code },
        });
        attempts++;
      }

      referralCode = await prisma.referralCode.create({
        data: {
          userId: session.user.id,
          code,
        },
        include: {
          verification: true,
          referrals: {
            include: {
              referee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  createdAt: true,
                },
              },
              earnings: {
                include: {
                  order: {
                    select: {
                      orderNumber: true,
                      totalAmount: true,
                      createdAt: true,
                    },
                  },
                },
              },
            },
          },
          earnings: true,
        },
      });
    }

    // Calculate summary stats
    const totalPendingEarnings = referralCode.earnings
      .filter((e) => !e.isPaid)
      .reduce((sum, e) => sum + Number(e.commissionAmount), 0);

    const totalPaidEarnings = referralCode.earnings
      .filter((e) => e.isPaid)
      .reduce((sum, e) => sum + Number(e.commissionAmount), 0);

    return NextResponse.json({
      success: true,
      referralCode,
      summary: {
        totalReferrals: referralCode.totalReferrals,
        activeReferrals: referralCode.activeReferrals,
        totalEarnings: Number(referralCode.totalEarnings),
        lifetimeEarnings: Number(referralCode.lifetimeEarnings),
        pendingEarnings: totalPendingEarnings,
        paidEarnings: totalPaidEarnings,
      },
    });
  } catch (error) {
    console.error('Error fetching referral details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referral details' },
      { status: 500 }
    );
  }
}
