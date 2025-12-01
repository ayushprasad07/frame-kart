'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, ChevronRight, Filter, X, Search, SlidersHorizontal, 
  Heart, ShoppingCart, Star, Sparkles, Grid3X3, LayoutGrid, 
  ArrowUpDown, Package, Truck, Shield, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import Navbar from '@/context/Navbar';
import Footer from '@/components/Footer';

interface Product {
  _id: string;
  title: string;
  basePrice: number;
  offerPrice?: number;
  description: string;
  detailedDescription?: string;
  category: string;
  subCategory?: string;
  material?: string;
  isAvailable?: boolean;
  stockQuantity?: number;
  sku?: string;
  images: string[];
  featuredImage?: string;
  tags?: string[];
  weight?: number;
  deliveryEstimate?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  rating?: number;
  reviewCount?: number;
}

// Robust image helper
function getProductImage(product: Product, imageIndex: number = 0): string {
  // Check featuredImage first
  if (product.featuredImage && typeof product.featuredImage === 'string' && product.featuredImage.trim()) {
    const img = product.featuredImage;
    return img.startsWith('http') || img.startsWith('/') ? img : `/uploads/products/${img}`;
  }
  // Check images array
  if (Array.isArray(product.images) && product.images.length > 0) {
    const selectedImg = product.images[imageIndex] || product.images[0];
    if (selectedImg && typeof selectedImg === 'string' && selectedImg.trim()) {
      return selectedImg.startsWith('http') || selectedImg.startsWith('/') 
        ? selectedImg 
        : `/uploads/products/${selectedImg}`;
    }
    // Try to find any valid image
    for (const img of product.images) {
      if (img && typeof img === 'string' && img.trim()) {
        return img.startsWith('http') || img.startsWith('/') ? img : `/uploads/products/${img}`;
      }
    }
  }
  return '/placeholder-image.png';
}

function hasValidOffer(product: Product): boolean {
  return (
    product.offerPrice !== undefined &&
    product.offerPrice !== null &&
    product.basePrice !== undefined &&
    product.basePrice !== null &&
    product.offerPrice < product.basePrice
  );
}

function getDisplayPrice(product: Product): number {
  return hasValidOffer(product) ? product.offerPrice! : product.basePrice;
}

// Helper to get URL params without useSearchParams
function getSearchParams(): URLSearchParams {
  if (typeof window !== 'undefined') {
    return new URLSearchParams(window.location.search);
  }
  return new URLSearchParams();
}

