import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { normalizePhoneNumber } from '@/lib/referralFraudDetection';

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, phone } = await request.json();

    // Validation - PHONE IS NOW REQUIRED
    if (!email || !password || !firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields. Email, password, first name, last name, and phone number are all required.' },
        { status: 400 }
      );
    }

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phone);

    // Check if email already exists
    const existingEmailUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmailUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // CRITICAL: Check if phone number already exists
    const existingPhoneUser = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
      select: {
        id: true,
        email: true,
        name: true,
        isAccountComplete: true,
      }
    });

    if (existingPhoneUser) {
      // Phone number already exists in another account
      return NextResponse.json(
        {
          error: 'PHONE_ALREADY_EXISTS',
          message: 'This phone number is already registered to an account.',
          requiresConfirmation: true,
          existingAccount: {
            email: existingPhoneUser.email,
            name: existingPhoneUser.name,
            isComplete: existingPhoneUser.isAccountComplete,
          }
        },
        { status: 409 }
      );
    }

    // Check phone numbers table
    const existingPhoneNumber = await prisma.userPhoneNumber.findUnique({
      where: { phoneNumber: normalizedPhone },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      }
    });

    if (existingPhoneNumber) {
      return NextResponse.json(
        {
          error: 'PHONE_ALREADY_EXISTS',
          message: 'This phone number is already registered to an account.',
          requiresConfirmation: true,
          existingAccount: {
            email: existingPhoneNumber.user.email,
            name: existingPhoneNumber.user.name,
          }
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user with phone number
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        phone: normalizedPhone,
        phoneVerified: false, // Not verified yet
        isAccountComplete: true, // Traditional registration is complete
        phoneNumbers: {
          create: {
            phoneNumber: normalizedPhone,
            isPrimary: true,
            isVerified: false,
            label: 'Primary',
          }
        }
      },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
