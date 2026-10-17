import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const STATUSES = ['PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']

/**
 * PATCH /api/admin/reservations/[id]
 * Body: { status?, notes?, tableId? }
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data: any = {}
    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) {
        return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 })
      }
      data.status = body.status
    }
    if (body.notes !== undefined) data.notes = typeof body.notes === 'string' ? body.notes.slice(0, 2000) : null
    if (body.tableId !== undefined) data.tableId = body.tableId || null

    const reservation = await prisma.reservation.update({ where: { id: params.id }, data })
    return NextResponse.json({ success: true, data: reservation })
  } catch (error) {
    console.error('Error updating reservation:', error)
    return NextResponse.json({ success: false, error: 'Failed to update reservation' }, { status: 500 })
  }
}
