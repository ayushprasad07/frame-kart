'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Edit, Trash, ChevronLeft, ChevronRight } from 'lucide-react';

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
  isActive?: boolean;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImages, setCurrentImages] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data.products || []);
      if (data.products) {
        const initIndexes: { [key: string]: number } = {};
        data.products.forEach((product: Product) => {
          initIndexes[product._id] = 0;
        });
        setCurrentImages(initIndexes);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete product');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const prevImage = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImages((prev) => {
      const product = products.find((p) => p._id === productId);
      const total = product?.images.length || 1;
      if (total <= 1) return prev;
      const currentIndex = prev[productId] || 0;
      const newIndex = currentIndex === 0 ? total - 1 : currentIndex - 1;
      return { ...prev, [productId]: newIndex };
    });
  };

  const nextImage = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImages((prev) => {
      const product = products.find((p) => p._id === productId);
      const total = product?.images.length || 1;
      if (total <= 1) return prev;
      const currentIndex = prev[productId] || 0;
      const newIndex = currentIndex === total - 1 ? 0 : currentIndex + 1;
      return { ...prev, [productId]: newIndex };
    });
  };

  const getProductImage = (product: Product, imageIndex: number) => {
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
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-5 w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
      {/* Header */}
      <motion.div
        className="relative mb-12 flex items-center justify-between w-full max-w-[1200px] mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <h1 className="text-5xl font-extrabold text-gray-900">Products</h1>
        <button
          onClick={() => router.push('/admin/products/add')}
          className="bg-black cursor-pointer text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          aria-label="Add Product"
        >
          Add Product
        </button>
      </motion.div>

      {loading ? (
        <p className="text-center text-gray-500 animate-pulse">Loading products...</p>
      ) : products.length > 0 ? (
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {products.map((product) => {
            const imageIndex = currentImages[product._id] || 0;
            const imagesLength = product.images?.length || 0;
            const productImage = getProductImage(product, imageIndex);
            const showCarousel = imagesLength > 1;

            return (
              <motion.div
                key={product._id}
                className="flex bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Left: image carousel */}
                <div className="relative w-1/2 h-56 group">
                  {productImage ? (
                    <>
                      <Image
                        src={productImage}
                        alt={`${product.title} image ${imageIndex + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                      />
                      {showCarousel && (
                        <>
                          <button
                            onClick={(e) => prevImage(product._id, e)}
                            aria-label="Previous Image"
                            className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black bg-opacity-40 hover:bg-opacity-60 text-white p-2 transition opacity-0 group-hover:opacity-100"
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <button
                            onClick={(e) => nextImage(product._id, e)}
                            aria-label="Next Image"
                            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black bg-opacity-40 hover:bg-opacity-60 text-white p-2 transition opacity-0 group-hover:opacity-100"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-56 bg-gray-200 flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                </div>

                {/* Right: product info */}
                <div className="relative w-1/2 p-6 flex flex-col justify-between">
                  {/* Edit/Delete Icons */}
                  <div className="absolute top-3 right-3 flex space-x-2 z-20">
                    <button
                      onClick={() => router.push(`/admin/products/edit/${product._id}`)}
                      className="flex items-center cursor-pointer justify-center w-8 h-8 bg-black text-white rounded-md hover:bg-gray-800 transition"
                      aria-label={`Edit ${product.title}`}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex items-center cursor-pointer justify-center w-8 h-8 bg-black text-white rounded-md hover:bg-gray-800 transition"
                      aria-label={`Delete ${product.title}`}
                    >
                      <Trash size={16} />
                    </button>
                  </div>

                  <div>
                    <h2
                      className="text-xl font-bold text-gray-900 truncate max-w-full"
                      title={product.title}
                    >
                      {product.title}
                    </h2>
                    <p
                      className="text-sm text-gray-600 mt-1 mb-3 truncate max-w-full"
                      title={product.category}
                    >
                      Category: {product.category}
                    </p>
                    <div className="flex items-center gap-2  text-gray-500">
                      <span className='line-through  '>₹{product.basePrice?.toLocaleString() ?? 'N/A'}</span>
                      {product.offerPrice && product.offerPrice < product.basePrice && (
                        <span className="text-gray-800 font-semibold text-lg  text-base">
                          ₹{product.offerPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto text-xs text-gray-500 space-y-1">
                    {product.sku && <div>SKU: {product.sku}</div>}
                    {typeof product.stockQuantity === 'number' && (
                      <div>Stock: {product.stockQuantity}</div>
                    )}
                    {typeof product.isActive === 'boolean' && (
                      <div className={product.isActive ? 'text-green-600' : 'text-red-600'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-lg shadow-md max-w-md mx-auto">
          <div className="text-center py-5 px-5">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <p className="text-gray-500 text-lg font-medium">No products available yet.</p>
            <p className="text-gray-400 mt-2">Check back soon for amazing frames and artwork!</p>
          </div>
          <button
            onClick={() => router.push('/admin/products/add')}
            className="bg-black cursor-pointer text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            aria-label="Add Your First Product"
          >
            Add Your First Product
          </button>
        </div>
      )}
    </div>
  );
}
