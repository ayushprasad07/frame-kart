'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Minus, 
  Plus, 
  Heart, 
  Truck, 
  Shield, 
  RotateCcw, 
  Star, 
  Package, 
  Clock,
  Check,
  ShoppingCart
} from 'lucide-react';
import ProductGallery from '@/components/ProductGallery';
import { useCart } from '@/context/CartContext';
import Footer from '@/components/Footer';

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
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<ISizeOption | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<IStyleOption | null>(null);
  const [wishlist, setWishlist] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
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
    
    if (product?.offerPrice) {
      price = product.offerPrice;
    }
    
    if (selectedStyle?.additionalPrice) {
      price += selectedStyle.additionalPrice;
    }
    
    return price;
  };

  // Calculate original price (without offers)
  const getOriginalPrice = () => {
    let price = product?.basePrice || 0;
    
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
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    }
  };

  const isProductAvailable = product?.isAvailable && product.stockQuantity > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-gray-500 font-medium animate-pulse">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50">
          <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <a 
            href="/products" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
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
    <div className="min-h-screen bg-white mt-16">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Product Gallery - Higher z-index for zoom panel to work */}
          <div className="lg:sticky lg:top-24 relative z-20">
            <ProductGallery 
              images={product.images || []} 
              title={product.title} 
              featuredImage={product.featuredImage}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/50"
            />
          </div>

          {/* Product Details - Lower z-index so zoom panel appears above */}
          <div className="space-y-6 relative z-0">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-gray-500 flex-wrap gap-1">
              <a href="/products" className="hover:text-blue-600 font-medium transition-colors">Products</a>
              <ChevronLeft className="w-4 h-4 rotate-180 text-gray-400" />
              <span className="text-gray-700 font-medium">{product.category}</span>
              {product.subCategory && (
                <>
                  <ChevronLeft className="w-4 h-4 rotate-180 text-gray-400" />
                  <span className="text-gray-900 font-medium">{product.subCategory}</span>
                </>
              )}
            </nav>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.isBestSeller && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-sm">
                  <Star className="w-3 h-3 fill-current" />
                  Best Seller
                </span>
              )}
              {product.isNewArrival && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-full shadow-sm">
                  ✨ New Arrival
                </span>
              )}
              <span className="inline-block px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                {product.subCategory || product.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
              {product.title}
            </h1>

            {/* Rating */}
            {product.rating !== undefined && product.rating > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-lg shadow-sm">
                  <span className="font-bold text-sm">{product.rating.toFixed(1)}</span>
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating!) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-gray-500 text-sm">
                  ({product.reviewCount?.toLocaleString() || 0} reviews)
                </span>
              </div>
            )}

            {/* Price Card */}
            <div className="bg-gradient-to-br from-white to-gray-50/80 p-5 rounded-2xl border border-gray-100 shadow-lg">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl lg:text-4xl font-black text-gray-900">
                  ₹{getCurrentPrice().toLocaleString()}
                </span>
                {discountPercentage > 0 && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      ₹{getOriginalPrice().toLocaleString()}
                    </span>
                    <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold rounded-lg shadow-sm">
                      {discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
              
              <div className={`mt-3 flex items-center gap-2 ${isProductAvailable ? 'text-emerald-600' : 'text-red-600'}`}>
                <Package className="w-4 h-4" />
                <span className="font-semibold text-sm">
                  {isProductAvailable ? `In Stock • ${product.stockQuantity} units available` : 'Currently Out of Stock'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white/60 shadow-sm p-5 rounded-xl border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.detailedDescription || product.description}
              </p>
            </div>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Select Size
                  </label>
                  {selectedSize?.dimensions && (
                    <span className="text-sm text-blue-600 font-medium">
                      {selectedSize.dimensions.width}" × {selectedSize.dimensions.height}"
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((sizeOption, idx) => (
                    <button
                      key={sizeOption._id || idx}
                      onClick={() => setSelectedSize(sizeOption)}
                      className={`relative px-5 py-3 text-sm font-semibold rounded-xl border-2 transition-all duration-200 ${
                        selectedSize?.size === sizeOption.size
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 scale-105'
                          : 'bg-white border-gray-200 text-gray-900 hover:border-blue-400 hover:shadow-md'
                      }`}
                      type="button"
                    >
                      {sizeOption.size}
                      {selectedSize?.size === sizeOption.size && (
                        <Check className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-white rounded-full p-0.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Style Selector */}
            {product.styles && product.styles.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Select Style
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.styles.map((styleOption, idx) => (
                    <button
                      key={styleOption._id || idx}
                      onClick={() => setSelectedStyle(selectedStyle?.name === styleOption.name ? null : styleOption)}
                      className={`relative px-5 py-3 text-sm font-semibold rounded-xl border-2 transition-all duration-200 ${
                        selectedStyle?.name === styleOption.name
                          ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200 scale-105'
                          : 'bg-white border-gray-200 text-gray-900 hover:border-purple-400 hover:shadow-md'
                      }`}
                      type="button"
                    >
                      {styleOption.name}
                      {styleOption.additionalPrice && styleOption.additionalPrice > 0 && (
                        <span className="ml-2 text-xs opacity-80">+₹{styleOption.additionalPrice}</span>
                      )}
                      {selectedStyle?.name === styleOption.name && (
                        <Check className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-purple-600 text-white rounded-full p-0.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {product.material && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100/50">
                  <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Material</div>
                  <div className="font-semibold text-gray-900 mt-1">{product.material}</div>
                </div>
              )}
              {product.frameType && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100/50">
                  <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Frame Type</div>
                  <div className="font-semibold text-gray-900 mt-1 capitalize">{product.frameType}</div>
                </div>
              )}
              {product.shape && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100/50">
                  <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Shape</div>
                  <div className="font-semibold text-gray-900 mt-1 capitalize">{product.shape}</div>
                </div>
              )}
              {product.hasGlass && product.glassType && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100/50">
                  <div className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Glass Type</div>
                  <div className="font-semibold text-gray-900 mt-1 capitalize">{product.glassType.replace('-', ' ')}</div>
                </div>
              )}
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">Quantity</span>
                <div className="flex items-center bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2.5 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity <= 1}
                    type="button"
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="w-12 text-center text-lg font-bold text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2.5 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isProductAvailable || quantity >= product.stockQuantity}
                    type="button"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!isProductAvailable}
                  className={`flex-1 py-4 px-6 cursor-pointer rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    addedToCart 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                      : 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:shadow-lg'
                  }`}
                  type="button"
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-5 h-5" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </>
                  )}
                </button>
                
                <button 
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600  hover:from-green-600 hover:to-emerald-600 cursor-pointer text-white py-4 px-6 rounded-xl font-bold text-base transition-all duration-300 shadow-lg shadow-orange-200/50 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  disabled={!isProductAvailable}
                  onClick={() => router.push(`/buy-now/${product._id}`)}
                  type="button"
                >
                  Buy Now • ₹{(getCurrentPrice() * quantity).toLocaleString()}
                </button>
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => setWishlist(!wishlist)}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 border-2 flex items-center justify-center gap-2 ${
                  wishlist
                    ? 'bg-rose-50 border-rose-300 text-rose-600'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50'
                }`}
                type="button"
              >
                <Heart className={`w-5 h-5 transition-all ${wishlist ? 'fill-current scale-110' : ''}`} />
                {wishlist ? 'Added to Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Delivery Info */}
            {product.deliveryEstimate && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <Clock className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <span className="text-sm font-semibold text-gray-900">Estimated Delivery: </span>
                  <span className="text-sm text-gray-600">{product.deliveryEstimate}</span>
                </div>
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
              <div className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl">
                <Truck className="w-6 h-6 text-blue-600" />
                <span className="text-xs text-center text-gray-700 font-medium">Free Delivery<br />over ₹999</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 bg-emerald-50 rounded-xl">
                <Shield className="w-6 h-6 text-emerald-600" />
                <span className="text-xs text-center text-gray-700 font-medium">Secure<br />Payment</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl">
                <RotateCcw className="w-6 h-6 text-purple-600" />
                <span className="text-xs text-center text-gray-700 font-medium">Easy<br />Returns</span>
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="pt-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-full cursor-pointer transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
