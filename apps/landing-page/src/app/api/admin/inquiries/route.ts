import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/inquiries
 * List inquiries with optional ?type=, ?status= and ?search= filters
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: any = {}
    if (type && type !== 'all') where.type = type
    if (status && status !== 'all') where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { company: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [inquiries, byStatus, byType] = await Promise.all([
      prisma.inquiry.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 }),
      prisma.inquiry.groupBy({ by: ['status'], _count: true }),
      prisma.inquiry.groupBy({ by: ['type'], _count: true }),
    ])

    return NextResponse.json({
      success: true,
      data: inquiries,
      stats: {
        byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
        byType: Object.fromEntries(byType.map((t) => [t.type, t._count])),
      },
    })
  } catch (error) {
    console.error('Error fetching inquiries:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch inquiries' }, { status: 500 })
  }
}
