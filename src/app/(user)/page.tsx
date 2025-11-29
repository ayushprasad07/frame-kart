'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Star, ArrowRight, Sparkles, Zap, TrendingUp } from 'lucide-react';
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

// Helper functions
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
    const res = await fetch(`${baseUrl}/api/products?limit=8&sortBy=featured`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch {
    return [];
  }
}

async function getBestSellingProducts(): Promise<Product[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const res = await fetch(`${baseUrl}/api/products?limit=8&sortBy=bestselling`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch {
    return [];
  }
}

async function getNewArrivals(): Promise<Product[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const res = await fetch(`${baseUrl}/api/products?limit=8&sortBy=newest`, {
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
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [featured, bestSelling, newArr, cats] = await Promise.all([
          getFeaturedProducts(),
          getBestSellingProducts(),
          getNewArrivals(),
          getCategories()
        ]);
        
        setFeaturedProducts(featured);
        setBestSellingProducts(bestSelling);
        setNewArrivals(newArr);
        setCategories(cats);
        
        const initIndexes: { [key: string]: number } = {};
        [...featured, ...bestSelling, ...newArr].forEach((p) => {
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
      const allProducts = [...featuredProducts, ...bestSellingProducts, ...newArrivals];
      const product = allProducts.find((p) => p._id === productId);
      const images = product?.images || [];
      const currentIndex = prev[productId] || 0;
      const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
      return { ...prev, [productId]: newIndex };
    });
  };

  const nextImage = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndexes((prev) => {
      const allProducts = [...featuredProducts, ...bestSellingProducts, ...newArrivals];
      const product = allProducts.find((p) => p._id === productId);
      const images = product?.images || [];
      const currentIndex = prev[productId] || 0;
      const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
      return { ...prev, [productId]: newIndex };
    });
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const currentIndex = currentImageIndexes[product._id] ?? 0;
    const totalImages = product.images?.length || 0;
    const imageSrc = getDisplayedImage(product, currentIndex);
    const hasOffer = hasValidOffer(product);

    return (
      <div
        onClick={() => handleProductClick(product._id)}
        className="group cursor-pointer flex flex-col rounded-2xl border border-emerald-200 bg-white p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-emerald-300 hover:scale-105"
      >
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-gray-100">
          <img
            src={imageSrc}
            alt={`${product.title} image ${currentIndex + 1}`}
            loading="lazy"
            className="object-cover w-full h-full rounded-xl group-hover:scale-110 transition-transform duration-500"
          />
          
          {totalImages > 1 && (
            <>
              <button
                onClick={(e) => prevImage(product._id, e)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 rounded-full p-1.5 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={(e) => nextImage(product._id, e)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 rounded-full p-1.5 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
          
          {hasOffer && (
            <div className="absolute top-2 right-2 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              SALE
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 space-y-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight">
            {product.title}
          </h3>
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-emerald-600">
                ₹{hasOffer ? product.offerPrice!.toLocaleString() : product.basePrice.toLocaleString()}
              </span>
              {hasOffer && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{product.basePrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SectionHeader = ({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: any }) => (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="p-2 bg-emerald-100 rounded-xl">
          <Icon className="w-6 h-6 text-emerald-600" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
      </div>
      <p className="text-gray-600 text-lg max-w-2xl mx-auto">{subtitle}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <main>
        {/* Hero Banner Section */}
        <section className="relative bg-gradient-to-br from-emerald-50 via-white to-gray-100 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-200/20 via-transparent to-transparent" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-6 py-3 rounded-full text-sm font-medium mb-4 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                  Premium Quality Frames & Artwork
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-gray-900 via-emerald-800 to-emerald-600 bg-clip-text text-transparent">
                    Frame Your
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 bg-clip-text text-transparent">
                    Perfect Moments
                  </span>
                </h1>
              </div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Transform your space with our curated collection of premium frames and artwork. 
                Each piece tells a story, every frame preserves a memory.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Link
                  href="/products"
                  className="group relative px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center gap-2">
                    Explore Collection
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link
                  href="/products?sort=featured"
                  className="group px-8 py-4 bg-white border-2 border-gray-900 text-gray-900 rounded-xl font-bold hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
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

        {/* Featured Products */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title="Featured Collection"
              subtitle="Handpicked masterpieces that redefine elegance and style"
              icon={Sparkles}
            />
            
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-200 rounded-xl aspect-[4/3] mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No featured products available.</p>
              </div>
            )}
          </div>
        </section>

        {/* Category Banner 1 - Wooden Frames */}
        <section className="py-16 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Premium Wooden Frames
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Classic elegance meets modern craftsmanship. Discover our exclusive collection of handcrafted wooden frames.
              </p>
              <Link
                href="/products?category=wooden"
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors"
              >
                Explore Wooden Frames
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Best Selling Products */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title="Best Sellers"
              subtitle="Most loved by our customers - proven quality and style"
              icon={TrendingUp}
            />
            
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-200 rounded-xl aspect-[4/3] mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : bestSellingProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {bestSellingProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No best selling products available.</p>
              </div>
            )}
          </div>
        </section>

        {/* Category Banner 2 - Metal Frames */}
        <section className="py-16 bg-gradient-to-r from-gray-50 to-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Modern Metal Frames
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Sleek, contemporary designs for the modern space. Explore our metal frame collection.
              </p>
              <Link
                href="/products?category=metal"
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors"
              >
                Explore Metal Frames
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title="New Arrivals"
              subtitle="Fresh additions to our collection - be the first to explore"
              icon={Zap}
            />
            
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-200 rounded-xl aspect-[4/3] mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : newArrivals.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {newArrivals.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No new arrivals available.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}