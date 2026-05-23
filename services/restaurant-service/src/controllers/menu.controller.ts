import { Request, Response } from 'express';
import prisma from '../utils/prisma';

/**
 * Get full menu with optional filters
 * GET /api/v1/menu
 * Query params: categoryId, dietary (vegetarian, vegan, glutenFree, keto, halal, kosher),
 *               allergens (exclude), spiceLevel (max), search, sortBy, isAvailable
 */
export const getMenu = async (req: Request, res: Response) => {
  try {
    const {
      categoryId,
      vegetarian,
      vegan,
      glutenFree,
      keto,
      halal,
      kosher,
      excludeAllergens,
      maxSpiceLevel,
      search,
      sortBy = 'name',
      isAvailable = 'true',
    } = req.query;

    // Build where clause
    const where: any = {};

    if (isAvailable === 'true') {
      where.isAvailable = true;
    }

    if (categoryId) {
      where.categoryId = categoryId as string;
    }

    // Dietary filters
    if (vegetarian === 'true') where.isVegetarian = true;
    if (vegan === 'true') where.isVegan = true;
    if (glutenFree === 'true') where.isGlutenFree = true;
    if (keto === 'true') where.isKeto = true;
    if (halal === 'true') where.isHalal = true;
    if (kosher === 'true') where.isKosher = true;

    // Allergen exclusion
    if (excludeAllergens && typeof excludeAllergens === 'string') {
      const allergenList = excludeAllergens.split(',');
      where.NOT = {
        allergens: {
          hasSome: allergenList,
        },
      };
    }

    // Spice level filter
    if (maxSpiceLevel) {
      where.spiceLevel = {
        lte: parseInt(maxSpiceLevel as string, 10),
      };
    }

    // Search
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { ingredients: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Sorting
    const orderBy: any = {};
    switch (sortBy) {
      case 'price_asc':
        orderBy.price = 'asc';
        break;
      case 'price_desc':
        orderBy.price = 'desc';
        break;
      case 'rating':
        orderBy.averageRating = 'desc';
        break;
      case 'popular':
        orderBy.isPopular = 'desc';
        break;
      default:
        orderBy.name = 'asc';
    }

    const menuItems = await prisma.menuItem.findMany({
      where,
      orderBy,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    res.json({
      success: true,
      count: menuItems.length,
      data: menuItems,
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu',
    });
  }
};

/**
 * Get menu item by ID
 * GET /api/v1/menu/:id
 */
export const getMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    res.json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu item',
    });
  }
};

/**
 * Get menu categories
 * GET /api/v1/menu/categories
 */
export const getMenuCategories = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.query;

    const where: any = {
      isActive: true,
    };

    if (restaurantId) {
      where.restaurantId = restaurantId as string;
    }

    const categories = await prisma.menuCategory.findMany({
      where,
      orderBy: {
        displayOrder: 'asc',
      },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
    });
  }
};

/**
 * Get featured/popular menu items
 * GET /api/v1/menu/featured
 */
export const getFeaturedMenuItems = async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query;

    const menuItems = await prisma.menuItem.findMany({
      where: {
        isAvailable: true,
        OR: [
          { isChefRecommended: true },
          { isPopular: true },
          { isSeasonal: true },
        ],
      },
      orderBy: [
        { isChefRecommended: 'desc' },
        { averageRating: 'desc' },
      ],
      take: parseInt(limit as string, 10),
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      success: true,
      count: menuItems.length,
      data: menuItems,
    });
  } catch (error) {
    console.error('Error fetching featured items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured items',
    });
  }
};

/**
 * Add menu item to favorites (requires userId)
 * POST /api/v1/menu/:id/favorite
 */
export const addToFavorites = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Get user's current favorites
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { favoriteMenuItems: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if already in favorites
    const favorites = user.favoriteMenuItems || [];
    if (favorites.includes(id)) {
      return res.status(400).json({
        success: false,
        message: 'Item already in favorites',
      });
    }

    // Add to favorites
    await prisma.user.update({
      where: { id: userId },
      data: {
        favoriteMenuItems: [...favorites, id],
      },
    });

    res.json({
      success: true,
      message: 'Added to favorites',
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to favorites',
    });
  }
};

/**
 * Remove menu item from favorites
 * DELETE /api/v1/menu/:id/favorite
 */
export const removeFromFavorites = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Get user's current favorites
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { favoriteMenuItems: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Remove from favorites
    const favorites = (user.favoriteMenuItems || []).filter((itemId: string) => itemId !== id);

    await prisma.user.update({
      where: { id: userId },
      data: {
        favoriteMenuItems: favorites,
      },
    });

    res.json({
      success: true,
      message: 'Removed from favorites',
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from favorites',
    });
  }
};
