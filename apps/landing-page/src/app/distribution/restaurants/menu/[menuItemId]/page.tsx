'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { menuApi } from '@/lib/api/restaurant-api';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChevronLeft,
  Heart,
  Star,
  Clock,
  Flame,
  Leaf,
  Award,
  ChefHat,
  UtensilsCrossed,
  Info,
  AlertCircle,
  Plus,
  Minus
} from 'lucide-react';
import Image from 'next/image';
import { useMenuStore } from '@/lib/stores/menu-store';
import { OrderTypeModal } from '@/components/orders/OrderTypeModal';

export default function MenuItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const menuItemId = params.menuItemId as string;
  const [quantity, setQuantity] = useState(1);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  const { isFavorite, toggleFavorite } = useMenuStore();
  const favorite = isFavorite(menuItemId);

  // Fetch menu item details with restaurant info
  const { data: menuItem, isLoading } = useQuery({
    queryKey: ['menu-item', menuItemId],
    queryFn: async () => {
      const response = await fetch(`/api/menu/${menuItemId}`);
      if (!response.ok) throw new Error('Failed to fetch menu item');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="flex-grow bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-96 bg-gray-200 rounded-lg mb-8" />
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="h-6 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!menuItem) {
    return (
      <>
        <Navbar />
        <main className="flex-grow bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Menu Item Not Found</h1>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const displayPrice = menuItem.salePrice || menuItem.price;
  const hasDiscount = menuItem.salePrice && menuItem.salePrice < menuItem.price;

  // Mock data for demonstration - this would come from the API
  const nutritionalInfo = {
    calories: menuItem.calories || 450,
    protein: '28g',
    carbs: '42g',
    fat: '18g',
    fiber: '6g',
    sodium: '680mg',
    sugar: '8g',
  };

  const detailedIngredients = menuItem.ingredients ?
    menuItem.ingredients.split(',').map(i => i.trim()) :
    ['Fresh ingredients', 'Seasonal vegetables', 'Premium quality'];

  const cookingProcedure = [
    {
      step: 1,
      title: 'Preparation',
      description: 'Gather all ingredients and prepare your workstation. Wash and chop vegetables.',
      time: '10 min'
    },
    {
      step: 2,
      title: 'Cooking',
      description: 'Heat pan to medium-high. Add ingredients in the proper sequence for optimal flavor.',
      time: '15 min'
    },
    {
      step: 3,
      title: 'Finishing',
      description: 'Plate beautifully and garnish. Add final seasonings to taste.',
      time: '5 min'
    },
  ];

  return (
    <>
      <Navbar />
      <main className="flex-grow bg-gray-50">
        {/* Back Button */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-primary-600 hover:text-primary-700"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Menu
            </button>
          </div>
        </div>

        {/* Hero Image Section */}
        <div className="relative h-96 bg-gray-900">
          {menuItem.image || menuItem.images?.[0] ? (
            <>
              <Image
                src={menuItem.image || menuItem.images![0]}
                alt={menuItem.name}
                fill
                className="object-cover opacity-90"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-6xl">
              🍽️
            </div>
          )}

          {/* Floating Badges */}
          <div className="absolute top-6 left-6 flex flex-col gap-2">
            {menuItem.isChefRecommended && (
              <span className="bg-yellow-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg">
                <Award className="w-4 h-4" />
                Chef's Pick
              </span>
            )}
            {menuItem.isSeasonal && (
              <span className="bg-orange-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
                Seasonal
              </span>
            )}
            {hasDiscount && (
              <span className="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
                On Sale
              </span>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={() => toggleFavorite(menuItemId)}
            className="absolute top-6 right-6 p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          >
            <Heart
              className={`w-6 h-6 ${favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
            />
          </button>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{menuItem.name}</h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  {menuItem.averageRating !== null && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{Number(menuItem.averageRating).toFixed(1)}</span>
                      </div>
                      <span className="text-gray-500">({menuItem.reviewCount} reviews)</span>
                    </div>
                  )}

                  {menuItem.preparationTime && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-5 h-5" />
                      <span>{menuItem.preparationTime} minutes</span>
                    </div>
                  )}

                  {menuItem.spiceLevel !== null && menuItem.spiceLevel > 0 && (
                    <div className="flex items-center gap-2 text-red-600">
                      <Flame className="w-5 h-5" />
                      <span>Spice Level: {menuItem.spiceLevel}/5</span>
                    </div>
                  )}
                </div>

                {menuItem.description && (
                  <p className="text-lg text-gray-700 leading-relaxed">{menuItem.description}</p>
                )}
              </div>

              {/* Dietary Tags */}
              <div className="flex flex-wrap gap-2">
                {menuItem.isVegan && (
                  <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg flex items-center gap-2 font-medium">
                    <Leaf className="w-4 h-4" />
                    Vegan
                  </span>
                )}
                {menuItem.isVegetarian && !menuItem.isVegan && (
                  <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg flex items-center gap-2 font-medium">
                    <Leaf className="w-4 h-4" />
                    Vegetarian
                  </span>
                )}
                {menuItem.isGlutenFree && (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-medium">
                    Gluten-Free
                  </span>
                )}
                {menuItem.isKeto && (
                  <span className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-medium">
                    Keto
                  </span>
                )}
                {menuItem.isHalal && (
                  <span className="bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg font-medium">
                    Halal
                  </span>
                )}
                {menuItem.isKosher && (
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg font-medium">
                    Kosher
                  </span>
                )}
              </div>

              {/* Tabs for Details */}
              <Tabs defaultValue="ingredients" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                  <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                  <TabsTrigger value="recipe">How It's Made</TabsTrigger>
                </TabsList>

                <TabsContent value="ingredients" className="space-y-4 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UtensilsCrossed className="w-5 h-5" />
                        Ingredients
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {detailedIngredients.map((ingredient, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-2" />
                            <span className="text-gray-700">{ingredient}</span>
                          </li>
                        ))}
                      </ul>

                      {menuItem.allergens && menuItem.allergens.length > 0 && (
                        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-amber-900 mb-1">Allergen Information</p>
                              <p className="text-sm text-amber-800">
                                Contains: {menuItem.allergens.join(', ')}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="nutrition" className="space-y-4 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="w-5 h-5" />
                        Nutritional Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(nutritionalInfo).map(([key, value]) => (
                          <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-gray-900">{value}</p>
                            <p className="text-sm text-gray-600 capitalize mt-1">{key}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-4 text-center">
                        *Nutritional values are approximate and may vary based on preparation
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="recipe" className="space-y-4 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ChefHat className="w-5 h-5" />
                        Cooking Procedure
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {cookingProcedure.map((step) => (
                          <div key={step.step} className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                                {step.step}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900">{step.title}</h4>
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {step.time}
                                </span>
                              </div>
                              <p className="text-gray-700">{step.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900">
                          <strong>Chef's Tip:</strong> {menuItem.winePairing || 'This dish is best enjoyed fresh and hot. Pair with your favorite beverage for the ultimate experience!'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Sidebar - Order Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Now</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Price */}
                  <div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-green-600">
                        ${displayPrice.toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span className="text-lg text-gray-400 line-through">
                          ${menuItem.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {hasDiscount && (
                      <p className="text-sm text-green-600 font-medium mt-1">
                        Save ${(menuItem.price - displayPrice).toFixed(2)}!
                      </p>
                    )}
                  </div>

                  {/* Quantity Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-xl font-semibold min-w-[3ch] text-center">
                        {quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className={`p-3 rounded-lg ${menuItem.isAvailable ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p className={`text-sm font-medium ${menuItem.isAvailable ? 'text-green-800' : 'text-red-800'}`}>
                      {menuItem.isAvailable ? '✓ Available Now' : '✗ Currently Unavailable'}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      size="lg"
                      disabled={!menuItem.isAvailable}
                      onClick={() => setOrderModalOpen(true)}
                    >
                      Place Order - ${(displayPrice * quantity).toFixed(2)}
                    </Button>
                    <p className="text-xs text-center text-gray-500">
                      Choose dine-in, takeaway, or delivery
                    </p>
                  </div>

                  {/* Additional Info */}
                  <div className="pt-4 border-t space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Prepared in {menuItem.preparationTime || 20} minutes</span>
                    </div>
                    {menuItem.calories && (
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4" />
                        <span>{menuItem.calories} calories</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Order Type Modal */}
      <OrderTypeModal
        open={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        menuItemId={menuItemId}
        menuItemName={menuItem.name}
        restaurantId={menuItem.restaurantId}
        restaurantName={menuItem.restaurantName}
        price={displayPrice}
        quantity={quantity}
      />
    </>
  );
}
