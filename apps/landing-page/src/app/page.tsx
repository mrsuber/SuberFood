export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-green-50 to-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-gray-900 mb-6">
              From Our Farm to Your Table
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Experience complete transparency in your food journey. Fresh, sustainable, and traceable from field to fork.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
                Explore Our Farms
              </button>
              <button className="bg-white hover:bg-gray-50 text-primary-600 font-semibold py-3 px-8 rounded-lg border-2 border-primary-500 transition-colors">
                Find a Restaurant
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Journey Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-center text-gray-900 mb-12">
            Our Farm-to-Table Journey
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Farming */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌾</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Farming</h3>
              <p className="text-gray-600">
                Sustainable farming practices across crops, livestock, aquaculture, and poultry
              </p>
            </div>

            {/* Processing */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏭</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing</h3>
              <p className="text-gray-600">
                State-of-the-art facilities transforming fresh produce into quality products
              </p>
            </div>

            {/* Distribution */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Distribution</h3>
              <p className="text-gray-600">
                Temperature-controlled logistics ensuring freshness from field to your plate
              </p>
            </div>

            {/* Dining */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🍽️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Dining</h3>
              <p className="text-gray-600">
                Premium restaurants and online stores bringing our food to your table
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-center text-gray-900 mb-12">
            What We Offer
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Fresh Products */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Fresh Products</h3>
              <p className="text-gray-600 mb-4">
                Farm-fresh vegetables, fruits, dairy, meat, and seafood delivered straight to your door or available at our partner supermarkets.
              </p>
              <a href="#" className="text-primary-600 font-semibold hover:text-primary-700">
                Shop Now →
              </a>
            </div>

            {/* Processed Foods */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Processed Foods</h3>
              <p className="text-gray-600 mb-4">
                Quality-assured packaged foods from our processing facilities. From dairy products to canned goods and more.
              </p>
              <a href="#" className="text-primary-600 font-semibold hover:text-primary-700">
                Browse Products →
              </a>
            </div>

            {/* Restaurants */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Restaurants</h3>
              <p className="text-gray-600 mb-4">
                Experience our farm-fresh ingredients at our classical fine dining restaurants or quick-service cafeterias.
              </p>
              <a href="#" className="text-primary-600 font-semibold hover:text-primary-700">
                Find Location →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-50">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-6">
              Committed to Sustainability
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              We believe in responsible farming, ethical treatment of animals, and minimizing our environmental footprint.
              Every product you purchase supports sustainable agriculture and local communities.
            </p>
            <button className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
              Learn About Our Practices
            </button>
          </div>
        </div>
      </section>

      {/* Traceability Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-6">
                Complete Traceability
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Scan any product QR code to see its complete journey - from the specific farm plot where it was grown,
                through our processing facilities, to your table.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Know exactly where your food comes from, how it was grown, and who handled it along the way.
              </p>
              <button className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
                Try Product Tracker
              </button>
            </div>
            <div className="flex-1 bg-gray-100 rounded-xl h-96 flex items-center justify-center">
              <p className="text-gray-500 text-lg">
                [Product Traceability Visualization]
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-6">
            Ready to Experience Real Food?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of families enjoying fresh, traceable, sustainable food.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white hover:bg-gray-100 text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors">
              Start Shopping
            </button>
            <button className="bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
              For Business Partners
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">SuberFood</h3>
              <p className="text-sm">
                Complete farm-to-table transparency. Fresh, sustainable, traceable.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Fresh Produce</a></li>
                <li><a href="#" className="hover:text-white">Dairy Products</a></li>
                <li><a href="#" className="hover:text-white">Meat & Seafood</a></li>
                <li><a href="#" className="hover:text-white">Processed Foods</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Our Farms</a></li>
                <li><a href="#" className="hover:text-white">Sustainability</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">FAQs</a></li>
                <li><a href="#" className="hover:text-white">For Partners</a></li>
                <li><a href="#" className="hover:text-white">Track Order</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            <p>&copy; 2025 SuberFood. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
