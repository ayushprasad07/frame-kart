'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ChevronLeft, Minus, Plus, Heart } from 'lucide-react';
import ProductGallery from '@/components/ProductGallery';
import { useCart } from '@/context/CartContext';

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
  sizes?: string[];
  styles?: string[];
  images: string[];
  featuredImage?: string;
  tags?: string[];
  weight?: number;
  deliveryEstimate?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

interface CartItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [wishlist, setWishlist] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch product');
      }
      const data = await res.json();
      setProduct(data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      const cartItem: CartItem = {
        productId: product._id,
        title: product.title,
        price: product.offerPrice || product.basePrice,
        image: product.featuredImage || product.images?.[0] || '',
        quantity,
        size: selectedSize || undefined,
      };
      addToCart(cartItem);
    }
  };

  const getDiscountPercentage = () => {
    if (product?.offerPrice && product.basePrice && product.offerPrice < product.basePrice) {
      return Math.round(((product.basePrice - product.offerPrice) / product.basePrice) * 100);
    }
    return 0;
  };

  const isProductAvailable = product?.isAvailable && (product.stockQuantity === undefined || product.stockQuantity > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="flex items-center justify-center min-h-[60vh] animate-pulse">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50">
          <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-pink-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <a 
            href="/products" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <ChevronLeft className="w-5 h-5" />
            Browse Products
          </a>
        </div>
      </div>
    );
  }

  const discountPercentage = getDiscountPercentage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Product Gallery */}
          <div className="space-y-6 lg:sticky lg:top-8 lg:h-screen lg:overflow-y-auto">
            <ProductGallery 
              images={product.images || []} 
              title={product.title} 
              featuredImage={product.featuredImage}
              className="shadow-2xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm border border-white/50"
            />
          </div>

          {/* Product Details */}
          <div className="lg:pt-4 space-y-8">
            {/* Breadcrumb & Category */}
            <div>
              <nav className="flex items-center text-sm text-gray-500 mb-3">
                <a href="/products" className="hover:text-blue-600 font-medium transition-colors">Products</a>
                <span className="mx-2">/</span>
                <span className="font-medium text-gray-900">{product.category}</span>
                {product.subCategory && (
                  <>
                    <span className="mx-2">/</span>
                    <span className="font-medium text-gray-900">{product.subCategory}</span>
                  </>
                )}
              </nav>
              <span className="inline-block px-4 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs font-semibold rounded-full uppercase tracking-wide">
                {product.subCategory || product.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-slate-900 bg-clip-text text-transparent leading-tight">
              {product.title}
            </h1>

            {/* Price Section */}
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-white/50 shadow-xl">
              <div className="flex items-baseline gap-4 mb-1">
                <span className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
                  ₹{(product.offerPrice || product.basePrice).toLocaleString()}
                </span>
                {discountPercentage > 0 && (
                  <>
                    <span className="text-2xl text-gray-500 line-through font-medium">
                      ₹{product.basePrice.toLocaleString()}
                    </span>
                    <div className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full shadow-lg">
                      {discountPercentage}% OFF
                    </div>
                  </>
                )}
              </div>
              <p className={`text-sm font-semibold px-3 py-1 rounded-full inline-block ${
                isProductAvailable 
                  ? 'text-emerald-600 bg-emerald-100/50' 
                  : 'text-red-600 bg-red-100/50'
              }`}>
                {isProductAvailable ? 'In Stock • Fast Delivery' : 'Out of Stock'}
              </p>
            </div>

            {/* Description */}
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg">
                {product.detailedDescription || product.description}
              </div>
            </div>

            {/* Product Specs */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {product.material && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="text-xs text-indigo-600 font-semibold uppercase tracking-wide mb-1">Material</div>
                  <div className="font-semibold text-gray-900">{product.material}</div>
                </div>
              )}
              {product.sku && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-1">SKU</div>
                  <div className="font-mono text-sm text-gray-900">{product.sku}</div>
                </div>
              )}
              {typeof product.stockQuantity === 'number' && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="text-xs text-amber-600 font-semibold uppercase tracking-wide mb-1">Stock</div>
                  <div className="font-bold text-2xl text-amber-700">{product.stockQuantity}</div>
                </div>
              )}
              {product.deliveryEstimate && (
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="text-xs text-purple-600 font-semibold uppercase tracking-wide mb-1">Delivery</div>
                  <div className="font-semibold text-gray-900">{product.deliveryEstimate}</div>
                </div>
              )}
            </div>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3 tracking-wide uppercase">Size</label>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all duration-300 ${
                        selectedSize === size
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-transparent'
                          : 'bg-white/70 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-900 shadow-sm'
                      }`}
                      type="button"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Action Buttons */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-900 tracking-wide uppercase">Quantity</label>
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-white/50 shadow-lg">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2.5 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center"
                    type="button"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="text-2xl font-bold text-gray-900 min-w-[2.5rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2.5 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center"
                    type="button"
                    disabled={!isProductAvailable || !!(product.stockQuantity && quantity >= product.stockQuantity)}
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!isProductAvailable}
                  className="group relative w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white py-4 px-8 rounded-3xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-500 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 disabled:transform-none"
                  type="button"
                >
                  <span className="flex items-center justify-center gap-3">
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.6 4A2 2 0 005.8 18H18.2a2 2 0 001.6-2.4l-1.6-4z" />
                    </svg>
                    {isProductAvailable ? `Add to Cart (${quantity})` : 'Out of Stock'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </button>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setWishlist(!wishlist)}
                    className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-sm shadow-lg transition-all duration-300 border-2 ${
                      wishlist
                        ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white border-transparent shadow-rose-500/25 hover:shadow-rose-500/40 hover:from-rose-600 hover:to-pink-700'
                        : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 shadow-sm hover:shadow-md'
                    }`}
                    type="button"
                  >
                    <Heart className={`w-5 h-5 mx-auto ${wishlist ? 'fill-current' : ''}`} />
                    {wishlist ? 'Added to Wishlist' : 'Add to Wishlist'}
                  </button>
                  <button 
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-4 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    type="button"
                    disabled={!isProductAvailable}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}