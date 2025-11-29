'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Filter, X, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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
    category: 'all',
    search: '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: string]: number }>({});
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filters]);

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

  const getProductImage = (product: Product, imageIndex: number = 0): string => {
    if (product.images && product.images.length > 0) {
      const image = product.images[imageIndex];
      return image.startsWith('http') || image.startsWith('/')
        ? image
        : `/uploads/products/${image}`;
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="text-center lg:text-left mb-6 lg:mb-0">
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              {filters.category !== 'all' ? `${filters.category} Frames` : 'All Frames'}
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Discover the perfect frame for your memories
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search frames..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200 focus:border-slate-300"
              />
            </div>

            {/* Filter Dialog */}
            <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="relative bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Category Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-900">Category</label>
                    <Select value={filters.category} onValueChange={(value: string) => setFilters({ ...filters, category: value })}>
                      <SelectTrigger>
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
                    <label className="text-sm font-medium text-slate-900">Price Range</label>
                    <div className="flex gap-3">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                        className="bg-slate-50"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                        className="bg-slate-50"
                      />
                    </div>
                  </div>

                  {/* Sort */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-900">Sort By</label>
                    <Select value={filters.sort} onValueChange={(value: string) => setFilters({ ...filters, sort: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                        <SelectItem value="discount">Best Discount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={clearFilters}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                    <Button 
                      onClick={() => setFilterOpen(false)}
                      className="flex-1 bg-slate-900 hover:bg-slate-800"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-slate-600">
            Showing <span className="font-semibold text-slate-900">{products.length}</span> product{products.length !== 1 ? 's' : ''}
          </p>
          
          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Active filters:</span>
              {filters.category !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Category: {filters.category}
                </Badge>
              )}
              {filters.search && (
                <Badge variant="secondary" className="text-xs">
                  Search: {filters.search}
                </Badge>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <Badge variant="secondary" className="text-xs">
                  Price: {filters.minPrice || '0'} - {filters.maxPrice || '∞'}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 px-2 text-xs text-slate-500 hover:text-slate-700"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-0">
                  <div className="aspect-[4/3] bg-slate-200 rounded-t-lg" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-6 bg-slate-200 rounded w-1/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => {
              const currentImageIndex = currentImageIndexes[product._id] || 0;
              const totalImages = product.images?.length || 0;
              const hasActiveOffer = hasValidOffer(product);
              const displayPrice = getDisplayPrice(product);
              const discountPercent = hasActiveOffer 
                ? Math.round(((product.basePrice - product.offerPrice!) / product.basePrice) * 100)
                : 0;

              return (
                <Card 
                  key={product._id}
                  className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-slate-200 overflow-hidden"
                  onClick={() => router.push(`/products/${product._id}`)}
                >
                  <CardContent className="p-0">
                    {/* Image with Carousel */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                      <img
                        src={getProductImage(product, currentImageIndex)}
                        alt={product.title}
                        loading="lazy"
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                      />
                      
                      {/* Carousel Controls */}
                      {totalImages > 1 && (
                        <>
                          <button
                            onClick={(e) => prevImage(product._id, e)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-900 rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            onClick={(e) => nextImage(product._id, e)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-900 rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                          >
                            <ChevronRight size={16} />
                          </button>
                          
                          {/* Image Counter */}
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded-full text-xs font-medium">
                            {currentImageIndex + 1} / {totalImages}
                          </div>
                        </>
                      )}
                      
                      {/* Discount Badge */}
                      {hasActiveOffer && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold">
                            {discountPercent}% OFF
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 line-clamp-2 leading-tight group-hover:text-slate-700 transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1 truncate">
                          {product.category}
                        </p>
                      </div>
                      
                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-slate-900">
                            ₹{displayPrice.toLocaleString()}
                          </span>
                          {hasActiveOffer && (
                            <span className="text-sm text-slate-400 line-through">
                              ₹{product.basePrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {product.deliveryEstimate && (
                          <Badge variant="outline" className="text-xs">
                            {product.deliveryEstimate}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-16 border-slate-200">
            <CardContent>
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No products found</h3>
              <p className="text-slate-600 mb-6 max-w-sm mx-auto">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear all filters
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}