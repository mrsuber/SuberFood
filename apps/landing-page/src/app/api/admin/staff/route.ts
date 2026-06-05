import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/staff
 * List all staff members with optional filters
 *
 * Query params:
 * - restaurantId: Filter by restaurant location
 * - role: Filter by staff role (CHEF, WAITER, DELIVERY_DRIVER, etc.)
 * - status: Filter by status (ACTIVE, ON_LEAVE, INACTIVE, TERMINATED)
 * - search: Search by name or employee ID
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin privileges
    const userRole = session.user.role;
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'RESTAURANT_MANAGER'];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const role = searchParams.get('role');
    const status = searchParams.get('status') || 'ACTIVE';
    const search = searchParams.get('search');

    // Build filter
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (restaurantId) {
      where.restaurantId = restaurantId;
    }

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        {
          employeeId: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    const staff = await prisma.staff.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            branchCode: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { role: 'asc' },
        { hireDate: 'desc' },
      ],
    });

    // Calculate statistics
    const stats = {
      total: staff.length,
      byRole: staff.reduce((acc, s) => {
        acc[s.role] = (acc[s.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byStatus: staff.reduce((acc, s) => {
        acc[s.status] = (acc[s.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      staff,
      stats,
      total: staff.length,
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/staff
 * Create a new staff member
 *
 * Body:
 * - userId: User ID to link to staff account
 * - restaurantId: Restaurant location ID
 * - role: Staff role (CHEF, WAITER, etc.)
 * - employeeId: Unique employee identifier
 * - hireDate: Date of hire (ISO string)
 * - hourlyRate?: Hourly rate (optional)
 * - salary?: Salary (optional)
 * - workSchedule?: Work schedule JSON (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin privileges
    const userRole = session.user.role;
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'RESTAURANT_MANAGER'];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      userId,
      restaurantId,
      role,
      employeeId,
      hireDate,
      hourlyRate,
      salary,
      workSchedule,
    } = body;

    // Validate required fields
    if (!userId || !restaurantId || !role || !employeeId || !hireDate) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, restaurantId, role, employeeId, hireDate' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is already a staff member
    const existingStaff = await prisma.staff.findUnique({
      where: { userId },
    });

    if (existingStaff) {
      return NextResponse.json(
        { error: 'This user is already registered as a staff member' },
        { status: 400 }
      );
    }

    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true, name: true },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Check if employee ID is unique
    const existingEmployeeId = await prisma.staff.findUnique({
      where: { employeeId },
    });

    if (existingEmployeeId) {
      return NextResponse.json(
        { error: 'Employee ID already exists' },
        { status: 400 }
      );
    }

    // Create staff member
    const staff = await prisma.staff.create({
      data: {
        userId,
        restaurantId,
        role,
        employeeId,
        hireDate: new Date(hireDate),
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        salary: salary ? parseFloat(salary) : null,
        workSchedule: workSchedule || null,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Staff member created successfully',
      staff,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json(
      { error: 'Failed to create staff member' },
      { status: 500 }
    );
  }
}
