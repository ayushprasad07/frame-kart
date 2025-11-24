'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Category {
  name: string;
  count: number;
  image?: string;
}

interface Product {
  _id: string;
  title: string;
  basePrice: number;
  offerPrice?: number;
  category: string;
  images: string[];
  featuredImage?: string;
  description?: string;
}

// Helper functions moved outside component
function getDisplayedImage(product: Product, idx: number): string {
  if (product.images && product.images.length > idx) {
    const img = product.images[idx];
    return img.startsWith('http') || img.startsWith('/')
      ? img
      : `/uploads/products/${img}`;
  }
  if (product.featuredImage) {
    return product.featuredImage.startsWith('http') || product.featuredImage.startsWith('/')
      ? product.featuredImage
      : `/uploads/products/${product.featuredImage}`;
  }
  return '/placeholder-image.png';
}

function hasValidOffer(product: Product): boolean {
  return !!product.offerPrice && product.offerPrice < product.basePrice;
}

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const res = await fetch(`${baseUrl}/api/products?limit=12&sortBy=featured`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch {
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const res = await fetch(`${baseUrl}/api/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.categories || [];
  } catch {
    return [];
  }
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  // Track current image index per product for carousel
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    getFeaturedProducts().then((prods) => {
      setProducts(prods);
      const initIndexes: { [key: string]: number } = {};
      prods.forEach((p) => {
        initIndexes[p._id] = 0;
      });
      setCurrentImageIndexes(initIndexes);
    });
    getCategories().then(setCategories);
  }, []);

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const prevImage = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndexes((prev) => {
      const product = products.find((p) => p._id === productId);
      const images = product?.images || [];
      const currentIndex = prev[productId] || 0;
      const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
      return { ...prev, [productId]: newIndex };
    });
  };

  const nextImage = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndexes((prev) => {
      const product = products.find((p) => p._id === productId);
      const images = product?.images || [];
      const currentIndex = prev[productId] || 0;
      const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
      return { ...prev, [productId]: newIndex };
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <main>
        {/* Hero Section */}
        <section className="relative bg-white text-gray-900 overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="text-center space-y-8 max-w-3xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                Frame Your{' '}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                  Precious Moments
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-700">
                Discover handcrafted frames and curated artwork that transform your space into a gallery
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/products"
                  className="px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Shop Collection
                </Link>
                <Link
                  href="/products?sort=featured"
                  className="px-8 py-4 bg-transparent border-2 border-blue-600 text-blue-600 rounded-full font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300"
                >
                  View Featured
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Category Scroll */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Shop by Category</h2>
            {categories.length === 0 ? (
              <p className="text-gray-500">No categories to display.</p>
            ) : (
              <div
                className="flex space-x-6 overflow-x-auto scrollbar-hide py-2"
                style={{ scrollSnapType: 'x mandatory' }}
              >
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    href={`/products?category=${encodeURIComponent(category.name)}`}
                    className="flex-shrink-0 min-w-[8rem] cursor-pointer rounded-2xl border border-gray-200 bg-white py-3 px-5 text-center text-gray-900 font-semibold text-lg hover:bg-blue-50 hover:border-blue-400 transition-colors duration-300 shadow-sm scroll-snap-align-start"
                  >
                    {category.name}
                    <div className="text-sm text-gray-500 mt-1">
                      {category.count} product{category.count !== 1 ? 's' : ''}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {products.map((product) => {
                  const currentIndex = currentImageIndexes[product._id] ?? 0;
                  const totalImages = product.images?.length || 0;
                  const imageSrc = getDisplayedImage(product, currentIndex);

                  return (
                    <div
                      key={product._id}
                      onClick={() => handleProductClick(product._id)}
                      className="cursor-pointer flex flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-lg transition-shadow hover:shadow-2xl"
                    >
                      {/* Image with carousel */}
                      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden flex-shrink-0 mb-4">
                        <img
                          src={imageSrc}
                          alt={`${product.title} image ${currentIndex + 1}`}
                          loading="lazy"
                          className="object-cover w-full h-full rounded-lg"
                        />
                        {totalImages > 1 && (
                          <>
                            <button
                              onClick={(e) => prevImage(product._id, e)}
                              aria-label="Previous Image"
                              className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black bg-opacity-40 hover:bg-opacity-60 text-white p-1 transition"
                            >
                              <ChevronLeft size={18} />
                            </button>
                            <button
                              onClick={(e) => nextImage(product._id, e)}
                              aria-label="Next Image"
                              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black bg-opacity-40 hover:bg-opacity-60 text-white p-1 transition"
                            >
                              <ChevronRight size={18} />
                            </button>
                            {/* Image counter */}
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                              {currentIndex + 1} / {totalImages}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex flex-col flex-1">
                        <h3
                          className="text-lg font-semibold text-gray-900 truncate mb-2"
                          title={product.title}
                        >
                          {product.title}
                        </h3>
                        <p
                          className="text-gray-600 mb-2 line-clamp-2 text-sm flex-1"
                          title={product.description}
                        >
                          {product.description || 'No description available.'}
                        </p>
                        <p
                          className="text-sm text-gray-600 truncate mb-3"
                          title={product.category}
                        >
                          Category: {product.category}
                        </p>
                        <div className="flex items-center gap-4 mt-auto">
                          <span className="text-sm text-gray-500 line-through">
                            ₹{product.basePrice.toLocaleString()}
                          </span>
                          {hasValidOffer(product) && product.offerPrice && (
                            <span className="text-xl text-gray-900  font-bold ">
                              ₹{product.offerPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-16">No featured products available.</p>
            )}

            {/* Mobile "View All" */}
            <div className="mt-12 text-center md:hidden">
              <Link
                href="/products"
                className="inline-flex items-center px-8 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-colors duration-300"
              >
                View All Products <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}