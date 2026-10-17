import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Decimal } from '@prisma/client/runtime/library'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const STATUSES = ['ORDERED', 'RECEIVED', 'QUALITY_CHECK', 'APPROVED', 'REJECTED']

/**
 * PATCH /api/admin/farm-supplies/[id]
 * Body: { status?, markPaid?: boolean, paymentMethod?, paymentReference?, qualityRating?, qualityNotes? }
 * Marking paid also adds the newly paid amount to the farmer's revenue.
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const supply = await prisma.farmSupply.findUnique({ where: { id: params.id } })
    if (!supply) {
      return NextResponse.json({ success: false, error: 'Supply not found' }, { status: 404 })
    }

    const data: any = {}
    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) {
        return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 })
      }
      data.status = body.status
    }
    if (body.qualityRating !== undefined) {
      data.qualityRating = body.qualityRating ? Math.min(5, Math.max(1, parseInt(body.qualityRating, 10))) : null
    }
    if (body.qualityNotes !== undefined) data.qualityNotes = body.qualityNotes || null

    let newlyPaid = new Decimal(0)
    if (body.markPaid && supply.paymentStatus !== 'PAID') {
      newlyPaid = supply.totalCost.minus(supply.paidAmount)
      data.paymentStatus = 'PAID'
      data.paidAmount = supply.totalCost
      data.paidAt = new Date()
      data.paymentMethod = body.paymentMethod || supply.paymentMethod
      data.paymentReference = body.paymentReference || supply.paymentReference
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.farmSupply.update({ where: { id: params.id }, data })
      if (newlyPaid.gt(0)) {
        await tx.farmer.update({ where: { id: supply.farmerId }, data: { totalRevenue: { increment: newlyPaid } } })
      }
      return result
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating farm supply:', error)
    return NextResponse.json({ success: false, error: 'Failed to update supply' }, { status: 500 })
  }
}
