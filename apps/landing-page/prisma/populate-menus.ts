import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting menu population...')

  // Get all restaurants
  const restaurants = await prisma.restaurant.findMany({
    include: {
      menuCategories: true,
    },
  })

  console.log(`Found ${restaurants.length} restaurants`)

  for (const restaurant of restaurants) {
    console.log(`\nPopulating menu for: ${restaurant.name}`)

    // Define menu items based on restaurant type
    let menuData: any[] = []

    if (restaurant.type === 'CLASSICAL_FINE_DINING') {
      // Fine Dining Menu
      menuData = [
        {
          category: 'Appetizers',
          items: [
            {
              name: 'Foie Gras Terrine',
              description: 'Luxurious foie gras with brioche toast and fig compote',
              price: 28.00,
              isChefRecommended: true,
            },
            {
              name: 'Oysters Rockefeller',
              description: 'Fresh oysters baked with herbs, butter, and breadcrumbs',
              price: 24.00,
              isPopular: true,
            },
            {
              name: 'Lobster Bisque',
              description: 'Rich and creamy soup with cognac and fresh lobster',
              price: 18.00,
            },
          ],
        },
        {
          category: 'Main Courses',
          items: [
            {
              name: 'Wagyu Beef Wellington',
              description: 'Premium wagyu beef wrapped in puff pastry with duxelles',
              price: 85.00,
              isChefRecommended: true,
              preparationTime: 45,
            },
            {
              name: 'Pan-Seared Dover Sole',
              description: 'Delicate sole with lemon butter sauce and seasonal vegetables',
              price: 62.00,
            },
            {
              name: 'Duck Confit',
              description: 'Slow-cooked duck leg with cherry gastrique',
              price: 48.00,
              isPopular: true,
            },
          ],
        },
        {
          category: 'Desserts',
          items: [
            {
              name: 'Crème Brûlée',
              description: 'Classic vanilla custard with caramelized sugar crust',
              price: 14.00,
              isPopular: true,
            },
            {
              name: 'Chocolate Soufflé',
              description: 'Light and airy chocolate soufflé with vanilla ice cream',
              price: 16.00,
              preparationTime: 25,
            },
          ],
        },
      ]
    } else if (restaurant.type === 'QUICK_SERVICE') {
      // Quick Service Menu
      menuData = [
        {
          category: 'Quick Bites',
          items: [
            {
              name: 'Classic Burger',
              description: 'Juicy beef patty with lettuce, tomato, and special sauce',
              price: 12.00,
              isPopular: true,
              preparationTime: 10,
            },
            {
              name: 'Chicken Wrap',
              description: 'Grilled chicken with fresh vegetables in a tortilla',
              price: 10.00,
              preparationTime: 8,
            },
            {
              name: 'Fish Tacos',
              description: 'Crispy fish with cabbage slaw and chipotle mayo',
              price: 11.00,
            },
          ],
        },
        {
          category: 'Salads & Bowls',
          items: [
            {
              name: 'Caesar Salad',
              description: 'Romaine lettuce with parmesan, croutons, and Caesar dressing',
              price: 9.00,
              isVegetarian: true,
            },
            {
              name: 'Poke Bowl',
              description: 'Fresh tuna with rice, edamame, and sesame dressing',
              price: 14.00,
              isPopular: true,
            },
            {
              name: 'Mediterranean Bowl',
              description: 'Quinoa with falafel, hummus, and fresh vegetables',
              price: 13.00,
              isVegan: true,
              isVegetarian: true,
            },
          ],
        },
        {
          category: 'Beverages',
          items: [
            {
              name: 'Fresh Lemonade',
              description: 'Homemade lemonade with mint',
              price: 4.00,
              isVegan: true,
            },
            {
              name: 'Smoothie Bowl',
              description: 'Mixed berry smoothie topped with granola and fresh fruit',
              price: 8.00,
              isVegetarian: true,
            },
          ],
        },
      ]
    } else if (restaurant.type === 'CAFETERIA') {
      // Cafeteria Menu
      menuData = [
        {
          category: 'Breakfast',
          items: [
            {
              name: 'Full English Breakfast',
              description: 'Eggs, bacon, sausage, beans, toast, and tomatoes',
              price: 11.00,
              preparationTime: 15,
            },
            {
              name: 'Pancake Stack',
              description: 'Fluffy pancakes with maple syrup and fresh berries',
              price: 9.00,
              isVegetarian: true,
            },
            {
              name: 'Avocado Toast',
              description: 'Smashed avocado on sourdough with poached egg',
              price: 10.00,
              isVegetarian: true,
              isPopular: true,
            },
          ],
        },
        {
          category: 'Lunch Specials',
          items: [
            {
              name: 'Daily Soup & Sandwich',
              description: 'Chef\'s soup of the day with half sandwich',
              price: 12.00,
            },
            {
              name: 'Grilled Chicken Panini',
              description: 'Pressed panini with pesto and mozzarella',
              price: 11.00,
              preparationTime: 12,
            },
            {
              name: 'Vegetarian Lasagna',
              description: 'Layered pasta with ricotta and seasonal vegetables',
              price: 13.00,
              isVegetarian: true,
            },
          ],
        },
        {
          category: 'Coffee & Pastries',
          items: [
            {
              name: 'Cappuccino',
              description: 'Espresso with steamed milk and foam',
              price: 4.50,
              isVegetarian: true,
            },
            {
              name: 'Croissant',
              description: 'Buttery French croissant',
              price: 3.50,
              isVegetarian: true,
            },
            {
              name: 'Chocolate Muffin',
              description: 'Fresh-baked muffin with chocolate chips',
              price: 4.00,
              isVegetarian: true,
            },
          ],
        },
      ]
    }

    // Create categories and menu items for this restaurant
    for (const categoryData of menuData) {
      // Find or create category
      let category = restaurant.menuCategories.find(c => c.name === categoryData.category)

      if (!category) {
        category = await prisma.menuCategory.create({
          data: {
            restaurantId: restaurant.id,
            name: categoryData.category,
            description: `${categoryData.category} at ${restaurant.name}`,
            displayOrder: menuData.indexOf(categoryData),
          },
        })
        console.log(`  Created category: ${category.name}`)
      }

      // Create menu items
      for (const itemData of categoryData.items) {
        // Check if item already exists
        const existing = await prisma.menuItem.findFirst({
          where: {
            categoryId: category.id,
            name: itemData.name,
          },
        })

        if (!existing) {
          await prisma.menuItem.create({
            data: {
              ...itemData,
              categoryId: category.id,
            },
          })
          console.log(`    Added: ${itemData.name}`)
        }
      }
    }
  }

  console.log('\nMenu population complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
