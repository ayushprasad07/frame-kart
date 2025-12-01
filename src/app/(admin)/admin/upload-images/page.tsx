'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Image, 
  Folder, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Search,
  Filter,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  X,
  Save,
  Loader2,
  Upload,
  Package,
  TrendingUp
} from 'lucide-react';

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  linkText?: string;
  displayOrder: number;
  isActive: boolean;
  type: 'hero' | 'promotional';
  createdAt: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  displayOrder: number;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ImageUploadProps {
  type?: 'banners' | 'categories';
}

const PRODUCT_CATEGORIES = [
  'Wooden Frames',
  'Metal Frames',
  'Collage & Multi-Photo Frames',
  'Custom Frames',
  'Acrylic Frames',
  'Canvas Frames',
  'Bamboo & Eco-Friendly Frames',
  'Tabletop Frames',
  'Digital Prints',
  'Art & Wall Decor',
  'Gift Sets',
  'Office & Corporate',
  'Seasonal & Occasional'
] as const;

export default function ImageUpload({ type = 'banners' }: ImageUploadProps) {
  const [activeTab, setActiveTab] = useState<'banners' | 'categories'>(type);
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Banner | Category | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'banners') {
        const res = await fetch('/api/banners');
        const data = await res.json();
        if (data.success) setBanners(data.banners);
      } else {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success) setCategories(data.categories);
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();
    
    if (activeTab === 'banners') {
      formDataToSend.append('title', formData.title || '');
      if (formData.subtitle) formDataToSend.append('subtitle', formData.subtitle);
      if (formData.link) formDataToSend.append('link', formData.link);
      formDataToSend.append('linkText', formData.linkText || 'Shop Now');
      formDataToSend.append('displayOrder', formData.displayOrder?.toString() || '1');
      formDataToSend.append('isActive', formData.isActive?.toString() || 'true');
      formDataToSend.append('type', formData.type || 'hero');
    } else {
      formDataToSend.append('name', formData.name || '');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('displayOrder', formData.displayOrder?.toString() || '1');
      formDataToSend.append('isActive', formData.isActive?.toString() || 'true');
    }

    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }

    try {
      const endpoint = activeTab === 'banners' ? '/api/banners' : '/api/categories';
      const method = editingItem ? 'PUT' : 'POST';
      
      // FIXED: For PUT requests, include ID in URL
      const url = editingItem ? `${endpoint}?id=${editingItem._id}` : endpoint;
      
      const res = await fetch(url, {
        method,
        body: formDataToSend
      });
      
      const data = await res.json();
      
      if (data.success) {
        setShowForm(false);
        setEditingItem(null);
        setFormData({});
        setImageFile(null);
        setPreview(null);
        fetchData();
      } else {
        alert(data.error || `Failed to save ${activeTab.slice(0, -1)}`);
      }
    } catch (error) {
      console.error(`Error saving ${activeTab.slice(0, -1)}:`, error);
      alert('An error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    const itemType = activeTab.slice(0, -1);
    if (!confirm(`Are you sure you want to delete this ${itemType}?`)) return;
    
    try {
      const endpoint = activeTab === 'banners' ? '/api/banners' : '/api/categories';
      const res = await fetch(`${endpoint}?id=${id}`, {
        method: 'DELETE'
      });
      
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || `Failed to delete ${itemType}`);
      }
    } catch (error) {
      console.error(`Error deleting ${itemType}:`, error);
    }
  };

  // Toggle active status
  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const endpoint = activeTab === 'banners' ? '/api/banners' : '/api/categories';
      const formData = new FormData();
      formData.append('id', id);
      formData.append('isActive', (!currentStatus).toString());
      
      // FIXED: Include ID in URL for PUT request
      const res = await fetch(`${endpoint}?id=${id}`, {
        method: 'PUT',
        body: formData
      });
      
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        console.error('Failed to toggle status:', data.error);
      }
    } catch (error) {
      console.error(`Error updating ${activeTab.slice(0, -1)} status:`, error);
    }
  };

  // Update display order
  const updateDisplayOrder = async (id: string, direction: 'up' | 'down') => {
    const items = activeTab === 'banners' ? banners : categories;
    const item = items.find(item => item._id === id);
    if (!item) return;

    const newOrder = direction === 'up' ? item.displayOrder - 1 : item.displayOrder + 1;
    const swapItem = items.find(item => item.displayOrder === newOrder);
    
    if (swapItem) {
      try {
        const endpoint = activeTab === 'banners' ? '/api/banners' : '/api/categories';
        
        // FIXED: Create FormData for PUT requests
        const formData1 = new FormData();
        formData1.append('id', id);
        formData1.append('displayOrder', newOrder.toString());
        
        const formData2 = new FormData();
        formData2.append('id', swapItem._id);
        formData2.append('displayOrder', item.displayOrder.toString());
        
        await Promise.all([
          fetch(`${endpoint}?id=${id}`, {
            method: 'PUT',
            body: formData1
          }),
          fetch(`${endpoint}?id=${swapItem._id}`, {
            method: 'PUT',
            body: formData2
          })
        ]);
        fetchData();
      } catch (error) {
        console.error('Error updating display order:', error);
      }
    }
  };

  // Handle image file change
  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  // Filter items
  const filteredItems = (activeTab === 'banners' ? banners : categories).filter((item: any) => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && item.isActive) ||
                         (filterStatus === 'inactive' && !item.isActive);
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: filteredItems.length,
    active: filteredItems.filter((item: any) => item.isActive).length,
    totalProducts: activeTab === 'categories' 
      ? categories.reduce((sum, cat) => sum + cat.productCount, 0)
      : banners.filter(b => b.type === 'hero').length
  };

  if (loading && !showForm) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading {activeTab}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Image Management</h1>
          <p className="text-gray-600 mt-1">Manage homepage banners and product categories</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setFormData({});
            setImageFile(null);
            setPreview(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Add New {activeTab === 'banners' ? 'Banner' : 'Category'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('banners')}
          className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-all ${
            activeTab === 'banners'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Image className="w-5 h-5" />
          Banners
          <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 rounded-full">
            {banners.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-all ${
            activeTab === 'categories'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Folder className="w-5 h-5" />
          Categories
          <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 rounded-full">
            {categories.length}
          </span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total {activeTab === 'banners' ? 'Banners' : 'Categories'}
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {activeTab === 'banners' ? 'Hero Banners' : 'Total Products'}
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              {activeTab === 'banners' ? (
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>
              ) : (
                <Package className="w-6 h-6 text-purple-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <button
              onClick={fetchData}
              className="px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">No {activeTab} found</h3>
          <p className="text-gray-600 mt-1 mb-6">Try adjusting your filters or add a new {activeTab.slice(0, -1)}</p>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New {activeTab === 'banners' ? 'Banner' : 'Category'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item: any) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              <div className={`relative overflow-hidden ${
                activeTab === 'banners' ? 'aspect-[16/9]' : 'aspect-[4/3]'
              }`}>
                <img
                  src={item.image}
                  alt={item.title || item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&h=400&fit=crop&q=80';
                  }}
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => toggleActive(item._id, item.isActive)}
                    className={`p-2 rounded-full backdrop-blur-sm ${
                      item.isActive 
                        ? 'bg-green-500/20 text-green-600 hover:bg-green-500/30' 
                        : 'bg-red-500/20 text-red-600 hover:bg-red-500/30'
                    }`}
                  >
                    {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
                {activeTab === 'categories' && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h3 className="text-xl font-bold text-white">{item.name}</h3>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                  {activeTab === 'banners' && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.type === 'hero' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-purple-500 text-white'
                    }`}>
                      {item.type}
                    </span>
                  )}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    item.isActive 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-500 text-white'
                  }`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">
                  {item.title || item.name}
                </h3>
                
                {activeTab === 'banners' && item.subtitle && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.subtitle}
                  </p>
                )}
                
                {activeTab === 'categories' && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-3">
                    <span>Order: {item.displayOrder}</span>
                    {activeTab === 'categories' && (
                      <span className="px-2 py-1 bg-gray-100 rounded-full">
                        {item.productCount} products
                      </span>
                    )}
                  </div>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateDisplayOrder(item._id, 'up')}
                      disabled={item.displayOrder === 1}
                      className={`p-2 rounded-lg ${
                        item.displayOrder === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateDisplayOrder(item._id, 'down')}
                      disabled={item.displayOrder === filteredItems.length}
                      className={`p-2 rounded-lg ${
                        item.displayOrder === filteredItems.length
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setFormData({
                          ...item,
                          isActive: item.isActive?.toString() || 'true'
                        });
                        setPreview(item.image);
                        setShowForm(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingItem ? 'Edit' : 'Add New'} {activeTab === 'banners' ? 'Banner' : 'Category'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {editingItem 
                    ? `Update ${activeTab.slice(0, -1)} details` 
                    : `Create a new ${activeTab.slice(0, -1)}`
                  }
                </p>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                  setFormData({});
                  setImageFile(null);
                  setPreview(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image Upload */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  {activeTab === 'banners' ? 'Banner' : 'Category'} Image *
                  {!editingItem && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="relative">
                  {preview ? (
                    <div className="relative group">
                      <div className="aspect-video rounded-xl overflow-hidden border-2 border-gray-300">
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&h=400&fit=crop&q=80';
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setPreview(null);
                        }}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => document.getElementById('file-input')?.click()}
                          className="p-3 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                        >
                          <Upload className="w-5 h-5 text-gray-700" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                      <div 
                        className="flex flex-col items-center justify-center h-full p-6 cursor-pointer"
                        onClick={() => document.getElementById('file-input')?.click()}
                      >
                        <div className="p-4 mb-3 bg-gray-100 rounded-full">
                          <Upload className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700">
                            Click to upload image
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, WEBP up to 5MB
                          </p>
                        </div>
                        <button
                          type="button"
                          className="mt-4 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          Select Image
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageChange(file);
                    }}
                    className="hidden"
                    required={!editingItem && !preview}
                  />
                </div>
                {!editingItem && !preview && (
                  <p className="text-sm text-red-500">Image is required for new items</p>
                )}
              </div>

              {/* Form Fields */}
              {activeTab === 'banners' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter banner title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle || ''}
                      onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter banner subtitle"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Link URL
                      </label>
                      <input
                        type="text"
                        value={formData.link || ''}
                        onChange={(e) => setFormData({...formData, link: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="/products"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Button Text
                      </label>
                      <input
                        type="text"
                        value={formData.linkText || 'Shop Now'}
                        onChange={(e) => setFormData({...formData, linkText: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Shop Now"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name *
                    </label>
                    <select
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a category</option>
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      value={formData.description || ''}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe this category..."
                    />
                  </div>
                </>
              )}

              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activeTab === 'banners' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={formData.type || 'hero'}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="hero">Hero Banner</option>
                      <option value="promotional">Promotional</option>
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.displayOrder || 1}
                    onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 1})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.isActive?.toString() || 'true'}
                    onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                    setFormData({});
                    setImageFile(null);
                    setPreview(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editingItem ? 'Update' : 'Create'} {activeTab === 'banners' ? 'Banner' : 'Category'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}