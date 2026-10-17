import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const TYPES = ['AQUACULTURE', 'POULTRY', 'LIVESTOCK', 'CROPS']
const STATUSES = ['ACTIVE', 'INACTIVE']

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  return session?.user && (role === 'ADMIN' || role === 'SUPER_ADMIN') ? session : null
}

/** GET /api/admin/farms — list farms (?type=, ?status=) */
export async function GET(req: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const where: any = {}
    if (type && TYPES.includes(type)) where.type = type
    if (status && STATUSES.includes(status)) where.status = status

    const items = await prisma.farm.findMany({ where, orderBy: [{ type: 'asc' }, { name: 'asc' }] })
    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('Error fetching farms:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch farms' }, { status: 500 })
  }
}

/** POST /api/admin/farms — body: { name, type, location, size, status? } */
export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()
    const size = parseFloat(body.size)
    if (!body.name || !TYPES.includes(body.type) || !body.location || !(size >= 0)) {
      return NextResponse.json({ success: false, error: 'Name, type, location and size are required' }, { status: 400 })
    }
    const item = await prisma.farm.create({
      data: {
        name: String(body.name).trim(),
        type: body.type,
        location: String(body.location).trim(),
        size: size,
        status: STATUSES.includes(body.status) ? body.status : STATUSES[0],
      },
    })
    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (error) {
    console.error('Error creating farms:', error)
    return NextResponse.json({ success: false, error: 'Failed to create' }, { status: 500 })
  }
}
