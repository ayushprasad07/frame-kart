'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
// import Header from '@/components/Header';
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
  sizes?: any[];
  styles?: any[];
  images: string[];
  featuredImage?: string;
  tags?: string[];
  weight?: number;
  deliveryEstimate?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      const data = await res.json();
      setProduct(data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        productId: product._id,
        title: product.title,
        price: product.basePrice,
        image: product.featuredImage || product.images?.[0],
        // quantity,
      });
      alert('Product added to cart!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* <Header /> */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-500">Loading product...</div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* <Header /> */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-500">Product not found.</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Header /> */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
          {/* Product Images */}
          <div>
            <ProductGallery images={product.images || []} title={product.title} featuredImage={product.featuredImage} />
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <span className="text-sm text-gray-500 uppercase">
                {product.category}{product.subCategory ? ` / ${product.subCategory}` : ''}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.title}</h1>

            <div className="flex items-baseline gap-4 mb-6">
              <p className="text-xl line-through text-gray-900">
                ₹{product.basePrice.toLocaleString()}
              </p>
              {product.offerPrice !== undefined && product.offerPrice < product.basePrice && (
                <p className="text-3xl text-gray-900 font-bold ">
                  ₹{product.offerPrice.toLocaleString()}
                </p>
              )}
            </div>

            <div className="mb-6 text-gray-700 leading-relaxed whitespace-pre-line">
              {product.detailedDescription || product.description}
            </div>

            {/* Additional Information */}
            <div className="mb-6 space-y-2 text-gray-700 text-sm">
              {product.material && (
                <div>
                  <strong className="font-semibold">Material:</strong> {product.material}
                </div>
              )}
              {product.sku && (
                <div>
                  <strong className="font-semibold">SKU:</strong> {product.sku}
                </div>
              )}
              {typeof product.stockQuantity === 'number' && (
                <div>
                  <strong className="font-semibold">Stock Quantity:</strong> {product.stockQuantity}
                </div>
              )}
              {typeof product.weight === 'number' && (
                <div>
                  <strong className="font-semibold">Weight:</strong> {product.weight} kg
                </div>
              )}
              {product.deliveryEstimate && (
                <div>
                  <strong className="font-semibold">Delivery Estimate:</strong> {product.deliveryEstimate}
                </div>
              )}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <strong className="font-semibold">Tags:</strong> {product.tags.join(', ')}
                </div>
              )}
              {typeof product.isAvailable === 'boolean' && (
                <div className={product.isAvailable ? 'text-green-600' : 'text-red-600'}>
                  {product.isAvailable ? 'Available' : 'Not Available'}
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  -
                </button>
                <span className="text-lg font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors mb-4"
            >
              Add to Cart
            </button>

            <button className="w-full bg-gray-200 text-gray-900 py-3 px-6 rounded-md font-semibold hover:bg-gray-300 transition-colors">
              Buy Now
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
