'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash, ChevronLeft, ChevronRight, Plus, Package, Search, Filter, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentImages, setCurrentImages] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) toast.error('Failed to fetch products');
      const data = await res.json();
      setProducts(data.products || []);
      toast.success('Products fetched successfully');
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
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/products/delete/${id}`, { method: 'DELETE' });
      if (!res.ok) toast.error('Failed to delete product');
      toast.success('Product deleted successfully');
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

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && product.isActive) ||
                         (statusFilter === 'inactive' && !product.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive).length;
  const lowStockProducts = products.filter(p => (p.stockQuantity || 0) < 10).length;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="w-1/2 h-56 bg-slate-200"></div>
                  <div className="w-1/2 p-6 space-y-4">
                    <div className="h-6 bg-slate-200 rounded"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-8 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screenpt-8 px-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Enhanced Header */}
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Product Management</h1>
              <p className="text-slate-600">Manage your product catalog and inventory</p>
            </div>
            <button
              onClick={() => router.push('/admin/products/add')}
              className="mt-4 lg:mt-0 inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Products</p>
                  <p className="text-2xl font-bold text-slate-900">{totalProducts}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <Filter className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Products</p>
                  <p className="text-2xl font-bold text-slate-900">{activeProducts}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 rounded-lg">
                  <Package className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Low Stock</p>
                  <p className="text-2xl font-bold text-slate-900">{lowStockProducts}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Search and Filters */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products by name, category, or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Products Grid - Keeping Original Card Layout */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredProducts.map((product, index) => {
                const imageIndex = currentImages[product._id] || 0;
                const imagesLength = product.images?.length || 0;
                const productImage = getProductImage(product, imageIndex);
                const showCarousel = imagesLength > 1;

                return (
                  <motion.div
                    key={product._id}
                    className="flex bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-slate-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {/* Left: image carousel - Original Layout */}
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
                        <div className="w-full h-56 bg-slate-100 flex items-center justify-center text-slate-400">
                          <Package className="w-12 h-12" />
                        </div>
                      )}
                    </div>

                    {/* Right: product info - Original Layout */}
                    <div className="relative w-1/2 p-6 flex flex-col justify-between">
                      {/* Edit/Delete Icons */}
                      <div className="absolute top-3 right-3 flex space-x-2 z-20">
                        <button
                          onClick={() => router.push(`/admin/products/edit/${product._id}`)}
                          className="flex items-center cursor-pointer justify-center w-8 h-8 bg-black text-white rounded-md hover:bg-slate-800 transition"
                          aria-label={`Edit ${product.title}`}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="flex items-center cursor-pointer justify-center w-8 h-8 bg-black text-white rounded-md hover:bg-slate-800 transition"
                          aria-label={`Delete ${product.title}`}
                        >
                          <Trash size={16} />
                        </button>
                      </div>

                      <div>
                        <h2
                          className="text-xl font-bold text-slate-900 truncate max-w-full"
                          title={product.title}
                        >
                          {product.title}
                        </h2>
                        <p
                          className="text-sm text-slate-600 mt-1 mb-3 truncate max-w-full"
                          title={product.category}
                        >
                          Category: {product.category}
                        </p>
                        <div className="flex items-center gap-2 text-slate-500">
                          <span className='line-through'>₹{product.basePrice?.toLocaleString() ?? 'N/A'}</span>
                          {product.offerPrice && product.offerPrice < product.basePrice && (
                            <span className="text-slate-800 font-semibold text-lg text-base">
                              ₹{product.offerPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-auto text-xs text-slate-500 space-y-1">
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
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-lg shadow-md max-w-md mx-auto border border-slate-200"
          >
            <div className="text-center py-5 px-5">
              <div className="text-slate-400 text-6xl mb-4">📦</div>
              <p className="text-slate-600 text-lg font-medium">No products found</p>
              <p className="text-slate-500 mt-2">
                {searchTerm || selectedCategory !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first product'}
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/products/add')}
              className="bg-slate-900 cursor-pointer text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
              aria-label="Add Your First Product"
            >
              Add Your First Product
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}