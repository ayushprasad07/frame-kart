'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, ChevronRight, Star, ArrowRight, Sparkles, Zap, TrendingUp,
  Truck, Shield, RefreshCw, Heart, ShoppingCart, Award, Play
} from 'lucide-react';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import Navbar from '@/context/Navbar';

// Interfaces
interface Category {
  _id: string;
  name: string;
  count: number;
  image: string;
  slug: string;
  description: string;
}

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  isActive: boolean;
  order: number;
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
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  sizes?: string[];
  styles?: string[];
  material?: string;
}

// Static categories matching navbar - NO API CALL
const staticCategories: Category[] = [
  { 
    _id: '1', 
    name: 'Wooden Frames', 
    count: 45, 
    slug: 'wooden', 
    description: 'Classic wooden frames with natural elegance',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&h=600&fit=crop&q=80'
  },
  { 
    _id: '2', 
    name: 'Metal Frames', 
    count: 32, 
    slug: 'metal', 
    description: 'Modern metal frames for contemporary spaces',
    image: 'https://images.unsplash.com/photo-1582053433976-25c00369fc93?w=600&h=600&fit=crop&q=80'
  },
  { 
    _id: '3', 
    name: 'Canvas Frames', 
    count: 28, 
    slug: 'canvas', 
    description: 'Canvas art frames for gallery-style display',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=600&fit=crop&q=80'
  },
  { 
    _id: '4', 
    name: 'Vintage Frames', 
    count: 24, 
    slug: 'vintage', 
    description: 'Antique style frames with timeless charm',
    image: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=600&h=600&fit=crop&q=80'
  },
  { 
    _id: '5', 
    name: 'Modern Frames', 
    count: 38, 
    slug: 'modern', 
    description: 'Contemporary designs for modern interiors',
    image: 'https://images.unsplash.com/photo-1594369789489-d6f63bd7fa1d?w=600&h=600&fit=crop&q=80'
  },
  { 
    _id: '6', 
    name: 'Custom Frames', 
    count: 50, 
    slug: 'custom', 
    description: 'Personalized frames made just for you',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=600&fit=crop&q=80'
  },
];

// IMAGES — Robust Helper
function getDisplayedImage(product: Product, idx: number): string {
  // Prefer featured image if present and valid
  let img = product.featuredImage;
  if (img && typeof img === 'string' && img.trim().length > 0) {
    if (img.startsWith('http') || img.startsWith('/')) {
      return img;
    } else {
      return `/uploads/products/${img}`;
    }
  }
  // Otherwise, look for first valid image in array
  if (Array.isArray(product.images) && product.images.length > 0) {
    let selectedImg = product.images[idx] || product.images[0];
    if (selectedImg && typeof selectedImg === 'string' && selectedImg.trim().length > 0) {
      if (selectedImg.startsWith('http') || selectedImg.startsWith('/')) {
        return selectedImg;
      } else {
        return `/uploads/products/${selectedImg}`;
      }
    }
    // If index image fails, try all images
    for (const im of product.images) {
      if (im && typeof im === 'string' && im.trim().length > 0) {
        return im.startsWith('http') || im.startsWith('/') ? im : `/uploads/products/${im}`;
      }
    }
  }
  // Final fallback: return placeholder
  return '/placeholder-image.png';
}

function hasValidOffer(product: Product): boolean {
  return !!product.offerPrice && product.offerPrice < product.basePrice;
}

// API Functions
async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const res = await fetch(`${baseUrl}/api/products?limit=8&sortBy=featured`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch { return []; }
}

