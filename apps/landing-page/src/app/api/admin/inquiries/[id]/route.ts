import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const STATUSES = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'ARCHIVED']

/**
 * PATCH /api/admin/inquiries/[id]
 * Update an inquiry's status and/or internal notes
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data: { status?: any; adminNotes?: string | null } = {}

    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) {
        return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 })
      }
      data.status = body.status
    }
    if (body.adminNotes !== undefined) {
      data.adminNotes = typeof body.adminNotes === 'string' ? body.adminNotes.slice(0, 5000) : null
    }

    const inquiry = await prisma.inquiry.update({ where: { id: params.id }, data })
    return NextResponse.json({ success: true, data: inquiry })
  } catch (error) {
    console.error('Error updating inquiry:', error)
    return NextResponse.json({ success: false, error: 'Failed to update inquiry' }, { status: 500 })
  }
}
