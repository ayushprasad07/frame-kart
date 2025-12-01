'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getCategoryOptions, getStyleOptions, getOccasionOptions } from '@/constants/products';
import { X, Plus, Trash2, Upload } from 'lucide-react';

// Image uploader component remains the same
const AddProductImageUploader = ({ 
  images, 
  onImagesChange, 
  featuredImage, 
  onFeaturedImageChange 
}: {
  images: File[];
  onImagesChange: (images: File[]) => void;
  featuredImage: File | null;
  onFeaturedImageChange: (image: File) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length > 0) {
      files.forEach(file => {
        if (!previews[file.name]) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setPreviews(prev => ({
              ...prev,
              [file.name]: e.target?.result as string
            }));
          };
          reader.readAsDataURL(file);
        }
      });

      const newImages = [...images, ...files];
      onImagesChange(newImages);

      if (!featuredImage && files.length > 0) {
        onFeaturedImageChange(files[0]);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const fileToRemove = images[index];
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);

    setPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[fileToRemove.name];
      return newPreviews;
    });

    if (featuredImage === fileToRemove) {
      onFeaturedImageChange(newImages[0] || null);
    }
  };

  const setAsFeatured = (image: File) => {
    onFeaturedImageChange(image);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    if (files.length > 0) {
      files.forEach(file => {
        if (!previews[file.name]) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setPreviews(prev => ({
              ...prev,
              [file.name]: e.target?.result as string
            }));
          };
          reader.readAsDataURL(file);
        }
      });

      const newImages = [...images, ...files];
      onImagesChange(newImages);

      if (!featuredImage && files.length > 0) {
        onFeaturedImageChange(files[0]);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-800 mb-2">
          Featured Image *
        </label>
        {featuredImage ? (
          <div className="flex items-center gap-4 p-4 border border-slate-300 rounded-lg bg-white">
            <div className="relative w-16 h-16 bg-slate-100 rounded-md overflow-hidden">
              <img
                src={previews[featuredImage.name] || URL.createObjectURL(featuredImage)}
                alt="Featured"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">
                {featuredImage.name}
              </p>
              <p className="text-xs text-slate-500">
                {(featuredImage.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              Featured
            </span>
          </div>
        ) : (
          <div className="p-6 border-2 border-dashed border-slate-300 rounded-lg text-center bg-slate-50">
            <p className="text-slate-500 text-sm">No featured image selected</p>
            <p className="text-xs text-slate-400 mt-1">
              Select images below and set one as featured
            </p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-800 mb-2">
          Product Images *
        </label>
        
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors cursor-pointer bg-white"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="space-y-2">
            <Upload className="mx-auto h-10 w-10 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-900">
                Drag and drop images here, or click to select
              </p>
              <p className="text-xs text-slate-500">
                PNG, JPG, GIF up to 10MB each
              </p>
            </div>
          </div>
        </div>
      </div>

      {images.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-slate-800 mb-2">
            Selected Images ({images.length})
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div
                key={`${image.name}-${index}`}
                className="relative group border border-slate-200 rounded-lg overflow-hidden bg-white"
              >
                <div className="relative h-20 bg-slate-100">
                  <img
                    src={previews[image.name] || URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-1">
                    {featuredImage !== image && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAsFeatured(image);
                        }}
                        className="p-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition"
                      >
                        Set Featured
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                      className="p-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                
                {featuredImage === image && (
                  <div className="absolute top-1 left-1">
                    <span className="px-1 py-0.5 bg-blue-600 text-white text-xs rounded">
                      Featured
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Size and Style Options Components
const SizeOptionsEditor = ({ sizes, onSizesChange }: { 
  sizes: any[], 
  onSizesChange: (sizes: any[]) => void 
}) => {
  const addSize = () => {
    onSizesChange([...sizes, { 
      size: '', 
      price: '', 
      offerPrice: '', 
      dimensions: { width: '', height: '', unit: 'inches' } 
    }]);
  };

  const updateSize = (index: number, field: string, value: any) => {
    const newSizes = [...sizes];
    if (field.includes('dimensions.')) {
      const dimField = field.split('.')[1];
      newSizes[index].dimensions = { ...newSizes[index].dimensions, [dimField]: value };
    } else {
      newSizes[index] = { ...newSizes[index], [field]: value };
    }
    onSizesChange(newSizes);
  };

  const removeSize = (index: number) => {
    onSizesChange(sizes.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-800">Size Options</label>
        <button
          type="button"
          onClick={addSize}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
        >
          <Plus size={12} /> Add Size
        </button>
      </div>
      
      {sizes.length === 0 ? (
        <p className="text-sm text-slate-500 py-2">No size options added</p>
      ) : (
        <div className="space-y-3">
          {sizes.map((size, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-3 bg-white">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-medium text-slate-900">Size Option #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeSize(index)}
                  className="text-slate-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600">Size Label *</label>
                  <input
                    type="text"
                    value={size.size}
                    onChange={(e) => updateSize(index, 'size', e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                    placeholder="e.g., A4, 12x18"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-xs text-slate-600">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={size.price}
                    onChange={(e) => updateSize(index, 'price', e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                    placeholder="Base price"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-xs text-slate-600">Offer Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={size.offerPrice}
                    onChange={(e) => updateSize(index, 'offerPrice', e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                    placeholder="Optional discount price"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-slate-600">Width</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={size.dimensions?.width || ''}
                      onChange={(e) => updateSize(index, 'dimensions.width', e.target.value)}
                      className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                      placeholder="Width"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">Height</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={size.dimensions?.height || ''}
                      onChange={(e) => updateSize(index, 'dimensions.height', e.target.value)}
                      className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                      placeholder="Height"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">Unit</label>
                    <select
                      value={size.dimensions?.unit || 'inches'}
                      onChange={(e) => updateSize(index, 'dimensions.unit', e.target.value)}
                      className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                    >
                      <option value="inches">inches</option>
                      <option value="cm">cm</option>
                      <option value="mm">mm</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StyleOptionsEditor = ({ styles, onStylesChange }: { 
  styles: any[], 
  onStylesChange: (styles: any[]) => void 
}) => {
  const addStyle = () => {
    onStylesChange([...styles, { name: '', additionalPrice: '' }]);
  };

  const updateStyle = (index: number, field: string, value: string) => {
    const newStyles = [...styles];
    newStyles[index] = { ...newStyles[index], [field]: value };
    onStylesChange(newStyles);
  };

  const removeStyle = (index: number) => {
    onStylesChange(styles.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-800">Style Options</label>
        <button
          type="button"
          onClick={addStyle}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
        >
          <Plus size={12} /> Add Style
        </button>
      </div>
      
      {styles.length === 0 ? (
        <p className="text-sm text-slate-500 py-2">No style options added</p>
      ) : (
        <div className="space-y-2">
          {styles.map((style, index) => (
            <div key={index} className="flex items-center gap-2 border border-slate-200 rounded-lg p-3 bg-white">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600">Style Name *</label>
                  <input
                    type="text"
                    value={style.name}
                    onChange={(e) => updateStyle(index, 'name', e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                    placeholder="e.g., Modern, Vintage"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600">Additional Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={style.additionalPrice}
                    onChange={(e) => updateStyle(index, 'additionalPrice', e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                    placeholder="Extra cost for this style"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeStyle(index)}
                className="text-slate-400 hover:text-red-500 p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TagsInput = ({ tags, onTagsChange }: { 
  tags: string[], 
  onTagsChange: (tags: string[]) => void 
}) => {
  const [input, setInput] = useState('');

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = input.trim();
      if (tag && !tags.includes(tag)) {
        onTagsChange([...tags, tag]);
      }
      setInput('');
    }
  };

  const removeTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-800">Tags</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <span key={index} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={addTag}
        placeholder="Type tag and press Enter or comma"
        className="w-full rounded border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400"
      />
      <p className="text-xs text-slate-500">Press Enter or comma to add tags</p>
    </div>
  );
};

export default function AddProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    basePrice: '',
    offerPrice: '',
    description: '',
    detailedDescription: '',
    category: '',
    subCategory: '',
    material: '',
    style: '',
    occasion: '',
    stockQuantity: '',
    sku: '',
    weight: '',
    deliveryEstimate: '5-7 business days',
    dimensions: { width: '', height: '', depth: '', unit: 'inches' },
    frameType: '',
    shape: '',
    mountingType: '',
    hasGlass: false,
    glassType: '',
    isAvailable: true,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    sizes: [] as any[],
    styles: [] as any[],
    tags: [] as string[],
  });
  const [images, setImages] = useState<File[]>([]);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImagesChange = (files: File[]) => {
    setImages(files);
    if (!featuredImage && files.length > 0) {
      setFeaturedImage(files[0]);
    }
  };

  const handleFeaturedImageChange = (file: File) => {
    setFeaturedImage(file);
  };

  const handleToggle = (key: 'isAvailable' | 'isActive' | 'isFeatured' | 'isBestSeller' | 'isNewArrival' | 'hasGlass') => {
    setFormData((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    // Validate required fields
    if (!formData.title || !formData.basePrice || !formData.description || 
        !formData.category || !formData.material || !formData.sku) {
      setError('Please fill all required fields');
      setSubmitting(false);
      return;
    }

    if (!featuredImage || images.length === 0) {
      setError('At least one image is required');
      setSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Add all form data fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'dimensions' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
          formDataToSend.append('dimensions.width', (value as any).width);
          formDataToSend.append('dimensions.height', (value as any).height);
          formDataToSend.append('dimensions.depth', (value as any).depth);
          formDataToSend.append('dimensions.unit', (value as any).unit);
        } else if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          formDataToSend.append(key, value.toString());
        } else {
          formDataToSend.append(key, value ? String(value) : '');
        }
      });

      if (featuredImage) {
        formDataToSend.append('featuredImage', featuredImage);
      }

      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      const res = await fetch('/api/create-product', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to create product');
      }

      toast.success('Product created successfully');
      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
      toast.error(err.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateDimensions = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      dimensions: { ...prev.dimensions, [field]: value }
    }));
  };

  // Get options from constants
  const categoryOptions = getCategoryOptions();
  const styleOptions = getStyleOptions();
  const occasionOptions = getOccasionOptions();

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-blue-500">
              Product Management
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              Add New Product
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create a new product with pricing, inventory, and media details.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition"
          >
            Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Main layout */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column - Basic info, Pricing, Frame Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Basic Information
                  </h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
                    Required
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-800 mb-1">
                        Product Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => updateFormData('title', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                        placeholder="E.g. Premium Teak Wood Photo Frame"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-800 mb-1">
                        Category *
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => updateFormData('category', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                      >
                        <option value="">Select Category</option>
                        {categoryOptions.map((cat: string) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-800 mb-1">
                        Sub Category
                      </label>
                      <input
                        type="text"
                        value={formData.subCategory}
                        onChange={(e) => updateFormData('subCategory', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                        placeholder="Optional"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-800 mb-1">
                        Material *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.material}
                        onChange={(e) => updateFormData('material', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                        placeholder="E.g. Teak Wood, Aluminium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-800 mb-1">
                        Style
                      </label>
                      <select
                        value={formData.style}
                        onChange={(e) => updateFormData('style', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                      >
                        <option value="">Select Style</option>
                        {styleOptions.map((style: string) => (
                          <option key={style} value={style}>{style}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-800 mb-1">
                        Occasion
                      </label>
                      <select
                        value={formData.occasion}
                        onChange={(e) => updateFormData('occasion', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                      >
                        <option value="">Select Occasion</option>
                        {occasionOptions.map((occasion: string) => (
                          <option key={occasion} value={occasion}>{occasion}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-800 mb-1">
                        SKU *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.sku}
                        onChange={(e) => updateFormData('sku', e.target.value.toUpperCase())}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                        placeholder="e.g., TEAK-FRAME-001"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-800 mb-1">
                      Short Description *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                      placeholder="Brief product description for listing cards..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-800 mb-1">
                      Detailed Description
                    </label>
                    <textarea
                      rows={5}
                      value={formData.detailedDescription}
                      onChange={(e) => updateFormData('detailedDescription', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                      placeholder="Detailed specifications, features, care instructions..."
                    />
                  </div>
                </div>
              </div>

              {/* Frame Specific Details */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900 mb-4">
                  Frame Details
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-800 mb-1">
                      Frame Type
                    </label>
                    <select
                      value={formData.frameType}
                      onChange={(e) => updateFormData('frameType', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                    >
                      <option value="">Select Type</option>
                      <option value="wall">Wall Frame</option>
                      <option value="tabletop">Tabletop Frame</option>
                      <option value="standing">Standing Frame</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-800 mb-1">
                      Shape
                    </label>
                    <select
                      value={formData.shape}
                      onChange={(e) => updateFormData('shape', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                    >
                      <option value="">Select Shape</option>
                      <option value="square">Square</option>
                      <option value="rectangle">Rectangle</option>
                      <option value="round">Round</option>
                      <option value="oval">Oval</option>
                      <option value="heart">Heart</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-800 mb-1">
                      Mounting Type
                    </label>
                    <input
                      type="text"
                      value={formData.mountingType}
                      onChange={(e) => updateFormData('mountingType', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                      placeholder="e.g., Wall Hook, Stand, Easel"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggle('hasGlass')}
                      className="flex items-center gap-2"
                    >
                      <div className={`w-10 h-6 rounded-full p-0.5 transition ${formData.hasGlass ? 'bg-blue-500' : 'bg-slate-300'}`}>
                        <div className={`w-5 h-5 rounded-full bg-white shadow transition ${formData.hasGlass ? 'translate-x-4' : ''}`} />
                      </div>
                      <span className="text-sm font-medium text-slate-800">Has Glass</span>
                    </button>
                  </div>

                  {formData.hasGlass && (
                    <div>
                      <label className="block text-xs font-medium text-slate-800 mb-1">
                        Glass Type
                      </label>
                      <select
                        value={formData.glassType}
                        onChange={(e) => updateFormData('glassType', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                      >
                        <option value="">Select Glass Type</option>
                        <option value="standard">Standard Glass</option>
                        <option value="non-glare">Non-Glare Glass</option>
                        <option value="uv-protected">UV Protected Glass</option>
                        <option value="acrylic">Acrylic</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Dimensions */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900 mb-4">
                  Dimensions
                </h2>
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-800 mb-1">
                      Width
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.dimensions.width}
                      onChange={(e) => updateDimensions('width', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                      placeholder="Width"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-800 mb-1">
                      Height
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.dimensions.height}
                      onChange={(e) => updateDimensions('height', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                      placeholder="Height"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-800 mb-1">
                      Depth
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.dimensions.depth}
                      onChange={(e) => updateDimensions('depth', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                      placeholder="Depth"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-800 mb-1">
                      Unit
                    </label>
                    <select
                      value={formData.dimensions.unit}
                      onChange={(e) => updateDimensions('unit', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                    >
                      <option value="inches">Inches</option>
                      <option value="cm">Centimeters</option>
                      <option value="mm">Millimeters</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Pricing, Status, Media, Options */}
            <div className="space-y-6">
              {/* Pricing & Inventory */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900 mb-4">
                  Pricing & Inventory
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-800 mb-1">
                      Base Price (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={formData.basePrice}
                      onChange={(e) => updateFormData('basePrice', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-800 mb-1">
                      Offer Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.offerPrice}
                      onChange={(e) => updateFormData('offerPrice', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                      placeholder="Optional"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-800 mb-1">
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.stockQuantity}
                        onChange={(e) => updateFormData('stockQuantity', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-800 mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.weight}
                        onChange={(e) => updateFormData('weight', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                        placeholder="Shipping weight"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-800 mb-1">
                      Delivery Estimate
                    </label>
                    <input
                      type="text"
                      value={formData.deliveryEstimate}
                      onChange={(e) => updateFormData('deliveryEstimate', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                      placeholder="e.g., 3–5 business days"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Media */}
              <div className="space-y-6">
                {/* Status Toggles */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-semibold text-slate-900 mb-4">
                    Status & Visibility
                  </h2>
                  <div className="space-y-3">
                    {[
                      { key: 'isActive' as const, label: 'Active', desc: 'Visible in store', color: 'bg-blue-500' },
                      { key: 'isAvailable' as const, label: 'In Stock', desc: 'Available for purchase', color: 'bg-emerald-500' },
                      { key: 'isFeatured' as const, label: 'Featured', desc: 'Highlight on homepage', color: 'bg-amber-500' },
                      { key: 'isBestSeller' as const, label: 'Best Seller', desc: 'Mark as best seller', color: 'bg-purple-500' },
                      { key: 'isNewArrival' as const, label: 'New Arrival', desc: 'Mark as new product', color: 'bg-pink-500' },
                    ].map(({ key, label, desc, color }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleToggle(key)}
                        className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-left hover:bg-slate-50"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-900">{label}</div>
                          <div className="text-xs text-slate-500">{desc}</div>
                        </div>
                        <div className={`h-6 w-11 rounded-full p-0.5 transition ${formData[key] ? color : 'bg-slate-300'}`}>
                          <div className={`h-5 w-5 rounded-full bg-white shadow transition ${formData[key] ? 'translate-x-5' : ''}`} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Media */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-semibold text-slate-900 mb-4">
                    Media
                  </h2>
                  <AddProductImageUploader
                    images={images}
                    onImagesChange={handleImagesChange}
                    featuredImage={featuredImage}
                    onFeaturedImageChange={handleFeaturedImageChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Size & Style Options */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SizeOptionsEditor
                sizes={formData.sizes}
                onSizesChange={(sizes) => updateFormData('sizes', sizes)}
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <StyleOptionsEditor
                styles={formData.styles}
                onStylesChange={(styles) => updateFormData('styles', styles)}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <TagsInput
              tags={formData.tags}
              onTagsChange={(tags) => updateFormData('tags', tags)}
            />
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-gradient-to-t from-white via-white/95 to-transparent pt-4">
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                <span>{submitting ? 'Creating Product...' : 'Create Product'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}