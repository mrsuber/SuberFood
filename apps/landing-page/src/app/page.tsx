import Link from 'next/link'
import { Navbar } from '@/components/navigation/Navbar'
import { Footer } from '@/components/navigation/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ArrowRight, CheckCircle, Leaf, TrendingUp, Users } from 'lucide-react'

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-50 via-white to-emerald-50 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-gray-900 mb-6 animate-fade-in">
                From Farm to Table
                <span className="text-primary-600 block mt-2">Excellence</span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Experience complete transparency in your food journey. Fresh, sustainable,
                and traceable from our integrated farms to your dining table.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/distribution/retail">
                  <Button size="lg" className="group">
                    Shop Now
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/distribution/restaurants">
                  <Button variant="outline" size="lg">
                    Find a Restaurant
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Our Journey Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 mb-4">
                Our Integrated Supply Chain
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Complete control from seed to plate ensures quality, transparency, and sustainability
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Link href="/farming">
                <Card className="cursor-pointer hover:shadow-premium transition-all hover:-translate-y-1 h-full">
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                      <span className="text-4xl">🌾</span>
                    </div>
                    <CardTitle>Farming</CardTitle>
                    <CardDescription>
                      Sustainable practices across crops, livestock, aquaculture, and poultry operations
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/processing">
                <Card className="cursor-pointer hover:shadow-premium transition-all hover:-translate-y-1 h-full">
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                      <span className="text-4xl">🏭</span>
                    </div>
                    <CardTitle>Processing</CardTitle>
                    <CardDescription>
                      State-of-the-art facilities ensuring quality and food safety standards
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/distribution">
                <Card className="cursor-pointer hover:shadow-premium transition-all hover:-translate-y-1 h-full">
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                      <span className="text-4xl">🚚</span>
                    </div>
                    <CardTitle>Distribution</CardTitle>
                    <CardDescription>
                      Restaurants, retail stores, and direct-to-consumer delivery services
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-display font-bold text-gray-900 mb-6">
                  Why Choose SuberFood?
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">100% Traceable</h3>
                      <p className="text-gray-600">
                        Track every product from farm to your table with complete transparency
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Leaf className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">Sustainable Practices</h3>
                      <p className="text-gray-600">
                        Environmentally responsible farming and minimal carbon footprint
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <TrendingUp className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">Premium Quality</h3>
                      <p className="text-gray-600">
                        Rigorous quality controls at every stage of production
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Users className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">Community First</h3>
                      <p className="text-gray-600">
                        Supporting local farmers and creating jobs in rural communities
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl h-96 flex items-center justify-center">
                <p className="text-gray-500 text-lg">
                  [Feature Image/Video Placeholder]
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-primary-700">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
              Ready to Experience Real Food?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of families enjoying fresh, traceable, sustainable food.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/distribution/retail">
                <Button size="lg" variant="secondary" className="bg-white hover:bg-gray-100 text-primary-600">
                  Start Shopping
                </Button>
              </Link>
              <Link href="/distribution/partners">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-primary-700">
                  For Business Partners
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
