import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { hash } from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'DISTRIBUTION_MANAGER',
  'RESTAURANT_MANAGER',
  'RESTAURANT_STAFF',
  'RETAIL_MANAGER',
  'PARTNER_MANAGER',
  'PROCESSING_MANAGER',
  'QUALITY_CONTROL',
  'FARM_MANAGER',
  'FARM_WORKER',
  'CUSTOMER',
  'B2B_PARTNER',
]

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  if (!session?.user || (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) return null
  return session
}

/**
 * GET /api/admin/users?search=&role=
 * Look up users (e.g. to link a staff record to an account). Max 20 results.
 */
export async function GET(req: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')?.trim()
    const role = searchParams.get('role')

    const where: any = {}
    if (role && ROLES.includes(role)) where.role = role
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, phone: true, role: true, status: true, createdAt: true },
    })
    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json({ success: false, error: 'Failed to search users' }, { status: 500 })
  }
}

/**
 * POST /api/admin/users
 * Create a team account. Only SUPER_ADMIN may create ADMIN / SUPER_ADMIN users.
 * Body: { name, email, phone?, password, role }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { name, email, phone, password, role } = await req.json()
    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, error: 'Name, email, password and role are required' }, { status: 400 })
    }
    if (!ROLES.includes(role)) {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 })
    }
    if ((role === 'ADMIN' || role === 'SUPER_ADMIN') && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Only a super admin can create admin accounts' }, { status: 403 })
    }
    if (String(password).length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const normalizedEmail = String(email).toLowerCase().trim()
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: normalizedEmail }, ...(phone ? [{ phone: String(phone).trim() }] : [])] },
      select: { id: true },
    })
    if (existing) {
      return NextResponse.json({ success: false, error: 'A user with this email or phone already exists' }, { status: 409 })
    }

    const trimmedName = String(name).trim()
    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        firstName: trimmedName.split(' ')[0],
        lastName: trimmedName.split(' ').slice(1).join(' ') || null,
        email: normalizedEmail,
        phone: phone ? String(phone).trim() : null,
        password: await hash(String(password), 12),
        role,
        status: 'ACTIVE',
        isAccountComplete: true,
      },
      select: { id: true, name: true, email: true, role: true },
    })

    return NextResponse.json({ success: true, data: user }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 })
  }
}
