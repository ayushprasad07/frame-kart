// import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

async function getFeaturedProducts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/products?limit=12&sortBy=featured`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function Home() {
  const products = await getFeaturedProducts();

  const categories = [
    { 
      name: 'Frames', 
      slug: 'frames', 
      description: 'Beautiful picture frames for your memories',
      icon: '🖼️'
    },
    { 
      name: 'Artwork', 
      slug: 'artwork', 
      description: 'Curated art pieces and prints',
      icon: '🎨'
    },
    { 
      name: 'Accessories', 
      slug: 'accessories', 
      description: 'Complete your decor with accessories',
      icon: '✨'
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* <Header /> */}
      <main>
        {/* Hero Section with Subtle Animations */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
          {/* Animated Background Blobs */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob [animation-delay:2s]"></div>
            <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob [animation-delay:4s]"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="text-center space-y-8">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight opacity-0 animate-fade-in-up">
                Frame Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                  Precious Moments
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto opacity-0 animate-fade-in-up-delay-1">
                Discover handcrafted frames and curated artwork that transform your space into a gallery
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0 animate-fade-in-up-delay-2">
                <Link 
                  href="/products"
                  className="px-8 py-4 bg-white text-slate-900 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Shop Collection
                </Link>
                <Link 
                  href="/products?sortBy=featured"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-slate-900 transition-all duration-300"
                >
                  View Featured
                </Link>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </section>

        {/* Category Cards - Clean & Modern */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Shop by Category
              </h2>
              <p className="text-gray-600 text-lg">Find exactly what you're looking for</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/products?category=${category.slug}`}
                  className="group relative bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="text-5xl mb-4">{category.icon}</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                      {category.name}
                    </h3>
                    <p className="text-gray-600">{category.description}</p>
                    <div className="mt-4 flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                      Explore <span className="ml-2">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products - Modern Grid Layout */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Featured Products
                </h2>
                <p className="text-gray-600 text-lg">Handpicked favorites for you</p>
              </div>
              <Link 
                href="/products"
                className="hidden md:flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-300 group"
              >
                View All <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
            </div>
            
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {products.map((product: any) => (
                    <ProductCard
                      key={product._id}
                      id={product._id}
                      title={product.title}
                      price={product.basePrice}
                      image={product.images?.[0]}
                      category={product.category}
                    />
                  ))}
                </div>
                
                {/* View All Button for Mobile */}
                <div className="mt-12 text-center md:hidden">
                  <Link 
                    href="/products"
                    className="inline-flex items-center px-8 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-colors duration-300"
                  >
                    View All Products <span className="ml-2">→</span>
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <p className="text-gray-500 text-lg font-medium">No products available yet.</p>
                <p className="text-gray-400 mt-2">Check back soon for amazing frames and artwork!</p>
              </div>
            )}
          </div>
        </section>

        {/* Trust Badges Section */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Changed grid-cols-1 sm:grid-cols-2 to grid-cols-2, and added lg:grid-cols-4 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {/* Free Shipping Card */}
              <div className="group relative bg-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                <div className="relative text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    🚚
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-base sm:text-lg group-hover:text-blue-600 transition-colors duration-300">
                    Free Shipping
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    On orders over ₹999
                  </p>
                </div>
              </div>

              {/* Secure Payment Card */}
              <div className="group relative bg-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                <div className="relative text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-green-100 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    🔒
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-base sm:text-lg group-hover:text-green-600 transition-colors duration-300">
                    Secure Payment
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    100% secure transactions
                  </p>
                </div>
              </div>

              {/* Easy Returns Card */}
              <div className="group relative bg-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                <div className="relative text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-purple-100 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    ↩️
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-base sm:text-lg group-hover:text-purple-600 transition-colors duration-300">
                    Easy Returns
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    30-day return policy
                  </p>
                </div>
              </div>

              {/* 24/7 Support Card */}
              <div className="group relative bg-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-orange-200 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                <div className="relative text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-orange-100 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    💬
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-base sm:text-lg group-hover:text-orange-600 transition-colors duration-300">
                    24/7 Support
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Dedicated customer care
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* Footer */}
        <footer className="bg-slate-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div className="md:col-span-2">
                <h3 className="text-2xl font-bold mb-4">FrameKart</h3>
                <p className="text-gray-400 mb-6 max-w-md">
                  Your trusted destination for premium frames and artwork. We help you preserve and display your most cherished memories beautifully.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors duration-300">
                    <span className="sr-only">Facebook</span>
                    📘
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors duration-300">
                    <span className="sr-only">Instagram</span>
                    📷
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors duration-300">
                    <span className="sr-only">Twitter</span>
                    🐦
                  </a>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-3 text-gray-400">
                  <li><Link href="/products" className="hover:text-white transition-colors duration-300">All Products</Link></li>
                  <li><Link href="/products?category=frames" className="hover:text-white transition-colors duration-300">Frames</Link></li>
                  <li><Link href="/products?category=artwork" className="hover:text-white transition-colors duration-300">Artwork</Link></li>
                  <li><Link href="/cart" className="hover:text-white transition-colors duration-300">Cart</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Support</h4>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors duration-300">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors duration-300">Shipping Info</a></li>
                  <li><a href="#" className="hover:text-white transition-colors duration-300">Returns</a></li>
                  <li><a href="#" className="hover:text-white transition-colors duration-300">FAQs</a></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-gray-800">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <p className="text-gray-400 text-sm">
                  © 2024 FrameKart. All rights reserved.
                </p>
                <div className="flex space-x-6 text-sm text-gray-400">
                  <a href="#" className="hover:text-white transition-colors duration-300">Privacy Policy</a>
                  <a href="#" className="hover:text-white transition-colors duration-300">Terms of Service</a>
                  <a href="#" className="hover:text-white transition-colors duration-300">Cookie Policy</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
