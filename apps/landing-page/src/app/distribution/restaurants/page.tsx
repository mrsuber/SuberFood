import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/navigation/Navbar'
import { Footer } from '@/components/navigation/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { MapPin, Clock, Star, Users, Phone, ChevronRight } from 'lucide-react'

// Mock data - will be replaced with database queries
const restaurants = [
  {
    id: '1',
    name: 'SuberFood Classical',
    slug: 'suberfood-classical',
    type: 'Classical Fine Dining',
    description: 'Experience farm-to-table excellence in an elegant setting. Our seasonal menu showcases the finest ingredients from our farms.',
    address: '123 Gourmet Avenue',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94102',
    phone: '+1 (555) 123-4567',
    rating: 4.8,
    reviewCount: 324,
    capacity: 80,
    openingTime: '17:00',
    closingTime: '23:00',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
    priceRange: '$$$$',
    features: ['Fine Dining', 'Wine Pairing', 'Private Events'],
  },
  {
    id: '2',
    name: 'SuberFood Bistro',
    slug: 'suberfood-bistro',
    type: 'Cafeteria',
    description: 'Casual dining with fresh, locally-sourced ingredients. Perfect for lunch or a quick dinner.',
    address: '456 Market Street',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94103',
    phone: '+1 (555) 234-5678',
    rating: 4.6,
    reviewCount: 189,
    capacity: 120,
    openingTime: '11:00',
    closingTime: '22:00',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop',
    priceRange: '$$',
    features: ['Family Friendly', 'Quick Service', 'Outdoor Seating'],
  },
]

export default function RestaurantsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl">
              <h1 className="text-5xl sm:text-6xl font-display font-bold mb-6">
                Our Restaurants
              </h1>
              <p className="text-xl text-primary-100 mb-8">
                Experience the finest farm-to-table dining. Every dish tells a story
                from our farms to your plate.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="secondary" className="bg-white hover:bg-gray-100 text-primary-600">
                  Make a Reservation
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-primary-700">
                  View Menu
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Restaurants Grid */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
                Discover Our Locations
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                From classical fine dining to casual bistros, each location offers
                a unique experience with the same commitment to quality.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {restaurants.map((restaurant) => (
                <Card key={restaurant.id} className="overflow-hidden hover:shadow-premium-lg transition-all">
                  {/* Restaurant Image */}
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={restaurant.image}
                      alt={restaurant.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-2xl font-display font-bold text-gray-900 mb-1">
                            {restaurant.name}
                          </h3>
                          <p className="text-sm text-primary-600 font-medium">
                            {restaurant.type}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-gray-900">{restaurant.rating}</span>
                          <span className="text-sm text-gray-500">({restaurant.reviewCount})</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{restaurant.description}</p>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-gray-700">
                        <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0" />
                        <span className="text-sm">
                          {restaurant.address}, {restaurant.city}, {restaurant.state} {restaurant.postalCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Clock className="w-5 h-5 text-primary-600 flex-shrink-0" />
                        <span className="text-sm">
                          Open {restaurant.openingTime} - {restaurant.closingTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Users className="w-5 h-5 text-primary-600 flex-shrink-0" />
                        <span className="text-sm">Capacity: {restaurant.capacity} guests</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Phone className="w-5 h-5 text-primary-600 flex-shrink-0" />
                        <span className="text-sm">{restaurant.phone}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {restaurant.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Link href={`/distribution/restaurants/${restaurant.slug}`} className="flex-1">
                        <Button className="w-full group">
                          View Details
                          <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                      <Link href={`/distribution/restaurants/${restaurant.slug}/reserve`}>
                        <Button variant="outline">Reserve</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Dine With Us */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
                Why Dine With Us?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                More than just a meal - it's an experience rooted in sustainability and quality
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl">🌱</span>
                  </div>
                  <CardTitle>Farm-Fresh Ingredients</CardTitle>
                  <CardDescription>
                    Every ingredient is sourced from our own farms, ensuring maximum freshness and flavor
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl">👨‍🍳</span>
                  </div>
                  <CardTitle>Expert Chefs</CardTitle>
                  <CardDescription>
                    Our culinary team transforms fresh produce into memorable dining experiences
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl">♻️</span>
                  </div>
                  <CardTitle>Sustainable Practices</CardTitle>
                  <CardDescription>
                    Zero-waste kitchen, composting, and eco-friendly packaging for takeout orders
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-primary-700">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
              Ready to Experience Farm-to-Table?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Make your reservation today and taste the difference quality makes
            </p>
            <Button size="lg" variant="secondary" className="bg-white hover:bg-gray-100 text-primary-600">
              Book a Table Now
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
