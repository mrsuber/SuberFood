import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/farmers
 * Get all farmers with filtering and search
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''
    const region = searchParams.get('region') || 'all'

    // Build where clause
    const where: any = {}

    if (status !== 'all') {
      where.status = status.toUpperCase()
    }

    if (region !== 'all') {
      where.region = region
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { village: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Get all farmers
    const farmers = await prisma.farmer.findMany({
      where,
      include: {
        _count: {
          select: {
            products: true,
            supplies: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate statistics
    const stats = {
      total: farmers.length,
      active: farmers.filter(f => f.status === 'ACTIVE').length,
      pending: farmers.filter(f => f.status === 'PENDING_VERIFICATION').length,
      verified: farmers.filter(f => f.isVerified).length,
      totalRevenue: farmers.reduce((sum, f) => sum + Number(f.totalRevenue), 0),
      totalSupplied: farmers.reduce((sum, f) => sum + Number(f.totalSupplied), 0),
    }

    // Get unique regions
    const regions = await prisma.farmer.findMany({
      select: { region: true },
      distinct: ['region'],
      orderBy: { region: 'asc' },
    })

    return NextResponse.json({
      success: true,
      stats,
      farmers,
      regions: regions.map(r => r.region),
    })
  } catch (error) {
    console.error('[ADMIN FARMERS] Error fetching farmers:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch farmers',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/farmers
 * Create a new farmer
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      name,
      businessName,
      farmerType,
      registrationNumber,
      taxId,
      email,
      phone,
      alternatePhone,
      address,
      region,
      district,
      village,
      latitude,
      longitude,
      farmSize,
      mainCrops,
      isOrganic,
      isCertified,
      certifications,
      bankName,
      bankAccountNumber,
      mobileMoneyNumber,
      mobileMoneyProvider,
      notes,
      specialties,
    } = body

    // Validate required fields
    if (!name || !phone || !address || !region) {
      return NextResponse.json(
        { success: false, message: 'Name, phone, address, and region are required' },
        { status: 400 }
      )
    }

    // Create GPS coordinates string if lat/lng provided
    const gpsCoordinates = latitude && longitude
      ? `${latitude}, ${longitude}`
      : null

    // Create farmer
    const farmer = await prisma.farmer.create({
      data: {
        name,
        businessName,
        farmerType: farmerType || 'INDIVIDUAL',
        registrationNumber,
        taxId,
        email,
        phone,
        alternatePhone,
        address,
        region,
        district,
        village,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        gpsCoordinates,
        farmSize: farmSize ? parseFloat(farmSize) : null,
        mainCrops: mainCrops || [],
        isOrganic: isOrganic || false,
        isCertified: isCertified || false,
        certifications: certifications || [],
        certificationDocs: [],
        bankName,
        bankAccountNumber,
        mobileMoneyNumber,
        mobileMoneyProvider,
        notes,
        specialties,
        status: 'PENDING_VERIFICATION',
      },
    })

    return NextResponse.json({
      success: true,
      farmer,
      message: 'Farmer created successfully',
    })
  } catch (error) {
    console.error('[ADMIN FARMERS] Error creating farmer:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create farmer',
      },
      { status: 500 }
    )
  }
}
