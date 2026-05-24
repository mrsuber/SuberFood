import Link from 'next/link';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { Fish, Bird, Cow, Wheat, ArrowRight } from 'lucide-react';

const farmingOperations = [
  {
    icon: Fish,
    title: 'Fish Farming',
    description: 'Sustainable aquaculture operations producing premium fish with responsible farming practices.',
    href: '/farming/aquaculture',
    features: ['Sustainable Practices', 'Clean Water Systems', 'Quality Feed', 'Disease Prevention'],
    color: 'blue'
  },
  {
    icon: Bird,
    title: 'Poultry Farming',
    description: 'Free-range chicken and egg production with humane treatment and organic feed.',
    href: '/farming/poultry',
    features: ['Free Range', 'Organic Feed', 'Antibiotic Free', 'Humane Treatment'],
    color: 'yellow'
  },
  {
    icon: Cow,
    title: 'Livestock',
    description: 'Grass-fed cattle and dairy farming with focus on animal welfare and quality.',
    href: '/farming/livestock',
    features: ['Grass Fed', 'Animal Welfare', 'Hormone Free', 'Quality Breeding'],
    color: 'red'
  },
  {
    icon: Wheat,
    title: 'Crop Farming',
    description: 'Organic fruits and vegetables grown using sustainable agricultural methods.',
    href: '/farming/crops',
    features: ['Organic Methods', 'Crop Rotation', 'No Pesticides', 'Soil Health'],
    color: 'green'
  },
];

export default function FarmingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-700 to-green-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-5xl font-bold mb-6">Sustainable Farming Operations</h1>
            <p className="text-xl text-green-100 max-w-3xl">
              From our farms to your table, we practice sustainable agriculture that respects the land,
              animals, and environment. Our integrated farming approach ensures the highest quality
              products while protecting our planet for future generations.
            </p>
          </div>
        </div>

        {/* Farming Operations Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {farmingOperations.map((operation) => {
              const Icon = operation.icon;
              return (
                <Link
                  key={operation.title}
                  href={operation.href}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
                >
                  <div className={`p-8 bg-gradient-to-br from-${operation.color}-50 to-white`}>
                    <div className={`w-16 h-16 rounded-full bg-${operation.color}-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-8 h-8 text-${operation.color}-600`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{operation.title}</h3>
                    <p className="text-gray-600 mb-6">{operation.description}</p>

                    <ul className="space-y-2 mb-6">
                      {operation.features.map((feature) => (
                        <li key={feature} className="flex items-center text-sm text-gray-700">
                          <div className={`w-1.5 h-1.5 rounded-full bg-${operation.color}-500 mr-2`} />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className={`flex items-center text-${operation.color}-600 font-medium group-hover:gap-3 transition-all`}>
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
                <div className="text-4xl font-bold text-green-700 mb-2">5,000+</div>
                <div className="text-gray-600">Acres of Farmland</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-700 mb-2">100%</div>
                <div className="text-gray-600">Sustainable Practices</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-700 mb-2">4</div>
                <div className="text-gray-600">Farming Operations</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-700 mb-2">Zero</div>
                <div className="text-gray-600">Chemical Pesticides</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Farming Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">🌱</div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Organic Practices</h3>
              <p className="text-sm text-gray-600">
                No synthetic pesticides or fertilizers, only natural methods
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">💧</div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Water Conservation</h3>
              <p className="text-sm text-gray-600">
                Efficient irrigation and water recycling systems
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">🐝</div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Biodiversity</h3>
              <p className="text-sm text-gray-600">
                Protecting pollinators and local wildlife habitats
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">🌾</div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Soil Health</h3>
              <p className="text-sm text-gray-600">
                Crop rotation and composting for rich, healthy soil
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">❤️</div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Animal Welfare</h3>
              <p className="text-sm text-gray-600">
                Humane treatment and spacious living conditions
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">♻️</div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Circular Economy</h3>
              <p className="text-sm text-gray-600">
                Waste reduction and resource recycling throughout operations
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-700 to-green-800 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Visit Our Farms</h2>
            <p className="text-xl text-green-100 mb-8">
              See our sustainable farming practices in action and learn how we grow your food.
            </p>
            <Link
              href="/about"
              className="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors inline-block"
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
