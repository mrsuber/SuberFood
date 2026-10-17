import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  return session?.user && (role === 'ADMIN' || role === 'SUPER_ADMIN') ? session : null
}

/** GET /api/admin/menu/categories/[id] — category with its items */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const category = await prisma.menuCategory.findUnique({
    where: { id: params.id },
    include: {
      restaurant: { select: { id: true, name: true, city: true } },
      items: { select: { id: true, name: true, price: true, isAvailable: true }, orderBy: { name: 'asc' } },
    },
  })
  if (!category) {
    return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true, category })
}

/** PATCH /api/admin/menu/categories/[id] — body: { name?, description?, displayOrder?, isActive? } */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()
    const data: any = {}
    if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim()
    if (body.description !== undefined) data.description = body.description || null
    if (body.displayOrder !== undefined) data.displayOrder = parseInt(body.displayOrder, 10) || 0
    if (body.isActive !== undefined) data.isActive = !!body.isActive
    const category = await prisma.menuCategory.update({ where: { id: params.id }, data })
    return NextResponse.json({ success: true, category })
  } catch (error) {
    console.error('Error updating menu category:', error)
    return NextResponse.json({ success: false, error: 'Failed to update category' }, { status: 500 })
  }
}

/** DELETE /api/admin/menu/categories/[id] — only when the category has no menu items */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const count = await prisma.menuItem.count({ where: { categoryId: params.id } })
    if (count > 0) {
      return NextResponse.json(
        { success: false, error: `Move or delete the ${count} menu item(s) in this category first` },
        { status: 400 }
      )
    }
    await prisma.menuCategory.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting menu category:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 })
  }
}
