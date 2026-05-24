import Link from 'next/link';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { Store, ShoppingBag, Building2, ArrowRight } from 'lucide-react';

const distributionChannels = [
  {
    icon: Building2,
    title: 'Restaurants',
    description: 'Experience our classical fine dining restaurants featuring farm-to-table cuisine crafted by award-winning chefs.',
    href: '/distribution/restaurants',
    features: ['Fine Dining Experiences', 'Multiple Locations', 'Private Events', 'Seasonal Menus'],
    color: 'blue'
  },
  {
    icon: ShoppingBag,
    title: 'Retail & E-commerce',
    description: 'Shop fresh, premium products online and have them delivered directly to your door.',
    href: '/distribution/retail',
    features: ['Online Shopping', 'Fresh Products', 'Home Delivery', 'Quality Guaranteed'],
    color: 'green'
  },
  {
    icon: Store,
    title: 'B2B Partners',
    description: 'Wholesale distribution for businesses, restaurants, and retail partners seeking premium ingredients.',
    href: '/distribution/partners',
    features: ['Bulk Orders', 'Competitive Pricing', 'Reliable Supply', 'Partnership Programs'],
    color: 'purple'
  },
];

export default function DistributionPage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-5xl font-bold mb-6">Distribution Channels</h1>
            <p className="text-xl text-blue-100 max-w-3xl">
              From farm to table, we deliver premium quality through multiple channels.
              Whether you're dining at our restaurants, shopping online, or partnering with us for bulk orders,
              we ensure the same exceptional quality and freshness.
            </p>
          </div>
        </div>

        {/* Distribution Channels Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {distributionChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <Link
                  key={channel.title}
                  href={channel.href}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
                >
                  <div className={`p-8 bg-gradient-to-br from-${channel.color}-50 to-white`}>
                    <div className={`w-16 h-16 rounded-full bg-${channel.color}-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-8 h-8 text-${channel.color}-600`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{channel.title}</h3>
                    <p className="text-gray-600 mb-6">{channel.description}</p>

                    <ul className="space-y-2 mb-6">
                      {channel.features.map((feature) => (
                        <li key={feature} className="flex items-center text-sm text-gray-700">
                          <div className={`w-1.5 h-1.5 rounded-full bg-${channel.color}-500 mr-2`} />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className={`flex items-center text-${channel.color}-600 font-medium group-hover:gap-3 transition-all`}>
                      Learn More
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white border-y border-gray-200 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
                <div className="text-gray-600">Restaurant Locations</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">10k+</div>
                <div className="text-gray-600">Online Orders/Month</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">200+</div>
                <div className="text-gray-600">B2B Partners</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">99.8%</div>
                <div className="text-gray-600">Customer Satisfaction</div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose SuberFood Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">🌱</div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Farm Fresh</h3>
              <p className="text-sm text-gray-600">
                All products sourced directly from our own farms for maximum freshness
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">🚚</div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-sm text-gray-600">
                Quick and reliable delivery ensuring products reach you in peak condition
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">✨</div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-sm text-gray-600">
                Rigorous quality control at every step from farm to final delivery
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">🔒</div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Full Traceability</h3>
              <p className="text-sm text-gray-600">
                Complete transparency from farm to table with full supply chain tracking
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">♻️</div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Sustainable</h3>
              <p className="text-sm text-gray-600">
                Eco-friendly practices and packaging throughout our distribution network
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">💰</div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Best Value</h3>
              <p className="text-sm text-gray-600">
                Competitive pricing without compromising on quality or service
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Experience SuberFood Quality?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Choose your preferred distribution channel and discover the difference fresh, sustainable food makes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/distribution/restaurants"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Visit Our Restaurants
              </Link>
              <Link
                href="/distribution/retail"
                className="bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors border-2 border-white"
              >
                Shop Online
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
