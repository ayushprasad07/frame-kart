'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
}

export default function ProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.sort) params.append('sort', filters.sort);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();

      // Normalize price types if needed
      const normalizedProducts = (data.products || []).map((p: Product) => ({
        ...p,
        basePrice: typeof p.basePrice === 'string' ? Number(p.basePrice) : p.basePrice,
        offerPrice: p.offerPrice ? (typeof p.offerPrice === 'string' ? Number(p.offerPrice) : p.offerPrice) : undefined,
      }));

      setProducts(normalizedProducts);
      
      // Initialize image indexes for carousel
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

  const getProductImage = (product: Product, imageIndex: number = 0): string => {
    // Use images array for carousel if available
    if (product.images && product.images.length > 0) {
      const image = product.images[imageIndex];
      return image.startsWith('http') || image.startsWith('/')
        ? image
        : `/uploads/products/${image}`;
    }
    // Fallback to featuredImage
    if (product.featuredImage) {
      return product.featuredImage.startsWith('http') || product.featuredImage.startsWith('/')
        ? product.featuredImage
        : `/uploads/products/${product.featuredImage}`;
    }
    return '/placeholder-image.png';
  };

  const hasValidOffer = (product: Product): boolean => {
    return (
      product.offerPrice !== undefined &&
      product.offerPrice !== null &&
      product.basePrice !== undefined &&
      product.basePrice !== null &&
      product.offerPrice < product.basePrice
    );
  };

  const getDisplayPrice = (product: Product): number => {
    return hasValidOffer(product) ? product.offerPrice! : product.basePrice;
  };

  // Carousel navigation functions
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-pink-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="flex mt-8 flex-col lg:flex-row gap-8">
          {/* Filters */}
          <aside className="w-full lg:w-72 bg-white/40 backdrop-blur-lg backdrop-filter border border-gray-200 rounded-2xl shadow-lg h-fit p-8 transition hover:shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Filters</h2>

            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search products..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white/60 backdrop-blur focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white/60 backdrop-blur focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  placeholder="Min"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white/60 backdrop-blur focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  placeholder="Max"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white/60 backdrop-blur focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white/60 backdrop-blur focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="discount">Best Discount</option>
              </select>
            </div>

            <button
              onClick={() => setFilters({
                category: '',
                search: '',
                minPrice: '',
                maxPrice: '',
                sort: 'newest',
              })}
              className="w-full px-4 py-2 bg-gray-200/90 text-gray-700 rounded-lg hover:bg-gray-300/90 transition-colors"
            >
              Clear Filters
            </button>
          </aside>

          {/* Products Grid */}
          <section className="flex-1">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {filters.category ? filters.category : 'All Products'}
              </h1>
              <p className="text-gray-600 mt-1">
                {products.length} product{products.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 animate-pulse">Loading products...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map(product => {
                  const currentImageIndex = currentImageIndexes[product._id] || 0;
                  const totalImages = product.images?.length || 0;
                  const hasActiveOffer = hasValidOffer(product);
                  const displayPrice = getDisplayPrice(product);

                  return (
                    <div
                      key={product._id}
                      className="bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-2xl transition p-4 flex flex-col cursor-pointer group"
                      onClick={() => router.push(`/products/${product._id}`)}
                    >
                      {/* Image with Carousel */}
                      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden mb-4">
                        <img
                          src={getProductImage(product, currentImageIndex)}
                          alt={product.title}
                          loading="lazy"
                          className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105 rounded-lg"
                        />
                        
                        {/* Carousel Controls - Only show if there are multiple images */}
                        {totalImages > 1 && (
                          <>
                            <button
                              onClick={(e) => prevImage(product._id, e)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-opacity opacity-0 group-hover:opacity-100"
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <button
                              onClick={(e) => nextImage(product._id, e)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-opacity opacity-0 group-hover:opacity-100"
                            >
                              <ChevronRight size={20} />
                            </button>
                            
                            {/* Image Counter */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                              {currentImageIndex + 1} / {totalImages}
                            </div>
                          </>
                        )}
                        
                        {/* Discount Badge */}
                        {hasActiveOffer && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                            SALE
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h2
                            className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2"
                            title={product.title}
                          >
                            {product.title}
                          </h2>
                          <p
                            className="text-sm text-gray-600 truncate"
                            title={product.category}
                          >
                            Category: {product.category}
                          </p>
                        </div>
                        
                        {/* Price Display */}
                        <div className="mt-3">
                          {hasActiveOffer ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold text-gray-900">
                                ₹{displayPrice.toLocaleString()}
                              </span>
                              <span className="text-lg text-gray-500 line-through">
                                ₹{product.basePrice.toLocaleString()}
                              </span>
                              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                                Save ₹{(product.basePrice - product.offerPrice!).toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xl font-bold text-gray-900">
                              ₹{product.basePrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found.</p>
                <p className="text-gray-400 mt-2">Try adjusting your filters or search keywords.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}