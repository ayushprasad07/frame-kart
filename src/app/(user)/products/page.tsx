'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

  const getProductImage = (product: Product): string => {
    if (product.featuredImage) {
      return product.featuredImage.startsWith('http') || product.featuredImage.startsWith('/')
        ? product.featuredImage
        : `/uploads/products/${product.featuredImage}`;
    }
    if (product.images && product.images.length > 0) {
      const image = product.images[0];
      return image.startsWith('http') || image.startsWith('/')
        ? image 
        : `/uploads/products/${image}`;
    }
    return '/placeholder-image.png'; // fallback placeholder
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
                {products.map(product => (
                  <div
                    key={product._id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-2xl transition p-4 flex flex-col cursor-pointer"
                    onClick={() => router.push(`/products/${product._id}`)}
                  >
                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden mb-4">
                      <img
                        src={getProductImage(product)}
                        alt={product.title}
                        loading="lazy"
                        className="object-cover w-full h-full transition-transform duration-200 hover:scale-105 rounded-lg"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h2
                          className="text-lg font-semibold text-gray-900 truncate"
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
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xl font-bold">
                          ₹{typeof product.basePrice === 'number' ? product.basePrice.toLocaleString() : 'N/A'}
                        </span>
                        {hasValidOffer(product) && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{product.offerPrice!.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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

function getProductImage(product: Product): string {
  if (product.featuredImage) {
    return product.featuredImage.startsWith('http') || product.featuredImage.startsWith('/')
      ? product.featuredImage
      : `/uploads/products/${product.featuredImage}`;
  }
  if (product.images && product.images.length > 0) {
    const image = product.images[0];
    return image.startsWith('http') || image.startsWith('/')
      ? image
      : `/uploads/products/${image}`;
  }
  return '/placeholder-image.png'; // fallback placeholder
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