export default function ProductsPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: string]: number }>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize filters from URL params without useSearchParams
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    setFilters({
      category: params.get('category') || 'all',
      search: params.get('search') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      sort: params.get('sort') || 'newest',
    });
    setInitialized(true);
  }, []);

  // Update URL when filters change
  useEffect(() => {
    if (!initialized) return;
    
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'all') params.set('category', filters.category);
    if (filters.search) params.set('search', filters.search);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.sort && filters.sort !== 'newest') params.set('sort', filters.sort);
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [filters, initialized]);

  useEffect(() => {
    if (!initialized) return;
    fetchProducts();
    fetchCategories();
  }, [filters, initialized]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.sort) params.append('sort', filters.sort);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();

      const normalizedProducts = (data.products || []).map((p: Product) => ({
        ...p,
        basePrice: typeof p.basePrice === 'string' ? Number(p.basePrice) : p.basePrice,
        offerPrice: p.offerPrice ? (typeof p.offerPrice === 'string' ? Number(p.offerPrice) : p.offerPrice) : undefined,
      }));

      setProducts(normalizedProducts);
      
      const initialIndexes: { [key: string]: number } = {};
      normalizedProducts.forEach((product: Product) => {
        initialIndexes[product._id] = 0;
      });
      setCurrentImageIndexes(initialIndexes);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      const uniqueCategories = [
        ...new Set(data.products?.map((p: Product) => p.category) || []),
      ];
      setCategories(uniqueCategories as string[]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const prevImage = useCallback((productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndexes((prev) => {
      const product = products.find((p) => p._id === productId);
      const images = product?.images || [];
      const currentIndex = prev[productId] || 0;
      const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
      return { ...prev, [productId]: newIndex };
    });
  }, [products]);

  const nextImage = useCallback((productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndexes((prev) => {
      const product = products.find((p) => p._id === productId);
      const images = product?.images || [];
      const currentIndex = prev[productId] || 0;
      const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
      return { ...prev, [productId]: newIndex };
    });
  }, [products]);

  const handleAddToCart = useCallback((product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      productId: product._id,
      title: product.title,
      price: getDisplayPrice(product),
      image: getProductImage(product, 0),
    });
  }, [addToCart]);

  const activeFilterCount = [
    filters.category !== 'all',
    filters.search,
    filters.minPrice,
    filters.maxPrice,
    filters.sort !== 'newest'
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilters({
      category: 'all',
      search: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
    });
  };

  // Product Card Component
  const ProductCard = ({ product }: { product: Product }) => {
    const currentImageIndex = currentImageIndexes[product._id] || 0;
    const totalImages = product.images?.length || 0;
    const hasActiveOffer = hasValidOffer(product);
    const displayPrice = getDisplayPrice(product);
    const discountPercent = hasActiveOffer 
      ? Math.round(((product.basePrice - product.offerPrice!) / product.basePrice) * 100)
      : 0;
    const isHovered = hoveredProduct === product._id;

    return (
      <div
        className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
        onMouseEnter={() => setHoveredProduct(product._id)}
        onMouseLeave={() => setHoveredProduct(null)}
        onClick={() => router.push(`/products/${product._id}`)}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <img
            src={getProductImage(product, currentImageIndex)}
            alt={product.title}
            loading="lazy"
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
            onError={(e) => (e.currentTarget.src = '/placeholder-image.png')}
          />
          
          {/* Gradient Overlay on Hover */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
          
          {/* Carousel Controls */}
          {totalImages > 1 && (
            <>
              <button
                onClick={(e) => prevImage(product._id, e)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 backdrop-blur-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={(e) => nextImage(product._id, e)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 backdrop-blur-sm"
              >
                <ChevronRight size={16} />
              </button>
              
              {/* Image Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                {product.images.slice(0, 5).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndexes(prev => ({ ...prev, [product._id]: idx }));
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentImageIndex === idx 
                        ? 'bg-white w-4' 
                        : 'bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* Badges Container */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {hasActiveOffer && (
              <span className="px-2.5 py-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                {discountPercent}% OFF
              </span>
            )}
            {product.isFeatured && (
              <span className="px-2.5 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Featured
              </span>
            )}
            {product.isBestSeller && (
              <span className="px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-full shadow-lg">
                Best Seller
              </span>
            )}
            {product.isNewArrival && (
              <span className="px-2.5 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-full shadow-lg">
                New
              </span>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-2.5 bg-white/95 hover:bg-rose-50 text-gray-600 hover:text-rose-500 rounded-full shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-sm"
            >
              <Heart className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => handleAddToCart(product, e)}
              className="p-2.5 bg-white/95 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-full shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-sm"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Add Button */}
          <div className={`absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button
              onClick={(e) => handleAddToCart(product, e)}
              className="w-full py-2.5 bg-white/95 hover:bg-white text-gray-900 font-semibold text-sm rounded-xl shadow-lg transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Quick Add
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          {/* Rating */}
          {product.rating && product.rating > 0 && (
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(product.rating!) 
                      ? 'fill-amber-400 text-amber-400' 
                      : 'text-gray-200'
                  }`}
                />
              ))}
              {product.reviewCount && (
                <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
              )}
            </div>
          )}
          
          {/* Category */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {product.category}
            </span>
            {product.material && (
              <span className="text-xs text-gray-500">{product.material}</span>
            )}
          </div>
          
          {/* Title */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors duration-300">
            {product.title}
          </h3>
          
          {/* Price */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">
                ₹{displayPrice.toLocaleString()}
              </span>
              {hasActiveOffer && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{product.basePrice.toLocaleString()}
                </span>
              )}
            </div>
            
            {product.deliveryEstimate && (
              <div className="flex items-center gap-1 text-xs text-emerald-600">
                <Truck className="w-3 h-3" />
                <span>{product.deliveryEstimate}</span>
              </div>
            )}
          </div>

          {/* Stock Status */}
          {product.stockQuantity !== undefined && product.stockQuantity <= 5 && product.stockQuantity > 0 && (
            <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
              <Package className="w-3 h-3" />
              Only {product.stockQuantity} left in stock
            </p>
          )}
        </div>
      </div>
    );
  };

  // Compact Product Card
  const CompactProductCard = ({ product }: { product: Product }) => {
    const hasActiveOffer = hasValidOffer(product);
    const displayPrice = getDisplayPrice(product);
    const discountPercent = hasActiveOffer 
      ? Math.round(((product.basePrice - product.offerPrice!) / product.basePrice) * 100)
      : 0;

    return (
      <div
        className="group flex gap-4 bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
        onClick={() => router.push(`/products/${product._id}`)}
      >
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={getProductImage(product, 0)}
            alt={product.title}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
            onError={(e) => (e.currentTarget.src = '/placeholder-image.png')}
          />
          {hasActiveOffer && (
            <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">
              -{discountPercent}%
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
          <div>
            <p className="text-xs text-blue-600 font-medium">{product.category}</p>
            <h3 className="font-medium text-gray-900 line-clamp-2 text-sm mt-0.5 group-hover:text-blue-600 transition-colors">
              {product.title}
            </h3>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-gray-900">₹{displayPrice.toLocaleString()}</span>
              {hasActiveOffer && (
                <span className="text-xs text-gray-400 line-through">₹{product.basePrice.toLocaleString()}</span>
              )}
            </div>
            <button
              onClick={(e) => handleAddToCart(product, e)}
              className="p-2 bg-gray-900 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 pt-28">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=1920&q=80')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white/90 rounded-full text-sm font-medium border border-white/20 mb-4">
              <Sparkles className="w-4 h-4" />
              {products.length} Premium Frames Available
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight">
              {filters.category !== 'all' 
                ? <>{filters.category} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Collection</span></>
                : <>Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Frame Collection</span></>
              }
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Discover the perfect frame to showcase your precious memories. Premium quality, timeless designs.
            </p>
          </div>
        </div>
        
        {/* Wave Decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(248 250 252)" />
          </svg>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-6 relative z-10">
        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for frames..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-12 h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Quick Category Pills */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setFilters({ ...filters, category: 'all' })}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    filters.category === 'all'
                      ? 'bg-gray-900 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {categories.slice(0, 4).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilters({ ...filters, category: cat })}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      filters.category === cat
                        ? 'bg-gray-900 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sort Select */}
              <Select value={filters.sort} onValueChange={(value: string) => setFilters({ ...filters, sort: value })}>
                <SelectTrigger className="w-[160px] h-10 bg-gray-50 border-gray-200 rounded-xl">
                  <ArrowUpDown className="w-4 h-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="discount">Best Discount</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'compact' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Dialog */}
              <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-10 px-4 bg-gray-50 border-gray-200 hover:bg-gray-100 rounded-xl">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-blue-600">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Filter className="h-5 w-5 text-blue-600" />
                      </div>
                      Filter Products
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    {/* Category Filter */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-900">Category</label>
                      <Select value={filters.category} onValueChange={(value: string) => setFilters({ ...filters, category: value })}>
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-900">Price Range</label>
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                          <Input
                            type="number"
                            placeholder="Min"
                            value={filters.minPrice}
                            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                            className="pl-8 h-12 bg-gray-50 rounded-xl"
                          />
                        </div>
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                          <Input
                            type="number"
                            placeholder="Max"
                            value={filters.maxPrice}
                            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                            className="pl-8 h-12 bg-gray-50 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sort */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-900">Sort By</label>
                      <Select value={filters.sort} onValueChange={(value: string) => setFilters({ ...filters, sort: value })}>
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="price-asc">Price: Low to High</SelectItem>
                          <SelectItem value="price-desc">Price: High to Low</SelectItem>
                          <SelectItem value="discount">Best Discount</SelectItem>
                          <SelectItem value="popular">Most Popular</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={clearFilters}
                        className="flex-1 h-12 rounded-xl"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear All
                      </Button>
                      <Button 
                        onClick={() => setFilterOpen(false)}
                        className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl"
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">Active:</span>
              {filters.category !== 'all' && (
                <Badge variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer" onClick={() => setFilters({ ...filters, category: 'all' })}>
                  {filters.category}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
              {filters.search && (
                <Badge variant="secondary" className="px-3 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 cursor-pointer" onClick={() => setFilters({ ...filters, search: '' })}>
                  "{filters.search}"
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <Badge variant="secondary" className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer" onClick={() => setFilters({ ...filters, minPrice: '', maxPrice: '' })}>
                  ₹{filters.minPrice || '0'} - ₹{filters.maxPrice || '∞'}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium ml-2"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing <span className="font-bold text-gray-900">{products.length}</span> {products.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-200 rounded-full w-20" />
                  <div className="h-4 bg-gray-200 rounded-full w-3/4" />
                  <div className="h-4 bg-gray-200 rounded-full w-1/2" />
                  <div className="h-6 bg-gray-200 rounded-full w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
            {products.map((product) => (
              viewMode === 'grid' 
                ? <ProductCard key={product._id} product={product} />
                : <CompactProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
            </p>
            <Button onClick={clearFilters} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-3 rounded-xl">
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          {[
            { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹999', color: 'from-emerald-400 to-teal-500' },
            { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy', color: 'from-blue-400 to-indigo-500' },
            { icon: Shield, title: 'Secure Payment', desc: 'COD & Prepaid', color: 'from-purple-400 to-pink-500' },
            { icon: Package, title: 'Quality Assured', desc: 'Premium materials', color: 'from-amber-400 to-orange-500' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}