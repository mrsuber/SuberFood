import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create restaurant locations
  console.log('📍 Creating restaurant locations...');

  const fineDining = await prisma.restaurant.create({
    data: {
      name: 'SuberFood Fine Dining',
      slug: 'suberfood-fine-dining',
      type: 'CLASSICAL_FINE_DINING' as any,
      description: 'Experience luxury dining with our farm-to-table fine dining restaurant. Featuring seasonal menus crafted by award-winning chefs.',
      address: '123 Gourmet Street',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94102',
      phone: '(415) 555-0100',
      email: 'finedining@suberfoods.com',
      status: 'OPEN',
      openingTime: '17:00',
      closingTime: '23:00',
      operatingDays: 'Tuesday - Sunday',
      capacity: 80,
      rating: 4.8,
      latitude: 37.7749,
      longitude: -122.4194,
      images: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
      ],
      amenities: ['Wine Cellar', 'Private Dining', 'Valet Parking', 'Live Music'],
      parkingInfo: 'Complimentary valet parking available',
      accessibilityFeatures: ['Wheelchair Accessible', 'Accessible Restrooms'],
      privateRooms: true,
      outdoorSeating: true,
      currentWaitTime: 25,
      story: 'Founded in 2020, SuberFood Fine Dining represents the pinnacle of farm-to-table cuisine. Our award-winning chefs work directly with local farmers to bring you the freshest seasonal ingredients.',
      chefBios: {
        executiveChef: {
          name: 'Chef Marcus Williams',
          bio: 'With 20 years of Michelin-starred experience, Chef Marcus brings innovation and passion to every dish.',
          specialties: ['French Cuisine', 'Molecular Gastronomy'],
        },
        sousChef: {
          name: 'Chef Sarah Chen',
          bio: 'Trained in Tokyo and Paris, Chef Sarah specializes in Asian-French fusion.',
          specialties: ['Sushi', 'Pastry'],
        },
      },
      awards: [
        'Michelin Star 2023',
        'Best Farm-to-Table Restaurant 2024',
        'Wine Spectator Award of Excellence',
      ],
      sustainabilityInfo: 'We source 95% of our ingredients from local farms within 50 miles. Our restaurant is carbon-neutral and uses renewable energy.',
      pressMedia: {
        features: [
          { publication: 'Food & Wine Magazine', title: 'Top 10 Farm-to-Table Restaurants', year: 2024 },
          { publication: 'San Francisco Chronicle', title: 'A Culinary Masterpiece', year: 2023 },
        ],
      },
    },
  });

  const cafeteria = await prisma.restaurant.create({
    data: {
      name: 'SuberFood Fresh Cafeteria',
      slug: 'suberfood-fresh-cafeteria',
      type: 'CAFETERIA' as any,
      description: 'Quick, healthy, and delicious meals perfect for lunch or dinner. All ingredients sourced from our own farms.',
      address: '456 Market Avenue',
      city: 'Oakland',
      state: 'CA',
      postalCode: '94607',
      phone: '(510) 555-0200',
      email: 'cafeteria@suberfoods.com',
      status: 'OPEN',
      openingTime: '07:00',
      closingTime: '21:00',
      operatingDays: 'Monday - Sunday',
      capacity: 150,
      rating: 4.5,
      latitude: 37.8044,
      longitude: -122.2712,
      images: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
        'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800',
      ],
      amenities: ['Free WiFi', 'Outdoor Patio', 'Takeout', 'Delivery'],
      parkingInfo: 'Street parking and nearby parking garage',
      accessibilityFeatures: ['Wheelchair Accessible', 'Braille Menus'],
      privateRooms: false,
      outdoorSeating: true,
      currentWaitTime: 10,
      story: 'Our cafeteria brings fresh, farm-sourced meals to busy professionals and families. Everything is made fresh daily with zero preservatives.',
      sustainabilityInfo: 'All packaging is compostable. We compost food waste and donate surplus food to local shelters.',
    },
  });

  await prisma.restaurant.create({
    data: {
      name: 'SuberFood Urban Food Court',
      slug: 'suberfood-urban-food-court',
      type: 'QUICK_SERVICE' as any,
      description: 'A vibrant food court featuring multiple cuisines, all made with SuberFood ingredients.',
      address: '789 Downtown Plaza',
      city: 'San Jose',
      state: 'CA',
      postalCode: '95113',
      phone: '(408) 555-0300',
      email: 'foodcourt@suberfoods.com',
      status: 'OPEN',
      openingTime: '10:00',
      closingTime: '22:00',
      operatingDays: 'Monday - Sunday',
      capacity: 300,
      rating: 4.3,
      latitude: 37.3382,
      longitude: -121.8863,
      images: [
        'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
      ],
      amenities: ['Family Friendly', 'Multiple Cuisines', 'Fast Service', 'Large Seating Area'],
      parkingInfo: 'Mall parking garage - 2 hours free with validation',
      accessibilityFeatures: ['Wheelchair Accessible', 'Family Restrooms', 'Elevators'],
      privateRooms: false,
      outdoorSeating: false,
      currentWaitTime: 5,
    },
  });

  console.log(`✅ Created ${3} restaurant locations`);

  // Create menu categories
  console.log('📋 Creating menu categories...');

  const appetizers = await prisma.menuCategory.create({
    data: {
      restaurantId: fineDining.id,
      name: 'Appetizers',
      description: 'Start your meal with our exquisite starters',
      displayOrder: 1,
    },
  });

  const mains = await prisma.menuCategory.create({
    data: {
      restaurantId: fineDining.id,
      name: 'Main Courses',
      description: 'Our signature entrees featuring the finest ingredients',
      displayOrder: 2,
    },
  });

  const desserts = await prisma.menuCategory.create({
    data: {
      restaurantId: fineDining.id,
      name: 'Desserts',
      description: 'Sweet endings to perfect your dining experience',
      displayOrder: 3,
    },
  });

  const salads = await prisma.menuCategory.create({
    data: {
      restaurantId: cafeteria.id,
      name: 'Fresh Salads',
      description: 'Crisp, healthy salads with farm-fresh vegetables',
      displayOrder: 1,
    },
  });

  const bowls = await prisma.menuCategory.create({
    data: {
      restaurantId: cafeteria.id,
      name: 'Power Bowls',
      description: 'Nutritious grain and protein bowls',
      displayOrder: 2,
    },
  });

  console.log(`✅ Created ${5} menu categories`);

  // Create menu items
  console.log('🍽️  Creating menu items...');

  // Fine Dining Appetizers
  await prisma.menuItem.create({
    data: {
      categoryId: appetizers.id,
      name: 'Heirloom Tomato Carpaccio',
      description: 'Paper-thin heirloom tomatoes with burrata, basil oil, and aged balsamic',
      price: 18.00,
      image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600',
      images: ['https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600'],
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: true,
      calories: 220,
      preparationTime: 15,
      spiceLevel: 0,
      ingredients: 'Heirloom tomatoes, burrata cheese, fresh basil, extra virgin olive oil, balsamic reduction',
      isChefRecommended: true,
      isSeasonal: true,
      averageRating: 4.8,
      reviewCount: 156,
    },
  });

  await prisma.menuItem.create({
    data: {
      categoryId: appetizers.id,
      name: 'Seared Scallops',
      description: 'Pan-seared day-boat scallops with cauliflower puree and microgreens',
      price: 24.00,
      salePrice: 20.00,
      image: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=600',
      images: ['https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=600'],
      isAvailable: true,
      isGlutenFree: true,
      calories: 180,
      preparationTime: 20,
      spiceLevel: 1,
      allergens: ['Shellfish'],
      ingredients: 'Fresh scallops, cauliflower, butter, microgreens, lemon',
      isChefRecommended: true,
      isPopular: true,
      averageRating: 4.9,
      reviewCount: 203,
    },
  });

  await prisma.menuItem.create({
    data: {
      categoryId: appetizers.id,
      name: 'Spicy Tuna Tartare',
      description: 'Sushi-grade tuna with avocado, crispy wonton, and sriracha aioli',
      price: 22.00,
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600',
      images: ['https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600'],
      isAvailable: true,
      isGlutenFree: false,
      calories: 240,
      preparationTime: 15,
      spiceLevel: 3,
      allergens: ['Fish', 'Soy', 'Wheat'],
      ingredients: 'Ahi tuna, avocado, wonton crisps, sriracha, aioli, sesame seeds',
      winePairing: 'Sauvignon Blanc or Champagne',
      isPopular: true,
      averageRating: 4.7,
      reviewCount: 178,
    },
  });

  // Main Courses
  await prisma.menuItem.create({
    data: {
      categoryId: mains.id,
      name: 'Grass-Fed Ribeye Steak',
      description: '16oz prime ribeye with roasted fingerling potatoes and seasonal vegetables',
      price: 58.00,
      image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600',
      images: ['https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600'],
      isAvailable: true,
      isGlutenFree: true,
      calories: 820,
      preparationTime: 30,
      spiceLevel: 1,
      allergens: ['Dairy'],
      ingredients: 'Grass-fed ribeye, fingerling potatoes, seasonal vegetables, herb butter',
      winePairing: 'Cabernet Sauvignon or Malbec',
      isChefRecommended: true,
      isPopular: true,
      averageRating: 4.9,
      reviewCount: 342,
      customizationOptions: {
        doneness: ['Rare', 'Medium Rare', 'Medium', 'Medium Well', 'Well Done'],
        sides: ['Mashed Potatoes', 'Grilled Asparagus', 'Truffle Fries'],
      },
    },
  });

  await prisma.menuItem.create({
    data: {
      categoryId: mains.id,
      name: 'Wild Mushroom Risotto',
      description: 'Creamy arborio risotto with wild mushrooms, parmesan, and truffle oil',
      price: 32.00,
      image: 'https://images.unsplash.com/photo-1476124369491-b79d2d72eb8e?w=600',
      images: ['https://images.unsplash.com/photo-1476124369491-b79d2d72eb8e?w=600'],
      isAvailable: true,
      isVegetarian: true,
      isGlutenFree: true,
      calories: 520,
      preparationTime: 25,
      spiceLevel: 0,
      allergens: ['Dairy'],
      ingredients: 'Arborio rice, porcini mushrooms, oyster mushrooms, parmesan, truffle oil, white wine',
      winePairing: 'Chardonnay or Pinot Noir',
      isSeasonal: true,
      averageRating: 4.6,
      reviewCount: 189,
    },
  });

  await prisma.menuItem.create({
    data: {
      categoryId: mains.id,
      name: 'Pan-Seared Salmon',
      description: 'Norwegian salmon with lemon-dill sauce, quinoa, and roasted Brussels sprouts',
      price: 38.00,
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600',
      images: ['https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600'],
      isAvailable: true,
      isGlutenFree: true,
      calories: 540,
      preparationTime: 20,
      spiceLevel: 0,
      allergens: ['Fish'],
      ingredients: 'Norwegian salmon, quinoa, Brussels sprouts, lemon, dill, butter',
      winePairing: 'Sauvignon Blanc or Pinot Grigio',
      isChefRecommended: false,
      isPopular: true,
      averageRating: 4.7,
      reviewCount: 267,
    },
  });

  // Desserts
  await prisma.menuItem.create({
    data: {
      categoryId: desserts.id,
      name: 'Dark Chocolate Lava Cake',
      description: 'Warm molten chocolate cake with vanilla bean ice cream and raspberry coulis',
      price: 14.00,
      image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600',
      images: ['https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600'],
      isAvailable: true,
      isVegetarian: true,
      calories: 620,
      preparationTime: 15,
      spiceLevel: 0,
      allergens: ['Dairy', 'Eggs', 'Wheat', 'Soy'],
      ingredients: 'Dark chocolate, butter, eggs, sugar, flour, vanilla ice cream, raspberries',
      isPopular: true,
      averageRating: 4.9,
      reviewCount: 428,
    },
  });

  await prisma.menuItem.create({
    data: {
      categoryId: desserts.id,
      name: 'Crème Brûlée',
      description: 'Classic French vanilla custard with caramelized sugar crust',
      price: 12.00,
      image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=600',
      images: ['https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=600'],
      isAvailable: true,
      isVegetarian: true,
      isGlutenFree: true,
      calories: 380,
      preparationTime: 10,
      spiceLevel: 0,
      allergens: ['Dairy', 'Eggs'],
      ingredients: 'Heavy cream, vanilla beans, egg yolks, sugar',
      isChefRecommended: true,
      averageRating: 4.8,
      reviewCount: 312,
    },
  });

  // Cafeteria Items
  await prisma.menuItem.create({
    data: {
      categoryId: salads.id,
      name: 'SuperGreens Power Salad',
      description: 'Kale, spinach, quinoa, avocado, chickpeas, and lemon-tahini dressing',
      price: 13.50,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
      images: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600'],
      isAvailable: true,
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: true,
      calories: 420,
      preparationTime: 10,
      spiceLevel: 0,
      allergens: ['Sesame'],
      ingredients: 'Kale, spinach, quinoa, avocado, chickpeas, tahini, lemon, olive oil',
      isPopular: true,
      averageRating: 4.6,
      reviewCount: 234,
    },
  });

  await prisma.menuItem.create({
    data: {
      categoryId: salads.id,
      name: 'Mediterranean Chickpea Bowl',
      description: 'Romaine, cucumber, tomatoes, olives, feta, and red wine vinaigrette',
      price: 12.00,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
      images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'],
      isAvailable: true,
      isVegetarian: true,
      isGlutenFree: true,
      calories: 350,
      preparationTime: 10,
      spiceLevel: 0,
      allergens: ['Dairy'],
      ingredients: 'Romaine lettuce, cucumber, tomatoes, Kalamata olives, feta cheese, chickpeas, red wine vinegar',
      averageRating: 4.5,
      reviewCount: 178,
    },
  });

  await prisma.menuItem.create({
    data: {
      categoryId: bowls.id,
      name: 'Teriyaki Chicken Bowl',
      description: 'Grilled chicken with brown rice, edamame, carrots, and teriyaki sauce',
      price: 14.50,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600',
      images: ['https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600'],
      isAvailable: true,
      isGlutenFree: false,
      calories: 580,
      preparationTime: 15,
      spiceLevel: 1,
      allergens: ['Soy', 'Wheat'],
      ingredients: 'Chicken breast, brown rice, edamame, carrots, teriyaki sauce, sesame seeds',
      isPopular: true,
      averageRating: 4.7,
      reviewCount: 412,
    },
  });

  await prisma.menuItem.create({
    data: {
      categoryId: bowls.id,
      name: 'Spicy Korean BBQ Bowl',
      description: 'Korean-style beef with kimchi, brown rice, and gochujang sauce',
      price: 15.50,
      image: 'https://images.unsplash.com/photo-1582253688774-97753c1e4e79?w=600',
      images: ['https://images.unsplash.com/photo-1582253688774-97753c1e4e79?w=600'],
      isAvailable: true,
      isGlutenFree: false,
      isKeto: false,
      calories: 650,
      preparationTime: 18,
      spiceLevel: 4,
      allergens: ['Soy', 'Wheat'],
      ingredients: 'Beef bulgogi, kimchi, brown rice, gochujang, sesame oil, scallions',
      isChefRecommended: false,
      isPopular: true,
      averageRating: 4.8,
      reviewCount: 356,
    },
  });

  console.log(`✅ Created ${13} menu items`);

  console.log('🎉 Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Restaurants: 3`);
  console.log(`   - Categories: 5`);
  console.log(`   - Menu Items: 13`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
