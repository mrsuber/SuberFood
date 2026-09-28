import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export const dynamic = 'force-dynamic'

// POST /api/farm-products/orders - Create a new farm product order
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()
    const {
      items,
      deliveryMethod,
      contactInfo,
      deliveryAddress,
      subtotal,
      deliveryFee,
      totalAmount,
      useWallet,
      walletAmount,
      referralCode,
    } = body

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No items in order' },
        { status: 400 }
      )
    }

    if (!contactInfo?.fullName || !contactInfo?.phone) {
      return NextResponse.json(
        { success: false, message: 'Contact information is required' },
        { status: 400 }
      )
    }

    if (deliveryMethod === 'delivery' && !deliveryAddress?.street) {
      return NextResponse.json(
        { success: false, message: 'Delivery address is required for delivery orders' },
        { status: 400 }
      )
    }

    // Generate order number
    const orderNumber = `FPO-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`

    // Handle wallet payment and referral in a transaction
    let referrerId: string | null = null

    // If wallet payment is used, we need to be authenticated
    if (useWallet && walletAmount > 0) {
      if (!session?.user?.id) {
        return NextResponse.json(
          { success: false, message: 'Authentication required to use wallet payment' },
          { status: 401 }
        )
      }

      // Verify wallet balance
      const wallet = await prisma.wallet.findUnique({
        where: { userId: session.user.id },
      })

      if (!wallet) {
        return NextResponse.json(
          { success: false, message: 'Wallet not found' },
          { status: 404 }
        )
      }

      const walletAmountDecimal = new Decimal(walletAmount)
      if (wallet.balance.lessThan(walletAmountDecimal)) {
        return NextResponse.json(
          { success: false, message: 'Insufficient wallet balance' },
          { status: 400 }
        )
      }

      // Deduct from wallet (will be done in transaction below)
    }

    // Handle referral code
    if (referralCode) {
      const referralCodeData = await prisma.referralCode.findUnique({
        where: { code: referralCode },
      })

      if (referralCodeData) {
        referrerId = referralCodeData.userId

        // Check if user is authenticated and create referral relationship if it doesn't exist
        if (session?.user?.id) {
          const existingReferral = await prisma.referral.findFirst({
            where: {
              refereeId: session.user.id,
            },
          })

          // Create referral relationship if doesn't exist
          if (!existingReferral && referralCodeData.userId !== session.user.id) {
            await prisma.referral.create({
              data: {
                referrerId: referralCodeData.userId,
                referralCodeId: referralCodeData.id,
                refereeId: session.user.id,
                status: 'ACTIVE',
              },
            })
          }
        }
      }
    }

    // Fetch product details to get farm costs
    const productIds = items.map((item: any) => item.productId)
    const products = await prisma.farmProduct.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        farmCostRetail: true,
        farmCostBulk: true,
        retailPrice: true,
        bulkPrice: true,
      },
    })

    const productMap = new Map(products.map(p => [p.id, p]))

    // Calculate farm costs and referral discount
    let totalFarmCost = 0
    const itemsWithCosts = items.map((item: any) => {
      const product = productMap.get(item.productId)
      const isRetail = item.priceType === 'retail'
      const farmCostPerUnit = isRetail
        ? (product?.farmCostRetail ? Number(product.farmCostRetail) : 0)
        : (product?.farmCostBulk ? Number(product.farmCostBulk) : 0)

      const farmCostTotal = farmCostPerUnit * item.quantity
      totalFarmCost += farmCostTotal

      return {
        ...item,
        farmCostPerUnit,
        farmCostTotal,
      }
    })

    // Calculate referral discount (5% of total farm cost)
    const referralDiscountAmount = referralCode ? totalFarmCost * 0.05 : 0

    // Calculate adjusted total
    const adjustedTotal = totalAmount - referralDiscountAmount

    // Create order with items (use transaction if wallet payment)
    const order = await prisma.$transaction(async (tx) => {
      // Handle wallet deduction if needed
      if (useWallet && walletAmount > 0 && session?.user?.id) {
        const wallet = await tx.wallet.findUnique({
          where: { userId: session.user.id },
        })

        if (!wallet) {
          throw new Error('Wallet not found')
        }

        const walletAmountDecimal = new Decimal(walletAmount)
        const balanceBefore = wallet.balance
        const balanceAfter = balanceBefore.minus(walletAmountDecimal)

        // Create wallet transaction
        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'PURCHASE',
            amount: walletAmountDecimal,
            balanceBefore,
            balanceAfter,
            description: `Payment for order ${orderNumber}`,
            referenceType: 'ORDER',
            referenceId: '', // Will be updated with orderId after order creation
          },
        })

        // Update wallet balance
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: balanceAfter,
            totalSpent: wallet.totalSpent.add(walletAmountDecimal),
          },
        })
      }

      // Calculate cost breakdown
      const transportCost = totalFarmCost * 0.2
      const profitWithoutReferral = totalFarmCost * 0.2
      const profitWithReferral = referralCode ? totalFarmCost * 0.1 : profitWithoutReferral
      const referrerCommission = referralCode ? totalFarmCost * 0.05 : 0

      // Create the order
      return await tx.farmOrder.create({
      data: {
        orderNumber,
        isGuest: !session?.user?.id,
        userId: session?.user?.id || null,
        guestName: contactInfo.fullName,
        guestPhone: contactInfo.phone,
        guestEmail: contactInfo.email || null,
        referredById: referrerId,

        fulfillmentType: deliveryMethod === 'delivery' ? 'DELIVERY' : 'PICKUP',

        // Delivery details
        deliveryAddress: deliveryAddress
          ? `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.region}`
          : null,
        deliveryCity: deliveryAddress?.city || null,
        deliveryState: deliveryAddress?.region || null,
        deliveryPhone: contactInfo.phone,
        deliveryInstructions: deliveryAddress?.additionalInfo || null,

        // Pickup details
        pickupLocation: deliveryMethod === 'pickup' ? 'SuberFood Distribution Center, Douala' : null,

        // Amounts
        subtotal: new Decimal(subtotal),
        deliveryFee: new Decimal(deliveryFee),
        referralDiscount: new Decimal(referralDiscountAmount),
        totalAmount: new Decimal(adjustedTotal + deliveryFee),

        // Cost tracking
        costPrice: new Decimal(totalFarmCost),
        transportCost: new Decimal(transportCost),
        totalCost: new Decimal(totalFarmCost + transportCost),
        profitAmount: new Decimal(profitWithReferral),

        // Payment
        paymentMethod: 'MOBILE_MONEY', // Will be determined by PayWithCamsol
        paymentStatus: 'PENDING',

        // Status
        status: 'PENDING',

        // Order items
        items: {
          create: itemsWithCosts.map((item: any) => ({
            productId: item.productId,
            productName: item.name,
            productSku: item.productSlug,
            productImage: null,
            purchaseType: item.priceType === 'retail' ? 'RETAIL' : 'BULK',
            quantity: new Decimal(item.quantity),
            unit: item.unit,
            pricePerUnit: new Decimal(item.price),
            totalPrice: new Decimal(item.price * item.quantity),
            farmCostPerUnit: item.farmCostPerUnit ? new Decimal(item.farmCostPerUnit) : null,
            farmCostTotal: item.farmCostTotal ? new Decimal(item.farmCostTotal) : null,
          })),
        },

        // Status history
        statusHistory: {
          create: {
            status: 'PENDING',
            note: 'Order created',
          },
        },
      },
      include: {
        items: true,
      },
    })
    })

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: order,
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create order',
      },
      { status: 500 }
    )
  }
}

// GET /api/farm-products/orders - Get user's orders (for authenticated users)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orderNumber = searchParams.get('orderNumber')

    if (orderNumber) {
      // Get specific order by order number
      const order = await prisma.farmOrder.findUnique({
        where: { orderNumber },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          statusHistory: {
            orderBy: {
              timestamp: 'desc',
            },
          },
        },
      })

      if (!order) {
        return NextResponse.json(
          { success: false, message: 'Order not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: order,
      })
    }

    // Get all orders (this would typically be filtered by userId for authenticated users)
    const orders = await prisma.farmOrder.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
      include: {
        items: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: orders,
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch orders',
      },
      { status: 500 }
    )
  }
}
