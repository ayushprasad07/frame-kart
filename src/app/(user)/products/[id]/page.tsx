'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ChevronLeft, Minus, Plus, Heart, Truck, Shield, RotateCcw } from 'lucide-react';
import ProductGallery from '@/components/ProductGallery';
import { useCart } from '@/context/CartContext';

// Interfaces matching your updated model
interface ISizeOption {
  _id?: string;
  size: string;
  price: number;
  offerPrice?: number;
  dimensions?: {
    width: number;
    height: number;
    unit: string;
  };
}

interface IStyleOption {
  _id?: string;
  name: string;
  additionalPrice?: number;
}

interface Product {
  _id: string;
  title: string;
  basePrice: number;
  offerPrice?: number;
  description: string;
  detailedDescription?: string;
  category: string;
  subCategory?: string;
  material: string;
  style?: string;
  occasion?: string;
  isAvailable: boolean;
  stockQuantity: number;
  sku: string;
  sizes: ISizeOption[];
  styles: IStyleOption[];
  images: string[];
  featuredImage: string;
  tags: string[];
  weight?: number;
  deliveryEstimate: string;
  dimensions?: {
    width: number;
    height: number;
    depth?: number;
    unit: string;
  };
  frameType?: 'wall' | 'tabletop' | 'standing';
  shape?: 'square' | 'rectangle' | 'round' | 'oval' | 'heart';
  mountingType?: string;
  hasGlass?: boolean;
  glassType?: 'standard' | 'non-glare' | 'uv-protected' | 'acrylic';
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  totalSold?: number;
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CartItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  style?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<ISizeOption | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<IStyleOption | null>(null);
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
      
