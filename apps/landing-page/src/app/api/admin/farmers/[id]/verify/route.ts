import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/farmers/[id]/verify
 * Verify or unverify a farmer
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const { verified } = body

    if (typeof verified !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'Verified status is required' },
        { status: 400 }
      )
    }

    const farmer = await prisma.farmer.update({
      where: { id },
      data: {
        isVerified: verified,
        verifiedAt: verified ? new Date() : null,
        verifiedBy: verified ? session.user.id : null,
        status: verified ? 'ACTIVE' : 'PENDING_VERIFICATION',
      },
    })

    return NextResponse.json({
      success: true,
      farmer,
      message: verified ? 'Farmer verified successfully' : 'Farmer verification removed',
    })
  } catch (error) {
    console.error('[ADMIN FARMERS] Error verifying farmer:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to verify farmer',
      },
      { status: 500 }
    )
  }
}
