'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Star, Shield, Truck, Clock, ArrowRight, Instagram, Facebook, Twitter, Mail } from 'lucide-react';
import Footer from '@/components/Footer';

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
  isFeatured?: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Track current image index per product for carousel
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [prods, cats] = await Promise.all([
          getFeaturedProducts(),
          getCategories()
        ]);
        
        setProducts(prods);
        setCategories(cats);
        
        const initIndexes: { [key: string]: number } = {};
        prods.forEach((p) => {
          initIndexes[p._id] = 0;
        });
        setCurrentImageIndexes(initIndexes);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
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
        {/* Enhanced Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Star className="w-4 h-4" />
                  Premium Quality Frames & Artwork
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Frame Your
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    World Beautifully
                  </span>
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Transform your space with our curated collection of premium frames and artwork. 
                Each piece tells a story, every frame preserves a memory.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Link
                  href="/products"
                  className="group relative px-8 py-4 bg-slate-900 text-white rounded-2xl font-semibold hover:bg-slate-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center gap-2">
                    Explore Collection
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link
                  href="/products?sort=featured"
                  className="group px-8 py-4 bg-white border-2 border-slate-900 text-slate-900 rounded-2xl font-semibold hover:bg-slate-900 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center gap-2">
                    Featured Pieces
                    <Star className="w-4 h-4" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 gap-6 sm:gap-2">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Free Shipping</h3>
                <p className="text-slate-600">Free delivery on orders over ₹1999</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Quality Guarantee</h3>
                <p className="text-slate-600">30-day money back guarantee</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Fast Support</h3>
                <p className="text-slate-600">24/7 customer support</p>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Category Scroll */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Shop by Category</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Discover our carefully curated categories, each designed to bring unique character to your space
              </p>
            </div>
            
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 text-lg">No categories available at the moment.</p>
              </div>
            ) : (
              <div className="relative">
                <div className="flex space-x-6 overflow-x-auto scrollbar-hide py-4 px-2 -mx-2">
                  {categories.map((category, index) => (
                    <Link
                      key={category.name}
                      href={`/products?category=${encodeURIComponent(category.name)}`}
                      className="group flex-shrink-0 w-64 cursor-pointer rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="space-y-3">
                        <h3 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-slate-500">
                          {category.count} unique item{category.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Enhanced Featured Products */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16">
              <div className="text-center lg:text-left mb-8 lg:mb-0">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                  Featured Collection
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl">
                  Handpicked masterpieces that redefine elegance and style
                </p>
              </div>
              <Link
                href="/products"
                className="group inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-slate-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                View All Products
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-slate-200 rounded-2xl aspect-[4/3] mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => {
                  const currentIndex = currentImageIndexes[product._id] ?? 0;
                  const totalImages = product.images?.length || 0;
                  const imageSrc = getDisplayedImage(product, currentIndex);

                  return (
                    <div
                      key={product._id}
                      onClick={() => handleProductClick(product._id)}
                      className="group cursor-pointer flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-slate-300"
                    >
                      {/* Image with enhanced carousel */}
                      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden flex-shrink-0 mb-6">
                        <img
                          src={imageSrc}
                          alt={`${product.title} image ${currentIndex + 1}`}
                          loading="lazy"
                          className="object-cover w-full h-full rounded-2xl group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-2xl" />
                        
                        {totalImages > 1 && (
                          <>
                            <button
                              onClick={(e) => prevImage(product._id, e)}
                              aria-label="Previous Image"
                              className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white text-slate-900 p-2 transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg"
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <button
                              onClick={(e) => nextImage(product._id, e)}
                              aria-label="Next Image"
                              className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white text-slate-900 p-2 transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg"
                            >
                              <ChevronRight size={20} />
                            </button>
                            {/* Enhanced image counter */}
                            <div className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                              {currentIndex + 1} / {totalImages}
                            </div>
                          </>
                        )}
                        
                        {/* Featured badge */}
                        {product.isFeatured && (
                          <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                            Featured
                          </div>
                        )}
                      </div>

                      {/* Enhanced Product Info */}
                      <div className="flex flex-col flex-1 space-y-4">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                            {product.title}
                          </h3>
                          <p className="text-slate-600 line-clamp-2 text-sm leading-relaxed">
                            {product.description || 'Beautiful piece to enhance your space.'}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-500 line-through">
                              ₹{product.basePrice.toLocaleString()}
                            </span>
                            {hasValidOffer(product) && product.offerPrice && (
                              <span className="text-2xl font-bold text-slate-900">
                                ₹{product.offerPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                            {product.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Star className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">No Featured Products</h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  Our featured collection is being curated. Check back soon for amazing pieces!
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-slate-800 transition-colors"
                >
                  Browse All Products
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer/>
    </div>
  );
}