import Link from 'next/link'
import { Navbar } from '@/components/navigation/Navbar'
import { Footer } from '@/components/navigation/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { MapPin, Clock, Star, Phone, Mail, Calendar, ChevronLeft } from 'lucide-react'

// Mock data - will be replaced with database query
const getRestaurant = (slug: string) => {
  const restaurants: Record<string, any> = {
    'suberfood-classical': {
      id: '1',
      name: 'SuberFood Classical',
      slug: 'suberfood-classical',
      type: 'Classical Fine Dining',
      description: 'Experience farm-to-table excellence in an elegant setting. Our seasonal menu showcases the finest ingredients from our farms.',
      longDescription: 'SuberFood Classical represents the pinnacle of farm-to-table dining. Our commitment to quality begins at our farms and ends at your table. Every dish is crafted with precision, showcasing seasonal ingredients at their peak freshness. Our wine list features carefully selected bottles that complement our ever-changing menu.',
      address: '123 Gourmet Avenue',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94102',
      phone: '+1 (555) 123-4567',
      email: 'classical@suberfoods.com',
      rating: 4.8,
      reviewCount: 324,
      capacity: 80,
      openingTime: '17:00',
      closingTime: '23:00',
      priceRange: '$$$$',
      features: ['Fine Dining', 'Wine Pairing', 'Private Events', 'Chef\'s Table', 'Valet Parking'],
      dressCode: 'Business Casual',
      menuCategories: [
        {
          id: '1',
          name: 'Appetizers',
          items: [
            {
              id: '1',
              name: 'Farm Greens Salad',
              description: 'Organic mixed greens from our farm with house vinaigrette',
              price: 18,
              isVegetarian: true,
              isGlutenFree: true,
            },
            {
              id: '2',
              name: 'Grilled Octopus',
              description: 'Mediterranean-style with lemon and herbs',
              price: 24,
            },
            {
              id: '3',
              name: 'Beef Carpaccio',
              description: 'Thinly sliced grass-fed beef with arugula and parmesan',
              price: 22,
            },
          ],
        },
        {
          id: '2',
          name: 'Main Courses',
          items: [
            {
              id: '4',
              name: 'Pan-Seared Sea Bass',
              description: 'Fresh catch from our aquaculture farm with seasonal vegetables',
              price: 48,
              isGlutenFree: true,
            },
            {
              id: '5',
              name: 'Grass-Fed Ribeye',
              description: '16oz premium cut with truffle butter',
              price: 62,
            },
            {
              id: '6',
              name: 'Wild Mushroom Risotto',
              description: 'Creamy arborio rice with foraged mushrooms',
              price: 38,
              isVegetarian: true,
            },
          ],
        },
        {
          id: '3',
          name: 'Desserts',
          items: [
            {
              id: '7',
              name: 'Chocolate Lava Cake',
              description: 'Warm chocolate cake with vanilla ice cream',
              price: 14,
              isVegetarian: true,
            },
            {
              id: '8',
              name: 'Seasonal Fruit Tart',
              description: 'Fresh fruit from our orchards',
              price: 12,
              isVegetarian: true,
            },
          ],
        },
      ],
    },
    'suberfood-bistro': {
      id: '2',
      name: 'SuberFood Bistro',
      slug: 'suberfood-bistro',
      type: 'Cafeteria',
      description: 'Casual dining with fresh, locally-sourced ingredients.',
      longDescription: 'SuberFood Bistro offers a relaxed atmosphere perfect for lunch or casual dinner.',
      address: '456 Market Street',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94103',
      phone: '+1 (555) 234-5678',
      email: 'bistro@suberfoods.com',
      rating: 4.6,
      reviewCount: 189,
      capacity: 120,
      openingTime: '11:00',
      closingTime: '22:00',
      priceRange: '$$',
      features: ['Family Friendly', 'Quick Service', 'Outdoor Seating', 'Takeout Available'],
      dressCode: 'Casual',
      menuCategories: [],
    },
  }

  return restaurants[slug] || null
}

export default function RestaurantDetailPage({ params }: { params: { slug: string } }) {
  const restaurant = getRestaurant(params.slug)

  if (!restaurant) {
    return (
      <>
        <Navbar />
        <main className="flex-1 py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Restaurant Not Found
            </h1>
            <Link href="/distribution/restaurants">
              <Button>Back to Restaurants</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Header with Back Button */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/distribution/restaurants" className="inline-flex items-center text-primary-600 hover:text-primary-700">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Restaurants
            </Link>
          </div>
        </div>

        {/* Restaurant Hero */}
        <section className="relative">
          <div className="h-96 bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
            <p className="text-gray-400 text-lg">[Restaurant Hero Image]</p>
          </div>
        </section>

        {/* Restaurant Info */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-semibold text-gray-900">{restaurant.rating}</span>
                    <span className="text-gray-500">({restaurant.reviewCount} reviews)</span>
                  </div>
                  <h1 className="text-5xl font-display font-bold text-gray-900 mb-4">
                    {restaurant.name}
                  </h1>
                  <p className="text-xl text-primary-600 font-medium mb-4">
                    {restaurant.type} • {restaurant.priceRange}
                  </p>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {restaurant.longDescription}
                  </p>
                </div>

                {/* Features */}
                <div className="mb-12">
                  <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
                    Features & Amenities
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {restaurant.features.map((feature: string) => (
                      <span
                        key={feature}
                        className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Menu */}
                <div>
                  <h2 className="text-3xl font-display font-bold text-gray-900 mb-8">
                    Our Menu
                  </h2>
                  {restaurant.menuCategories.map((category: any) => (
                    <div key={category.id} className="mb-10">
                      <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                        {category.name}
                      </h3>
                      <div className="space-y-6">
                        {category.items.map((item: any) => (
                          <div key={item.id} className="border-b border-gray-200 pb-6 last:border-0">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                  {item.name}
                                  {item.isVegetarian && (
                                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                      V
                                    </span>
                                  )}
                                  {item.isGlutenFree && (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                      GF
                                    </span>
                                  )}
                                </h4>
                                <p className="text-gray-600">{item.description}</p>
                              </div>
                              <span className="text-lg font-semibold text-gray-900 ml-4">
                                ${item.price}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Restaurant Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">Address</p>
                        <p className="text-sm text-gray-600">
                          {restaurant.address}<br />
                          {restaurant.city}, {restaurant.state} {restaurant.postalCode}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-primary-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">Hours</p>
                        <p className="text-sm text-gray-600">
                          {restaurant.openingTime} - {restaurant.closingTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-primary-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">Phone</p>
                        <a href={`tel:${restaurant.phone}`} className="text-sm text-primary-600 hover:text-primary-700">
                          {restaurant.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-primary-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">Email</p>
                        <a href={`mailto:${restaurant.email}`} className="text-sm text-primary-600 hover:text-primary-700">
                          {restaurant.email}
                        </a>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Link href={`/distribution/restaurants/${restaurant.slug}/reserve`}>
                        <Button className="w-full mb-3">
                          <Calendar className="w-4 h-4 mr-2" />
                          Make a Reservation
                        </Button>
                      </Link>
                      <Button variant="outline" className="w-full">
                        View on Map
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
