'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit, Trash, ChevronLeft, ChevronRight, Plus, Package, 
  Search, Filter, TrendingUp, AlertTriangle, Eye, MoreHorizontal 
} from 'lucide-react';
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
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

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

  const getDiscountPercentage = (basePrice: number, offerPrice?: number) => {
    if (!offerPrice || offerPrice >= basePrice) return 0;
    return Math.round(((basePrice - offerPrice) / basePrice) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-8 bg-slate-200/80 rounded-lg w-64"></div>
                <div className="h-4 bg-slate-200/60 rounded w-48"></div>
              </div>
              <div className="h-12 w-36 bg-slate-200/80 rounded-xl"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-white/80 rounded-2xl shadow-sm"></div>
              ))}
            </div>
            <div className="h-20 bg-white/80 rounded-2xl shadow-sm"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="h-52 bg-slate-200/60"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-slate-200/80 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200/60 rounded w-1/2"></div>
                    <div className="h-6 bg-slate-200/80 rounded w-1/3"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-8 px-4 md:px-6 pb-12">
      <div className="max-w-[1400px] mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-200">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
                  Product Management
                </h1>
              </div>
              <p className="text-slate-500 ml-14">Manage your product catalog and inventory</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/admin/products/add')}
              className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-slate-300 transition-all duration-300"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              Add New Product
            </motion.button>
          </div>

          {/* Stats Cards - Modern Glassmorphism Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/50 hover:shadow-md hover:border-slate-300/50 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
              <div className="relative flex items-center gap-4">
                <div className="p-3.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-200">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Products</p>
                  <p className="text-3xl font-bold text-slate-900">{totalProducts}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/50 hover:shadow-md hover:border-slate-300/50 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
              <div className="relative flex items-center gap-4">
                <div className="p-3.5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-200">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Active Products</p>
                  <p className="text-3xl font-bold text-slate-900">{activeProducts}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/50 hover:shadow-md hover:border-slate-300/50 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
              <div className="relative flex items-center gap-4">
                <div className="p-3.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-200">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Low Stock</p>
                  <p className="text-3xl font-bold text-slate-900">{lowStockProducts}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Search and Filters - Modern Style */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-sm border border-slate-200/50 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 p-1.5 bg-slate-100 rounded-lg">
                  <Search className="text-slate-400 w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search products by name, category, or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 text-sm transition-all duration-200 placeholder:text-slate-400"
                />
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-10 pr-8 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 text-sm appearance-none cursor-pointer transition-all duration-200"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 text-sm appearance-none cursor-pointer transition-all duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Products Grid - Modern Card Design */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => {
                const imageIndex = currentImages[product._id] || 0;
                const imagesLength = product.images?.length || 0;
                const productImage = getProductImage(product, imageIndex);
                const showCarousel = imagesLength > 1;
                const discount = getDiscountPercentage(product.basePrice, product.offerPrice);

                return (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onMouseEnter={() => setHoveredCard(product._id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="group bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300/50 transition-all duration-500"
                  >
                    {/* Image Section */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                      {productImage ? (
                        <>
                          <Image
                            src={productImage}
                            alt={`${product.title} image ${imageIndex + 1}`}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          {showCarousel && (
                            <>
                              <motion.button
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: hoveredCard === product._id ? 1 : 0, x: 0 }}
                                onClick={(e) => prevImage(product._id, e)}
                                className="absolute top-1/2 left-3 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200"
                              >
                                <ChevronLeft size={18} className="text-slate-700" />
                              </motion.button>
                              <motion.button
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: hoveredCard === product._id ? 1 : 0, x: 0 }}
                                onClick={(e) => nextImage(product._id, e)}
                                className="absolute top-1/2 right-3 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200"
                              >
                                <ChevronRight size={18} className="text-slate-700" />
                              </motion.button>
                              
                              {/* Image Dots Indicator */}
                              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {product.images.map((_, idx) => (
                                  <span
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                                      idx === imageIndex ? 'bg-white w-4' : 'bg-white/50'
                                    }`}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Package className="w-16 h-16 text-slate-300" />
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {discount > 0 && (
                          <span className="px-2.5 py-1 bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-lg">
                            -{discount}%
                          </span>
                        )}
                        {product.isActive === false && (
                          <span className="px-2.5 py-1 bg-slate-800 text-white text-xs font-medium rounded-lg">
                            Inactive
                          </span>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: hoveredCard === product._id ? 1 : 0, y: 0 }}
                        className="absolute top-3 right-3 flex gap-2"
                      >
                        <button
                          onClick={() => router.push(`/admin/products/edit/${product._id}`)}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-indigo-500 hover:text-white transition-all duration-200"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-rose-500 hover:text-white transition-all duration-200"
                        >
                          <Trash size={16} />
                        </button>
                      </motion.div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg font-semibold text-slate-900 truncate mb-1" title={product.title}>
                            {product.title}
                          </h2>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            {product.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-baseline gap-2 mb-4">
                        {product.offerPrice && product.offerPrice < product.basePrice ? (
                          <>
                            <span className="text-2xl font-bold text-slate-900">
                              ₹{product.offerPrice.toLocaleString()}
                            </span>
                            <span className="text-sm text-slate-400 line-through">
                              ₹{product.basePrice?.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="text-2xl font-bold text-slate-900">
                            ₹{product.basePrice?.toLocaleString() ?? 'N/A'}
                          </span>
                        )}
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          {product.sku && (
                            <span className="flex items-center gap-1">
                              <span className="font-medium">SKU:</span> {product.sku}
                            </span>
                          )}
                          {typeof product.stockQuantity === 'number' && (
                            <span className={`flex items-center gap-1 ${product.stockQuantity < 10 ? 'text-amber-600' : ''}`}>
                              <span className="font-medium">Stock:</span> {product.stockQuantity}
                            </span>
                          )}
                        </div>
                        {typeof product.isActive === 'boolean' && (
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            product.isActive ? 'text-emerald-600' : 'text-slate-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              product.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}></span>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-6"
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-2xl opacity-60"></div>
              <div className="relative p-6 bg-white rounded-2xl shadow-lg">
                <Package className="w-16 h-16 text-slate-300" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No products found</h3>
            <p className="text-slate-500 text-center max-w-sm mb-8">
              {searchTerm || selectedCategory !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filters to find what you\'re looking for'
                : 'Get started by adding your first product to the catalog'}
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/admin/products/add')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all duration-300"
            >
              <Plus size={20} />
              Add Your First Product
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
