import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/locations/[id]/menu
 * Public endpoint to get menu items available at a specific location
 * Automatically filters out items that cannot be made due to insufficient inventory
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: restaurantId } = params;
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const dietaryFilter = searchParams.get('dietary'); // vegetarian, vegan, glutenFree, etc.

    // Verify restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true, name: true, status: true },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant location not found' },
        { status: 404 }
      );
    }

    if (restaurant.status !== 'OPEN') {
      return NextResponse.json(
        {
          message: `This location is currently ${restaurant.status.toLowerCase().replace('_', ' ')}`,
          menuItems: [],
        },
        { status: 200 }
      );
    }

    // Build menu filter
    const menuWhere: any = {
      isAvailable: true,
    };

    if (category) {
      menuWhere.category = {
        name: {
          contains: category,
          mode: 'insensitive',
        },
      };
    }

    // Apply dietary filters
    if (dietaryFilter) {
      switch (dietaryFilter.toLowerCase()) {
        case 'vegetarian':
          menuWhere.isVegetarian = true;
          break;
        case 'vegan':
          menuWhere.isVegan = true;
          break;
        case 'glutenfree':
          menuWhere.isGlutenFree = true;
          break;
        case 'keto':
          menuWhere.isKeto = true;
          break;
        case 'halal':
          menuWhere.isHalal = true;
          break;
        case 'kosher':
          menuWhere.isKosher = true;
          break;
      }
    }

    // Get all menu items with their recipes and inventory
    const menuItems = await prisma.menuItem.findMany({
      where: menuWhere,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            restaurantId: true,
          },
        },
        recipe: {
          include: {
            ingredients: {
              include: {
                inventoryItem: {
                  select: {
                    id: true,
                    name: true,
                    rawStock: true,
                    unit: true,
                    restaurantId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Filter menu items based on inventory availability at THIS location
    const availableMenuItems = menuItems.filter(item => {
      // If no recipe, assume it's always available
      if (!item.recipe) return true;

      // Check if all ingredients are available for this location
      const allIngredientsAvailable = item.recipe.ingredients.every(recipeIngredient => {
        const inventoryItem = recipeIngredient.inventoryItem;

        // If no inventory item found for this location, item is not available
        if (!inventoryItem) return false;

        // Filter to match this restaurant's inventory
        if (inventoryItem.restaurantId !== restaurantId) return false;

        // Check if we have enough raw stock
        return inventoryItem.rawStock >= recipeIngredient.quantity;
      });

      return allIngredientsAvailable;
    });

    // Transform response to include availability info
    const menuWithAvailability = availableMenuItems.map(item => {
      const availabilityDetails = item.recipe
        ? item.recipe.ingredients.map(ri => {
            const inv = ri.inventoryItem;
            return {
              ingredient: ri.inventoryItem?.name || 'Unknown',
              required: ri.quantity,
              available: inv?.rawStock || 0,
              unit: ri.unit,
              sufficient: inv ? inv.rawStock >= ri.quantity : false,
            };
          })
        : [];

      return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        salePrice: item.salePrice,
        image: item.image,
        images: item.images,
        category: item.category.name,
        // Dietary info
        isVegetarian: item.isVegetarian,
        isVegan: item.isVegan,
        isGlutenFree: item.isGlutenFree,
        isKeto: item.isKeto,
        isHalal: item.isHalal,
        isKosher: item.isKosher,
        // Additional info
        calories: item.calories,
        preparationTime: item.preparationTime,
        spiceLevel: item.spiceLevel,
        allergens: item.allergens,
        ingredients: item.ingredients,
        winePairing: item.winePairing,
        isChefRecommended: item.isChefRecommended,
        isSeasonal: item.isSeasonal,
        isPopular: item.isPopular,
        averageRating: item.averageRating,
        reviewCount: item.reviewCount,
        customizationOptions: item.customizationOptions,
        // Availability info (for transparency)
        inventoryCheck: availabilityDetails,
      };
    });

    // Group by category
    const categories = [...new Set(availableMenuItems.map(item => item.category.name))];
    const groupedMenu = categories.map(categoryName => ({
      category: categoryName,
      items: menuWithAvailability.filter(item => item.category === categoryName),
    }));

    return NextResponse.json({
      restaurantId,
      restaurantName: restaurant.name,
      totalItems: menuWithAvailability.length,
      categories: groupedMenu,
      allItems: menuWithAvailability,
    });
  } catch (error) {
    console.error('Error fetching location menu:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    );
  }
}
