import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const TYPES = ['SARDINE', 'MILK', 'MEAT', 'VEGETABLE', 'FRUIT', 'GRAIN']
const STATUSES = ['OPERATIONAL', 'MAINTENANCE', 'CLOSED']

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  return session?.user && (role === 'ADMIN' || role === 'SUPER_ADMIN') ? session : null
}

/** GET /api/admin/processing-facilities — list processing facilities (?type=, ?status=) */
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

    const items = await prisma.processingFacility.findMany({ where, orderBy: [{ type: 'asc' }, { name: 'asc' }] })
    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('Error fetching processing facilities:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch processing facilities' }, { status: 500 })
  }
}

/** POST /api/admin/processing-facilities — body: { name, type, location, capacity, status? } */
export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()
    const size = parseFloat(body.capacity)
    if (!body.name || !TYPES.includes(body.type) || !body.location || !(size >= 0)) {
      return NextResponse.json({ success: false, error: 'Name, type, location and capacity are required' }, { status: 400 })
    }
    const item = await prisma.processingFacility.create({
      data: {
        name: String(body.name).trim(),
        type: body.type,
        location: String(body.location).trim(),
        capacity: size,
        status: STATUSES.includes(body.status) ? body.status : STATUSES[0],
      },
    })
    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (error) {
    console.error('Error creating processing facilities:', error)
    return NextResponse.json({ success: false, error: 'Failed to create' }, { status: 500 })
  }
}
