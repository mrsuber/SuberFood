import Link from 'next/link';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { Fish, Milk, Beef, Salad, ArrowRight } from 'lucide-react';

const processingFacilities = [
  {
    icon: Fish,
    title: 'Sardine Processing',
    description: 'State-of-the-art seafood processing facility ensuring the highest quality sardines from ocean to can.',
    href: '/processing/sardine',
    features: ['Fresh Catch Daily', 'Quality Inspection', 'Modern Equipment', 'ISO Certified'],
    color: 'blue'
  },
  {
    icon: Milk,
    title: 'Milk Processing',
    description: 'Advanced dairy processing and pasteurization facility producing premium milk and dairy products.',
    href: '/processing/milk',
    features: ['Fresh Dairy', 'Pasteurization', 'Quality Testing', 'Cold Chain'],
    color: 'indigo'
  },
  {
    icon: Beef,
    title: 'Meat Processing',
    description: 'USDA-approved meat processing facility handling premium cuts with strict hygiene standards.',
    href: '/processing/meat',
    features: ['USDA Approved', 'Premium Cuts', 'Hygiene Standards', 'Vacuum Sealed'],
    color: 'red'
  },
  {
    icon: Salad,
    title: 'Vegetable Processing',
    description: 'Fresh-cut and packaging facility for vegetables, ensuring farm-fresh quality year-round.',
    href: '/processing/vegetables',
    features: ['Fresh Cut', 'Minimal Processing', 'Quick Freezing', 'Nutrient Retention'],
    color: 'green'
  },
];

export default function ProcessingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-5xl font-bold mb-6">Food Processing Facilities</h1>
            <p className="text-xl text-green-100 max-w-3xl">
              Our state-of-the-art processing facilities ensure that every product meets the highest
              standards of quality, safety, and freshness. From farm to processing to your table,
              we maintain complete control over quality.
            </p>
          </div>
        </div>

        {/* Processing Facilities Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {processingFacilities.map((facility) => {
              const Icon = facility.icon;
              return (
                <Link
                  key={facility.title}
                  href={facility.href}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
                >
                  <div className={`p-8 bg-gradient-to-br from-${facility.color}-50 to-white`}>
                    <div className={`w-16 h-16 rounded-full bg-${facility.color}-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-8 h-8 text-${facility.color}-600`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{facility.title}</h3>
                    <p className="text-gray-600 mb-6">{facility.description}</p>

                    <ul className="space-y-2 mb-6">
                      {facility.features.map((feature) => (
                        <li key={feature} className="flex items-center text-sm text-gray-700">
                          <div className={`w-1.5 h-1.5 rounded-full bg-${facility.color}-500 mr-2`} />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className={`flex items-center text-${facility.color}-600 font-medium group-hover:gap-3 transition-all`}>
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
                <div className="text-4xl font-bold text-green-600 mb-2">4</div>
                <div className="text-gray-600">Processing Facilities</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">100k+</div>
                <div className="text-gray-600">Units Processed Daily</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">ISO</div>
                <div className="text-gray-600">Certified Facilities</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">99.9%</div>
                <div className="text-gray-600">Quality Assurance Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Processing Standards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">🔬</div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Laboratory Testing</h3>
              <p className="text-sm text-gray-600">
                In-house labs test every batch for quality, safety, and nutritional content
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">🌡️</div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Temperature Control</h3>
              <p className="text-sm text-gray-600">
                Strict temperature monitoring throughout the entire processing chain
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">✅</div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quality Assurance</h3>
              <p className="text-sm text-gray-600">
                Multi-point quality checks at every stage of processing
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">🧹</div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Hygiene Standards</h3>
              <p className="text-sm text-gray-600">
                Highest hygiene standards with regular sanitization protocols
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">⚙️</div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Modern Equipment</h3>
              <p className="text-sm text-gray-600">
                Latest processing technology for efficiency and quality
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">📋</div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Full Traceability</h3>
              <p className="text-sm text-gray-600">
                Complete tracking from raw material to finished product
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Experience Quality Processing</h2>
            <p className="text-xl text-green-100 mb-8">
              Our commitment to quality processing ensures you receive the best products every time.
            </p>
            <Link
              href="/sustainability"
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors inline-block"
            >
              Learn About Our Sustainability
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