async function getBestSellingProducts(): Promise<Product[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const res = await fetch(`${baseUrl}/api/products?limit=8&sortBy=bestselling`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch { return []; }
}

async function getNewArrivals(): Promise<Product[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const res = await fetch(`${baseUrl}/api/products?limit=8&sortBy=newest`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch { return []; }
}

async function getBanners(): Promise<Banner[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const res = await fetch(`${baseUrl}/api/banners?active=true`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.banners || [];
  } catch { return []; }
}

// HERO BANNER CAROUSEL
const HeroBanner = ({ banners }: { banners: Banner[] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const defaultBanners: Banner[] = [
    {
      _id: '1',
      title: 'Frame Your Perfect Moments',
      subtitle: 'Premium quality frames for every memory',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=1920&h=900&fit=crop&q=80',
      link: '/products',
      isActive: true,
      order: 1
    },
    {
      _id: '2',
      title: '20% Off Custom Frames',
      subtitle: 'Use code FRAME20 at checkout',
      image: 'https://images.unsplash.com/photo-1582053433976-25c00369fc93?w=1920&h=900&fit=crop&q=80',
      link: '/products?discount=true',
      isActive: true,
      order: 2
    },
    {
      _id: '3',
      title: 'New Arrivals Collection',
      subtitle: 'Explore the latest frame designs',
      image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1920&h=900&fit=crop&q=80',
      link: '/products?sortBy=newest',
      isActive: true,
      order: 3
    }
  ];

  const activeBanners = banners.length > 0 ? banners : defaultBanners;

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, activeBanners.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="relative h-[45vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden">
      {activeBanners.map((banner, index) => (
        <div
          key={banner._id}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        >
          <div className="absolute inset-0">
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          </div>

          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <div className={`max-w-2xl space-y-4 transition-all duration-700 delay-200 ${
              index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-white/20">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                Premium Quality Frames
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight">
                {banner.title}
              </h1>
              {banner.subtitle && (
                <p className="text-base sm:text-lg text-white/80">{banner.subtitle}</p>
              )}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href={banner.link || '/products'}
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  Shop Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold border border-white/30 transition-all text-sm sm:text-base"
                >
                  <Play className="w-4 h-4" />
                  Explore All
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation */}
      <button
        onClick={() => goToSlide((currentSlide - 1 + activeBanners.length) % activeBanners.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full transition-all border border-white/20"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => goToSlide((currentSlide + 1) % activeBanners.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full transition-all border border-white/20"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {activeBanners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 ${
              index === currentSlide
                ? 'w-8 h-2.5 bg-white rounded-full'
                : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80 rounded-full'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

// WHY CHOOSE US
const WhyChooseUs = () => (
  <section className="py-8 md:py-10 relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { icon: Truck, title: 'Free Shipping', desc: 'Orders above ₹999', color: 'from-emerald-400 to-teal-500' },
          { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy', color: 'from-blue-400 to-indigo-500' },
          { icon: Shield, title: 'Secure Payment', desc: 'COD & Prepaid', color: 'from-purple-400 to-pink-500' },
          { icon: Award, title: 'Quality Guarantee', desc: 'Premium materials', color: 'from-amber-400 to-orange-500' }
        ].map((item, index) => (
          <div
            key={index}
            className="group relative bg-white rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className={`p-2 md:p-3 bg-gradient-to-br ${item.color} rounded-lg md:rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300`}>
                <item.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-xs md:text-sm">{item.title}</h3>
                <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// CATEGORY GRID
const CategoryGrid = () => (
  <section className="py-10 md:py-12 relative overflow-hidden" id="categories">
    <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/20 to-white" />
    
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8 md:mb-10">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium mb-3">
          <Sparkles className="w-3 h-3" />
          Explore Collections
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2">
          Shop By <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Category</span>
        </h2>
        <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto">
          Find the perfect frame style for your space
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {staticCategories.map((category) => (
          <Link
            key={category._id}
            href={`/products?category=${category.slug}`}
            className="group relative overflow-hidden rounded-xl md:rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-400 hover:-translate-y-2"
          >
            <div className="aspect-[4/3] relative overflow-hidden">
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
              
              <div className="absolute inset-0 flex flex-col justify-end p-3 md:p-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-2.5 md:p-3 border border-white/20">
                  <h3 className="font-bold text-white text-sm md:text-base mb-0.5">{category.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/80">{category.count}+ items</p>
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-300">
                      <ArrowRight className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="text-center mt-6 md:mt-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-lg text-sm"
        >
          View All Products
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  </section>
);

// PRODUCT CARD
const ProductCard = ({ 
  product, 
  currentIndex, 
  onPrevImage, 
  onNextImage,
  onAddToCart
}: { 
  product: Product; 
  currentIndex: number;
  onPrevImage: (id: string, e: React.MouseEvent) => void;
  onNextImage: (id: string, e: React.MouseEvent) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
}) => {
  const router = useRouter();
  const totalImages = product.images?.length || 0;
  const imageSrc = getDisplayedImage(product, currentIndex);
  const hasOffer = hasValidOffer(product);

  return (
    <div
      onClick={() => router.push(`/products/${product._id}`)}
      className="group cursor-pointer flex flex-col rounded-xl md:rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-400 hover:-translate-y-1"
    >
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={imageSrc}
          alt={product.title}
          loading="lazy"
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          onError={(e) => (e.currentTarget.src = '/placeholder-image.png')}
        />
        {totalImages > 1 && (
          <>
            <button
              onClick={(e) => onPrevImage(product._id, e)}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 rounded-full p-1 transition-all opacity-0 group-hover:opacity-100 shadow-md"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={(e) => onNextImage(product._id, e)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 rounded-full p-1 transition-all opacity-0 group-hover:opacity-100 shadow-md"
            >
              <ChevronRight size={14} />
            </button>
          </>
        )}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
          {hasOffer && (
            <span className="px-1.5 py-0.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[9px] md:text-[10px] font-bold rounded-full shadow">
              {Math.round((1 - product.offerPrice! / product.basePrice) * 100)}% OFF
            </span>
          )}
          {product.isFeatured && (
            <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] md:text-[10px] font-bold rounded-full shadow flex items-center gap-0.5">
              <Sparkles className="w-2 h-2" /> Featured
            </span>
          )}
        </div>
        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute top-1.5 right-1.5 p-1.5 bg-white/90 rounded-full shadow opacity-0 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-500 transition-all"
        >
          <Heart className="w-3 h-3" />
        </button>
      </div>
      <div className="flex flex-col flex-1 p-2.5 md:p-3 space-y-1.5">
        {product.rating && (
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-2.5 h-2.5 ${
                  i < Math.floor(product.rating!) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                }`}
              />
            ))}
            {product.reviewCount && (
              <span className="text-[9px] text-gray-500 ml-0.5">({product.reviewCount})</span>
            )}
          </div>
        )}
        <h3 className="font-medium text-gray-900 line-clamp-2 text-[11px] md:text-xs leading-snug group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>
        <div className="flex items-end justify-between mt-auto pt-1">
          <div className="flex flex-col">
            <span className="text-sm md:text-base font-bold text-gray-900">
              ₹{hasOffer ? product.offerPrice!.toLocaleString() : product.basePrice.toLocaleString()}
            </span>
            {hasOffer && (
              <span className="text-[10px] text-gray-400 line-through">
                ₹{product.basePrice.toLocaleString()}
              </span>
            )}
          </div>
          <button
            onClick={(e) => onAddToCart(product, e)}
            className="p-1.5 md:p-2 bg-gray-900 hover:bg-blue-600 text-white rounded-lg transition-all duration-300 shadow hover:shadow-md"
          >
            <ShoppingCart className="w-3 h-3 md:w-3.5 md:h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductSection = ({
  title,
  subtitle,
  icon: Icon,
  gradient,
  products,
  isLoading,
  currentImageIndexes,
  onPrevImage,
  onNextImage,
  onAddToCart,
  viewAllLink,
  bgClass = 'bg-white'
}: {
  title: string;
  subtitle: string;
  icon: any;
  gradient: string;
  products: Product[];
  isLoading: boolean;
  currentImageIndexes: { [key: string]: number };
  onPrevImage: (id: string, e: React.MouseEvent) => void;
  onNextImage: (id: string, e: React.MouseEvent) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  viewAllLink: string;
  bgClass?: string;
}) => {
  const ProductSkeleton = () => (
    <div className="rounded-xl md:rounded-2xl bg-white border border-gray-100 overflow-hidden">
      <div className="bg-gray-200 aspect-[4/3] animate-pulse" />
      <div className="p-2.5 md:p-3 space-y-2">
        <div className="h-2.5 bg-gray-200 rounded-full w-16 animate-pulse" />
        <div className="h-2.5 bg-gray-200 rounded-full w-3/4 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded-full w-1/3 animate-pulse" />
      </div>
    </div>
  );

  return (
    <section className={`py-10 md:py-12 ${bgClass} relative overflow-hidden`}>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} shadow-md`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mb-1.5">{title}</h2>
          <p className="text-gray-600 text-xs md:text-sm max-w-lg mx-auto">{subtitle}</p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4">
            {[...Array(8)].map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                currentIndex={currentImageIndexes[product._id] || 0}
                onPrevImage={onPrevImage}
                onNextImage={onNextImage}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-xl">
            <Icon className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No products available.</p>
          </div>
        )}
        
        <div className="text-center mt-6">
          <Link
            href={viewAllLink}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold transition-all duration-300 text-sm"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: string]: number }>({});
  
  const { addToCart } = useCart();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [featured, bestSelling, newArr, bannerData] = await Promise.all([
          getFeaturedProducts(),
          getBestSellingProducts(),
          getNewArrivals(),
          getBanners()
        ]);
        
        setFeaturedProducts(featured);
        setBestSellingProducts(bestSelling);
        setNewArrivals(newArr);
        setBanners(bannerData);
        
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

  const prevImage = useCallback((productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndexes((prev) => {
      const allProducts = [...featuredProducts, ...bestSellingProducts, ...newArrivals];
      const product = allProducts.find((p) => p._id === productId);
      const images = product?.images || [];
      const currentIndex = prev[productId] || 0;
      const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
      return { ...prev, [productId]: newIndex };
    });
  }, [featuredProducts, bestSellingProducts, newArrivals]);

  const nextImage = useCallback((productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndexes((prev) => {
      const allProducts = [...featuredProducts, ...bestSellingProducts, ...newArrivals];
      const product = allProducts.find((p) => p._id === productId);
      const images = product?.images || [];
      const currentIndex = prev[productId] || 0;
      const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
      return { ...prev, [productId]: newIndex };
    });
  }, [featuredProducts, bestSellingProducts, newArrivals]);

  const handleAddToCart = useCallback((product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      productId: product._id,
      title: product.title,
      price: product.offerPrice || product.basePrice,
      image: getDisplayedImage(product, 0)
    });
  }, [addToCart]);

  return (
    <div className="min-h-screen bg-white pt-20 md:pt-28">
      <Navbar />
      <main className="mt-0">
        <HeroBanner banners={banners} />
        <WhyChooseUs />
        <CategoryGrid />
        <ProductSection
          title="Featured Collection"
          subtitle="Handpicked masterpieces that redefine elegance"
          icon={Sparkles}
          gradient="from-amber-500 to-orange-500"
          products={featuredProducts}
          isLoading={isLoading}
          currentImageIndexes={currentImageIndexes}
          onPrevImage={prevImage}
          onNextImage={nextImage}
          onAddToCart={handleAddToCart}
          viewAllLink="/products?featured=true"
        />
        <ProductSection
          title="Best Sellers"
          subtitle="Most loved by our customers"
          icon={TrendingUp}
          gradient="from-rose-500 to-pink-500"
          products={bestSellingProducts}
          isLoading={isLoading}
          currentImageIndexes={currentImageIndexes}
          onPrevImage={prevImage}
          onNextImage={nextImage}
          onAddToCart={handleAddToCart}
          viewAllLink="/products?sortBy=bestselling"
          bgClass="bg-gray-50/50"
        />
        <ProductSection
          title="New Arrivals"
          subtitle="Fresh additions to explore"
          icon={Zap}
          gradient="from-purple-500 to-indigo-500"
          products={newArrivals}
          isLoading={isLoading}
          currentImageIndexes={currentImageIndexes}
          onPrevImage={prevImage}
          onNextImage={nextImage}
          onAddToCart={handleAddToCart}
          viewAllLink="/products?sortBy=newest"
        />
      </main>
      <Footer />
    </div>
  );
}
