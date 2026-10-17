import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Decimal } from '@prisma/client/runtime/library'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  return session?.user && (role === 'ADMIN' || role === 'SUPER_ADMIN') ? session : null
}

/**
 * GET /api/admin/farm-supplies
 * Supplies received from farmers (harvest intake / supply chain records).
 * Filters: ?farmerId= ?productId= ?status= ?paymentStatus= ?search= (batch, farmer or product)
 */
export async function GET(req: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(req.url)
    const where: any = {}
    for (const key of ['farmerId', 'productId', 'status', 'paymentStatus']) {
      const value = searchParams.get(key)
      if (value && value !== 'all') where[key] = value
    }
    const search = searchParams.get('search')?.trim()
    if (search) {
      where.OR = [
        { batchNumber: { contains: search, mode: 'insensitive' } },
        { farmer: { name: { contains: search, mode: 'insensitive' } } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const supplies = await prisma.farmSupply.findMany({
      where,
      orderBy: { deliveryDate: 'desc' },
      take: 300,
      include: {
        farmer: { select: { id: true, name: true, businessName: true, region: true, village: true, isVerified: true } },
        product: { select: { id: true, name: true, sku: true, stockUnit: true, category: true } },
      },
    })

    const totals = supplies.reduce(
      (acc, s) => {
        acc.totalCost += Number(s.totalCost)
        acc.unpaid += Math.max(0, Number(s.totalCost) - Number(s.paidAmount))
        if (s.qualityRating) {
          acc.ratingSum += s.qualityRating
          acc.ratingCount += 1
        }
        return acc
      },
      { totalCost: 0, unpaid: 0, ratingSum: 0, ratingCount: 0 }
    )

    return NextResponse.json({
      success: true,
      data: supplies,
      stats: {
        count: supplies.length,
        totalCost: totals.totalCost,
        unpaid: totals.unpaid,
        averageQuality: totals.ratingCount ? totals.ratingSum / totals.ratingCount : null,
        farmers: new Set(supplies.map((s) => s.farmerId)).size,
      },
    })
  } catch (error) {
    console.error('Error fetching farm supplies:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch supplies' }, { status: 500 })
  }
}

/**
 * POST /api/admin/farm-supplies
 * Record a delivery from a farmer. Body: { farmerId, productId, quantity, unit, pricePerUnit,
 *   deliveryDate?, harvestDate?, expiryDate?, batchNumber?, qualityRating?, qualityNotes?,
 *   paymentStatus?, paidAmount?, paymentMethod?, notes? }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const quantity = parseFloat(body.quantity)
    const pricePerUnit = parseFloat(body.pricePerUnit || '0')
    if (!body.farmerId || !body.productId || !(quantity > 0) || !body.unit) {
      return NextResponse.json({ success: false, error: 'Farmer, product, quantity and unit are required' }, { status: 400 })
    }

    const [farmer, product] = await Promise.all([
      prisma.farmer.findUnique({ where: { id: body.farmerId }, select: { id: true } }),
      prisma.farmProduct.findUnique({ where: { id: body.productId }, select: { id: true, sku: true } }),
    ])
    if (!farmer || !product) {
      return NextResponse.json({ success: false, error: 'Farmer or product not found' }, { status: 404 })
    }

    const deliveryDate = body.deliveryDate ? new Date(body.deliveryDate) : new Date()
    const totalCost = new Decimal(quantity).mul(new Decimal(pricePerUnit))
    const paidAmount =
      body.paymentStatus === 'PAID' ? totalCost : new Decimal(parseFloat(body.paidAmount || '0') || 0)
    // Default batch number: SKU + delivery date + short random suffix, e.g. FP-VEG-TOM-001-20261017-K3F
    const batchNumber =
      (typeof body.batchNumber === 'string' && body.batchNumber.trim()) ||
      `${product.sku}-${deliveryDate.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`

    const qualityRating = body.qualityRating ? Math.min(5, Math.max(1, parseInt(body.qualityRating, 10))) : null

    const supply = await prisma.$transaction(async (tx) => {
      const created = await tx.farmSupply.create({
        data: {
          farmerId: body.farmerId,
          productId: body.productId,
          quantity: new Decimal(quantity),
          unit: String(body.unit),
          pricePerUnit: new Decimal(pricePerUnit),
          totalCost,
          qualityRating,
          qualityNotes: body.qualityNotes || null,
          deliveryDate,
          receivedDate: new Date(),
          receivedBy: session.user.name || session.user.email || session.user.id,
          batchNumber,
          harvestDate: body.harvestDate ? new Date(body.harvestDate) : null,
          expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
          paymentStatus: ['PENDING', 'PAID', 'PARTIAL'].includes(body.paymentStatus) ? body.paymentStatus : 'PENDING',
          paidAmount,
          paidAt: body.paymentStatus === 'PAID' ? new Date() : null,
          paymentMethod: body.paymentMethod || null,
          status: qualityRating && qualityRating <= 2 ? 'QUALITY_CHECK' : 'APPROVED',
          notes: body.notes || null,
          createdBy: session.user.id,
        },
      })

      await tx.farmer.update({
        where: { id: body.farmerId },
        data: {
          totalSupplied: { increment: new Decimal(quantity) },
          totalRevenue: { increment: paidAmount },
        },
      })

      return created
    })

    return NextResponse.json({ success: true, data: supply }, { status: 201 })
  } catch (error) {
    console.error('Error recording farm supply:', error)
    return NextResponse.json({ success: false, error: 'Failed to record supply' }, { status: 500 })
  }
}
