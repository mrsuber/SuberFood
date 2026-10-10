import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/farmers/[id]
 * Get farmer details with supplies and products
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const farmer = await prisma.farmer.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            category: true,
            stockQuantity: true,
            retailPrice: true,
            status: true,
          },
        },
        supplies: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
              },
            },
          },
          orderBy: {
            deliveryDate: 'desc',
          },
          take: 50,
        },
      },
    })

    if (!farmer) {
      return NextResponse.json(
        { success: false, message: 'Farmer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      farmer,
    })
  } catch (error) {
    console.error('[ADMIN FARMERS] Error fetching farmer:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch farmer',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/farmers/[id]
 * Update farmer information
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      status,
      notes,
      specialties,
    } = body

    // Create GPS coordinates string if lat/lng provided
    const gpsCoordinates = latitude && longitude
      ? `${latitude}, ${longitude}`
      : undefined

    const farmer = await prisma.farmer.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(businessName !== undefined && { businessName }),
        ...(farmerType && { farmerType }),
        ...(registrationNumber !== undefined && { registrationNumber }),
        ...(taxId !== undefined && { taxId }),
        ...(email !== undefined && { email }),
        ...(phone && { phone }),
        ...(alternatePhone !== undefined && { alternatePhone }),
        ...(address && { address }),
        ...(region && { region }),
        ...(district !== undefined && { district }),
        ...(village !== undefined && { village }),
        ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude) : null }),
        ...(gpsCoordinates && { gpsCoordinates }),
        ...(farmSize !== undefined && { farmSize: farmSize ? parseFloat(farmSize) : null }),
        ...(mainCrops && { mainCrops }),
        ...(isOrganic !== undefined && { isOrganic }),
        ...(isCertified !== undefined && { isCertified }),
        ...(certifications && { certifications }),
        ...(bankName !== undefined && { bankName }),
        ...(bankAccountNumber !== undefined && { bankAccountNumber }),
        ...(mobileMoneyNumber !== undefined && { mobileMoneyNumber }),
        ...(mobileMoneyProvider !== undefined && { mobileMoneyProvider }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(specialties !== undefined && { specialties }),
      },
    })

    return NextResponse.json({
      success: true,
      farmer,
      message: 'Farmer updated successfully',
    })
  } catch (error) {
    console.error('[ADMIN FARMERS] Error updating farmer:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update farmer',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/farmers/[id]
 * Delete a farmer
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if farmer has any products
    const farmer = await prisma.farmer.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            supplies: true,
          },
        },
      },
    })

    if (!farmer) {
      return NextResponse.json(
        { success: false, message: 'Farmer not found' },
        { status: 404 }
      )
    }

    if (farmer._count.products > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete farmer with ${farmer._count.products} linked products. Remove products first.`,
        },
        { status: 400 }
      )
    }

    await prisma.farmer.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Farmer deleted successfully',
    })
  } catch (error) {
    console.error('[ADMIN FARMERS] Error deleting farmer:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete farmer',
      },
      { status: 500 }
    )
  }
}
