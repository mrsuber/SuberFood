import { Request, Response } from 'express';
import prisma from '../utils/prisma';

/**
 * Get all restaurant locations
 * GET /api/v1/locations
 * Query params: type, status, city, state
 */
export const getLocations = async (req: Request, res: Response) => {
  try {
    const { type, status, city, state } = req.query;

    const where: any = {};

    if (type) {
      where.type = type as string;
    }

    if (status) {
      where.status = status as string;
    }

    if (city) {
      where.city = { contains: city as string, mode: 'insensitive' };
    }

    if (state) {
      where.state = state as string;
    }

    const locations = await prisma.restaurant.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            tables: true,
            menuCategories: true,
          },
        },
      },
    });

    res.json({
      success: true,
      count: locations.length,
      data: locations,
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch locations',
    });
  }
};

/**
 * Get location by ID or slug
 * GET /api/v1/locations/:identifier
 */
export const getLocation = async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;

    // Try to find by ID first, then by slug
    let location = await prisma.restaurant.findUnique({
      where: { id: identifier },
      include: {
        menuCategories: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
          include: {
            items: {
              where: { isAvailable: true },
              orderBy: { name: 'asc' },
            },
          },
        },
        tables: true,
      },
    });

    if (!location) {
      location = await prisma.restaurant.findUnique({
        where: { slug: identifier },
        include: {
          menuCategories: {
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
            include: {
              items: {
                where: { isAvailable: true },
                orderBy: { name: 'asc' },
              },
            },
          },
          tables: true,
        },
      });
    }

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found',
      });
    }

    res.json({
      success: true,
      data: location,
    });
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location',
    });
  }
};

/**
 * Get location wait time
 * GET /api/v1/locations/:id/wait-time
 */
export const getWaitTime = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const location = await prisma.restaurant.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        currentWaitTime: true,
        status: true,
      },
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found',
      });
    }

    res.json({
      success: true,
      data: {
        locationId: location.id,
        locationName: location.name,
        waitTime: location.currentWaitTime || 0,
        status: location.status,
      },
    });
  } catch (error) {
    console.error('Error fetching wait time:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wait time',
    });
  }
};

/**
 * Update location wait time (Admin)
 * PUT /api/v1/locations/:id/wait-time
 */
export const updateWaitTime = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { waitTime } = req.body;

    if (typeof waitTime !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Wait time must be a number',
      });
    }

    const location = await prisma.restaurant.update({
      where: { id },
      data: {
        currentWaitTime: waitTime,
      },
    });

    res.json({
      success: true,
      message: 'Wait time updated',
      data: {
        locationId: location.id,
        waitTime: location.currentWaitTime,
      },
    });
  } catch (error) {
    console.error('Error updating wait time:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update wait time',
    });
  }
};

/**
 * Get location's full menu
 * GET /api/v1/locations/:id/menu
 */
export const getLocationMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const location = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        menuCategories: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
          include: {
            items: {
              where: { isAvailable: true },
              orderBy: { name: 'asc' },
            },
          },
        },
      },
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found',
      });
    }

    res.json({
      success: true,
      data: {
        locationId: location.id,
        locationName: location.name,
        categories: location.menuCategories,
      },
    });
  } catch (error) {
    console.error('Error fetching location menu:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location menu',
    });
  }
};