      // Auto-select first size if available
      if (data.product?.sizes?.length > 0) {
        setSelectedSize(data.product.sizes[0]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  // Calculate current price based on selections
  const getCurrentPrice = () => {
    let price = product?.basePrice || 0;
    
    // If size is selected, use size price
    if (selectedSize) {
      price = selectedSize.offerPrice || selectedSize.price;
    } else if (product?.offerPrice) {
      price = product.offerPrice;
    }
    
    // Add style additional price if selected
    if (selectedStyle?.additionalPrice) {
      price += selectedStyle.additionalPrice;
    }
    
    return price;
  };

  // Calculate original price (without offers)
  const getOriginalPrice = () => {
    let price = product?.basePrice || 0;
    
    if (selectedSize) {
      price = selectedSize.price;
    }
    
    if (selectedStyle?.additionalPrice) {
      price += selectedStyle.additionalPrice;
    }
    
    return price;
  };

  const getDiscountPercentage = () => {
    const current = getCurrentPrice();
    const original = getOriginalPrice();
    
    if (current < original) {
      return Math.round(((original - current) / original) * 100);
    }
    return 0;
  };

  const handleAddToCart = () => {
    if (product) {
      const cartItem: CartItem = {
        productId: product._id,
        title: product.title,
        price: getCurrentPrice(),
        image: product.featuredImage || product.images?.[0] || '',
        quantity,
        size: selectedSize?.size || undefined,
        style: selectedStyle?.name || undefined,
      };
      addToCart(cartItem);
    }
  };

  const isProductAvailable = product?.isAvailable && product.stockQuantity > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-14 h-14 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
          {/* Product Gallery */}
          <div className="lg:sticky lg:top-6">
            <ProductGallery 
              images={product.images || []} 
              title={product.title} 
              featuredImage={product.featuredImage}
              className="shadow-xl rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm border border-white/50"
            />
          </div>

          {/* Product Details */}
          <div className="space-y-5">
            {/* Breadcrumb & Badges */}
            <div>
              <nav className="flex items-center text-sm text-gray-500 mb-2">
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
              <div className="flex flex-wrap gap-2">
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs font-semibold rounded-full">
                  {product.subCategory || product.category}
                </span>
                {product.isBestSeller && (
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-xs font-semibold rounded-full">
                    Best Seller
                  </span>
                )}
                {product.isNewArrival && (
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 text-xs font-semibold rounded-full">
                    New Arrival
                  </span>
                )}
              </div>
            </div>

            {/* Title & Rating */}
            <div>
              <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 leading-tight mb-2">
                {product.title}
              </h1>
              {product.rating !== undefined && product.rating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating!) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating.toFixed(1)} ({product.reviewCount || 0} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Price Section */}
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-white/50 shadow-lg">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-2xl lg:text-3xl font-black text-gray-900">
                  ₹{getCurrentPrice().toLocaleString()}
                </span>
                {discountPercentage > 0 && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      ₹{getOriginalPrice().toLocaleString()}
                    </span>
                    <span className="px-2 py-0.5 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full">
                      {discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className={`text-sm font-semibold ${isProductAvailable ? 'text-emerald-600' : 'text-red-600'}`}>
                {isProductAvailable ? `In Stock (${product.stockQuantity} available)` : 'Out of Stock'}
              </p>
            </div>

            {/* Description */}
            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50">
              <p className="text-gray-700 text-sm leading-relaxed">
                {product.detailedDescription || product.description}
              </p>
            </div>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Size {selectedSize && <span className="text-gray-500 font-normal">- {selectedSize.size}</span>}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sizeOption, idx) => (
                    <button
                      key={sizeOption._id || idx}
                      onClick={() => setSelectedSize(sizeOption)}
                      className={`px-3 py-2 text-sm font-medium rounded-xl border-2 transition-all duration-200 ${
                        selectedSize?._id === sizeOption._id || selectedSize?.size === sizeOption.size
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md'
                          : 'bg-white/70 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-900'
                      }`}
                      type="button"
                    >
                      <span className="block">{sizeOption.size}</span>
                      {sizeOption.dimensions && (
                        <span className="block text-[10px] opacity-75">
                          {sizeOption.dimensions.width}x{sizeOption.dimensions.height} {sizeOption.dimensions.unit}
                        </span>
                      )}
                      <span className="block text-xs mt-0.5">
                        ₹{(sizeOption.offerPrice || sizeOption.price).toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Style Selector */}
            {product.styles && product.styles.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Style {selectedStyle && <span className="text-gray-500 font-normal">- {selectedStyle.name}</span>}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.styles.map((styleOption, idx) => (
                    <button
                      key={styleOption._id || idx}
                      onClick={() => setSelectedStyle(selectedStyle?.name === styleOption.name ? null : styleOption)}
                      className={`px-4 py-2 text-sm font-medium rounded-xl border-2 transition-all duration-200 ${
                        selectedStyle?.name === styleOption.name
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent shadow-md'
                          : 'bg-white/70 border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-900'
                      }`}
                      type="button"
                    >
                      <span>{styleOption.name}</span>
                      {styleOption.additionalPrice && styleOption.additionalPrice > 0 && (
                        <span className="text-xs ml-1 opacity-75">+₹{styleOption.additionalPrice}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {product.material && (
                <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                  <div className="text-[10px] text-indigo-600 font-semibold uppercase mb-0.5">Material</div>
                  <div className="font-medium text-gray-900 text-sm">{product.material}</div>
                </div>
              )}
              {product.frameType && (
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  <div className="text-[10px] text-emerald-600 font-semibold uppercase mb-0.5">Type</div>
                  <div className="font-medium text-gray-900 text-sm capitalize">{product.frameType}</div>
                </div>
              )}
              {product.shape && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                  <div className="text-[10px] text-amber-600 font-semibold uppercase mb-0.5">Shape</div>
                  <div className="font-medium text-gray-900 text-sm capitalize">{product.shape}</div>
                </div>
              )}
              {product.hasGlass && product.glassType && (
                <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                  <div className="text-[10px] text-purple-600 font-semibold uppercase mb-0.5">Glass</div>
                  <div className="font-medium text-gray-900 text-sm capitalize">{product.glassType.replace('-', ' ')}</div>
                </div>
              )}
              {product.sku && (
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <div className="text-[10px] text-gray-600 font-semibold uppercase mb-0.5">SKU</div>
                  <div className="font-mono text-xs text-gray-900">{product.sku}</div>
                </div>
              )}
              {product.deliveryEstimate && (
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <div className="text-[10px] text-blue-600 font-semibold uppercase mb-0.5">Delivery</div>
                  <div className="font-medium text-gray-900 text-sm">{product.deliveryEstimate}</div>
                </div>
              )}
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-900">Quantity</label>
                <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-gray-200 shadow-sm">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                    type="button"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="text-xl font-bold text-gray-900 min-w-[2rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                    type="button"
                    disabled={!isProductAvailable || quantity >= product.stockQuantity}
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleAddToCart}
                  disabled={!isProductAvailable}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-6 rounded-2xl font-bold text-base shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  type="button"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {isProductAvailable ? `Add to Cart • ₹${(getCurrentPrice() * quantity).toLocaleString()}` : 'Out of Stock'}
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setWishlist(!wishlist)}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 border-2 flex items-center justify-center gap-2 ${
                      wishlist
                        ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white border-transparent'
                        : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600'
                    }`}
                    type="button"
                  >
                    <Heart className={`w-4 h-4 ${wishlist ? 'fill-current' : ''}`} />
                    {wishlist ? 'Wishlisted' : 'Wishlist'}
                  </button>
                  <button 
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                    disabled={!isProductAvailable}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 text-xs">
                <Truck className="w-4 h-4 text-blue-500" />
                <span>Free Shipping over ₹999</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-xs">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-xs">
                <RotateCcw className="w-4 h-4 text-purple-500" />
                <span>Easy Returns</span>
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 cursor-pointer transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
