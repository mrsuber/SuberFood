import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const INQUIRY_TYPES = [
  'GENERAL',
  'SUPPORT',
  'WHOLESALE',
  'PARTNERSHIP',
  'FARMER_SUPPLY',
  'RESTAURANT',
  'EVENTS',
  'CAREERS',
  'PRESS',
] as const

type InquiryTypeValue = (typeof INQUIRY_TYPES)[number]

const clean = (value: unknown, max = 200) =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null

/**
 * POST /api/inquiries
 * Public endpoint behind every contact / partnership / careers form.
 * Inquiries land in the admin inbox at /admin/inquiries.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Honeypot: real users never fill the hidden "website" field
    if (body.website) {
      return NextResponse.json({ success: true })
    }

    const name = clean(body.name, 120)
    const email = clean(body.email, 160)
    const phone = clean(body.phone, 40)
    const message = clean(body.message, 5000)
    const type: InquiryTypeValue = INQUIRY_TYPES.includes(body.type) ? body.type : 'GENERAL'

    if (!name || !message) {
      return NextResponse.json(
        { success: false, message: 'Please provide your name and a message.' },
        { status: 400 }
      )
    }
    if (!email && !phone) {
      return NextResponse.json(
        { success: false, message: 'Please provide an email address or phone number so we can reply.' },
        { status: 400 }
      )
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: 'Please enter a valid email address.' }, { status: 400 })
    }

    // Basic flood protection: same contact, same type, within 2 minutes
    const recent = await prisma.inquiry.findFirst({
      where: {
        type,
        OR: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
        createdAt: { gte: new Date(Date.now() - 2 * 60 * 1000) },
      },
      select: { id: true },
    })
    if (recent) {
      return NextResponse.json({ success: true, id: recent.id })
    }

    const session = await getServerSession(authOptions)
    const details = body.details && typeof body.details === 'object' ? body.details : undefined

    const inquiry = await prisma.inquiry.create({
      data: {
        type,
        name,
        email,
        phone,
        company: clean(body.company, 160),
        city: clean(body.city, 80),
        subject: clean(body.subject, 200),
        message,
        details,
        sourcePage: clean(body.sourcePage, 200),
        userId: session?.user?.id ?? null,
      },
      select: { id: true },
    })

    return NextResponse.json({ success: true, id: inquiry.id }, { status: 201 })
  } catch (error) {
    console.error('Error creating inquiry:', error)
    return NextResponse.json(
      { success: false, message: 'We could not send your message. Please try again shortly.' },
      { status: 500 }
    )
  }
}
