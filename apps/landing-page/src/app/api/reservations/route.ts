import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

/**
 * POST /api/reservations
 * Book a table. Requires a signed-in customer.
 * Body: { restaurantId, date: 'YYYY-MM-DD', time: 'HH:MM', partySize, specialRequests?, contactName?, contactPhone? }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Please sign in to make a reservation.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { restaurantId, date, time, specialRequests, contactName, contactPhone } = body
    const partySize = parseInt(body.partySize, 10)

    if (!restaurantId || !date || !time || !partySize) {
      return NextResponse.json({ success: false, message: 'Please choose a date, time and party size.' }, { status: 400 })
    }
    if (!TIME_RE.test(time)) {
      return NextResponse.json({ success: false, message: 'Invalid time.' }, { status: 400 })
    }
    if (partySize < 1 || partySize > 30) {
      return NextResponse.json(
        { success: false, message: 'For groups larger than 30, please contact the restaurant directly.' },
        { status: 400 }
      )
    }

    // Restaurants operate on West Africa Time (UTC+1, no daylight saving)
    const reservationDate = new Date(`${date}T${time}:00+01:00`)
    if (isNaN(reservationDate.getTime())) {
      return NextResponse.json({ success: false, message: 'Invalid date.' }, { status: 400 })
    }
    if (reservationDate.getTime() < Date.now() - 5 * 60 * 1000) {
      return NextResponse.json({ success: false, message: 'Please choose a time in the future.' }, { status: 400 })
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true, name: true, status: true, openingTime: true, closingTime: true, capacity: true },
    })
    if (!restaurant || restaurant.status !== 'OPEN') {
      return NextResponse.json(
        { success: false, message: 'This restaurant is not taking reservations right now.' },
        { status: 400 }
      )
    }
    if (restaurant.openingTime && restaurant.closingTime) {
      if (time < restaurant.openingTime || time >= restaurant.closingTime) {
        return NextResponse.json(
          {
            success: false,
            message: `${restaurant.name} takes reservations between ${restaurant.openingTime} and ${restaurant.closingTime}.`,
          },
          { status: 400 }
        )
      }
    }

    // Avoid accidental double bookings by the same customer
    const duplicate = await prisma.reservation.findFirst({
      where: {
        userId: session.user.id,
        restaurantId,
        reservationDate,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      select: { id: true },
    })
    if (duplicate) {
      return NextResponse.json(
        { success: false, message: 'You already have a reservation at this time.' },
        { status: 409 }
      )
    }

    const contactNote = [contactName && `Name: ${String(contactName).slice(0, 120)}`, contactPhone && `Phone: ${String(contactPhone).slice(0, 40)}`]
      .filter(Boolean)
      .join(' · ')

    const reservation = await prisma.reservation.create({
      data: {
        restaurantId,
        userId: session.user.id,
        reservationDate,
        reservationTime: time,
        partySize,
        specialRequests: typeof specialRequests === 'string' ? specialRequests.slice(0, 1000) || null : null,
        notes: contactNote || null,
      },
      include: { restaurant: { select: { name: true, address: true, city: true, phone: true } } },
    })

    return NextResponse.json({ success: true, data: reservation }, { status: 201 })
  } catch (error) {
    console.error('Error creating reservation:', error)
    return NextResponse.json({ success: false, message: 'Could not create your reservation. Please try again.' }, { status: 500 })
  }
}

/**
 * GET /api/reservations
 * The signed-in customer's reservations, newest first.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const reservations = await prisma.reservation.findMany({
      where: { userId: session.user.id },
      orderBy: { reservationDate: 'desc' },
      take: 50,
      include: { restaurant: { select: { name: true, slug: true, address: true, city: true, phone: true } } },
    })

    return NextResponse.json({ success: true, data: reservations })
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch reservations' }, { status: 500 })
  }
}
