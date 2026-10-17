import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const STATUSES = ['OPERATIONAL', 'MAINTENANCE', 'CLOSED']

/** PATCH /api/admin/processing-facilities/[id] — body: { name?, location?, capacity?, status? } */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()
    const data: any = {}
    if (body.name) data.name = String(body.name).trim()
    if (body.location) data.location = String(body.location).trim()
    if (body.capacity !== undefined && parseFloat(body.capacity) >= 0) data.capacity = parseFloat(body.capacity)
    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) {
        return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 })
      }
      data.status = body.status
    }
    const item = await prisma.processingFacility.update({ where: { id: params.id }, data })
    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error('Error updating processing facilities:', error)
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 })
  }
}
