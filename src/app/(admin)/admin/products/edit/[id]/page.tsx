'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ImageUploader from '@/components/ImageUploader';
import { toast } from 'sonner';
import { getCategoryOptions, getStyleOptions, getOccasionOptions } from '@/constants/products';
import { Plus, Trash2, X } from 'lucide-react';

interface SizeOption {
  size: string;
  price: number;
  offerPrice?: number;
  dimensions?: {
    width?: number;
    height?: number;
    unit: string;
  };
}

interface StyleOption {
  name: string;
  additionalPrice?: number;
}

interface Dimensions {
  width?: number;
  height?: number;
  depth?: number;
  unit: string;
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
  sizes: SizeOption[];
  styles: StyleOption[];
  images: string[];
  featuredImage: string;
  tags: string[];
  weight?: number;
  deliveryEstimate: string;
  dimensions?: Dimensions;
  frameType?: 'wall' | 'tabletop' | 'standing';
  shape?: 'square' | 'rectangle' | 'round' | 'oval' | 'heart';
  mountingType?: string;
  hasGlass?: boolean;
  glassType?: 'standard' | 'non-glare' | 'uv-protected' | 'acrylic';
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

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
    deliveryEstimate: '5-7 business days',
    weight: '',
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
    tagsInput: '',
  });

  const [sizes, setSizes] = useState<SizeOption[]>([]);
  const [styles, setStyles] = useState<StyleOption[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState<string>('');
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get options from constants
  const categoryOptions = getCategoryOptions();
  const styleOptions = getStyleOptions();
  const occasionOptions = getOccasionOptions();

  useEffect(() => {
    if (!productId) return;
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load product');
      }

      const product: Product = data.product;

      // Format dimensions for form
      const dimensions = product.dimensions || { width: undefined, height: undefined, depth: undefined, unit: 'inches' };

      setFormData({
        title: product.title ?? '',
        basePrice: product.basePrice?.toString() ?? '',
        offerPrice: product.offerPrice?.toString() ?? '',
        description: product.description ?? '',
        detailedDescription: product.detailedDescription ?? '',
        category: product.category ?? '',
        subCategory: product.subCategory ?? '',
        material: product.material ?? '',
        style: product.style ?? '',
        occasion: product.occasion ?? '',
        stockQuantity: product.stockQuantity?.toString() ?? '',
        sku: product.sku ?? '',
        deliveryEstimate: product.deliveryEstimate ?? '5-7 business days',
        weight: product.weight?.toString() ?? '',
        dimensions: {
          width: dimensions.width?.toString() ?? '',
          height: dimensions.height?.toString() ?? '',
          depth: dimensions.depth?.toString() ?? '',
          unit: dimensions.unit ?? 'inches',
        },
        frameType: product.frameType ?? '',
        shape: product.shape ?? '',
        mountingType: product.mountingType ?? '',
        hasGlass: product.hasGlass ?? false,
        glassType: product.glassType ?? '',
        isAvailable: product.isAvailable ?? true,
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
        isBestSeller: product.isBestSeller ?? false,
        isNewArrival: product.isNewArrival ?? false,
        tagsInput: '',
      });

      setSizes(product.sizes || []);
      setStyles(product.styles || []);
      setTags(product.tags || []);
      setImages(product.images || []);
      setFeaturedImage(product.featuredImage || '');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load product');
      toast.error(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = formData.tagsInput.trim();
      if (!value) return;
      if (!tags.includes(value)) setTags((prev) => [...prev, value]);
      setFormData((prev) => ({ ...prev, tagsInput: '' }));
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleToggle = (key: 'isAvailable' | 'isActive' | 'isFeatured' | 'isBestSeller' | 'isNewArrival' | 'hasGlass') => {
    setFormData((prev: any) => ({ ...prev, [key]: !prev[key] }));
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

  // Size and Style Editors
  const addSize = () => {
    setSizes([...sizes, { 
      size: '', 
      price: 0, 
      offerPrice: undefined,
      dimensions: { width: undefined, height: undefined, unit: 'inches' }
    }]);
  };

  const updateSize = (index: number, field: string, value: any) => {
    const newSizes = [...sizes];
    if (field.includes('dimensions.')) {
      const dimField = field.split('.')[1];
      if (!newSizes[index].dimensions) {
        newSizes[index].dimensions = { unit: 'inches' };
      }
      newSizes[index].dimensions = { 
        ...newSizes[index].dimensions, 
        [dimField]: value === '' ? undefined : Number(value)
      };
    } else if (field === 'offerPrice') {
      newSizes[index] = { 
        ...newSizes[index], 
        [field]: value === '' ? undefined : Number(value) 
      };
    } else if (field === 'price') {
      newSizes[index] = { 
        ...newSizes[index], 
        [field]: Number(value) 
      };
    } else {
      newSizes[index] = { ...newSizes[index], [field]: value };
    }
    setSizes(newSizes);
  };

  const removeSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const addStyle = () => {
    setStyles([...styles, { name: '', additionalPrice: 0 }]);
  };

  const updateStyle = (index: number, field: string, value: any) => {
    const newStyles = [...styles];
    if (field === 'additionalPrice') {
      newStyles[index] = { 
        ...newStyles[index], 
        [field]: value === '' ? 0 : Number(value) 
      };
    } else {
      newStyles[index] = { ...newStyles[index], [field]: value };
    }
    setStyles(newStyles);
  };

  const removeStyle = (index: number) => {
    setStyles(styles.filter((_, i) => i !== index));
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

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          basePrice: Number(formData.basePrice),
          offerPrice: formData.offerPrice ? Number(formData.offerPrice) : null,
          description: formData.description,
          detailedDescription: formData.detailedDescription || undefined,
          category: formData.category,
          subCategory: formData.subCategory || undefined,
          material: formData.material,
          style: formData.style || undefined,
          occasion: formData.occasion || undefined,
          stockQuantity: Number(formData.stockQuantity || 0),
          sku: formData.sku,
          sizes: sizes.map(size => ({
            size: size.size,
            price: Number(size.price),
            offerPrice: size.offerPrice ? Number(size.offerPrice) : undefined,
            dimensions: size.dimensions ? {
              width: size.dimensions.width ? Number(size.dimensions.width) : undefined,
              height: size.dimensions.height ? Number(size.dimensions.height) : undefined,
              unit: size.dimensions.unit || 'inches'
            } : undefined
          })),
          styles: styles.map(style => ({
            name: style.name,
            additionalPrice: style.additionalPrice ? Number(style.additionalPrice) : 0
          })),
          images,
          featuredImage: featuredImage || images[0] || '',
          tags,
          weight: formData.weight ? Number(formData.weight) : null,
          deliveryEstimate: formData.deliveryEstimate || '5-7 business days',
          dimensions: formData.dimensions.width || formData.dimensions.height ? {
            width: formData.dimensions.width ? Number(formData.dimensions.width) : undefined,
            height: formData.dimensions.height ? Number(formData.dimensions.height) : undefined,
            depth: formData.dimensions.depth ? Number(formData.dimensions.depth) : undefined,
            unit: formData.dimensions.unit
          } : undefined,
          frameType: formData.frameType || undefined,
          shape: formData.shape || undefined,
          mountingType: formData.mountingType || undefined,
          hasGlass: formData.hasGlass,
          glassType: formData.glassType || undefined,
          isAvailable: formData.isAvailable,
          isActive: formData.isActive,
          isFeatured: formData.isFeatured,
          isBestSeller: formData.isBestSeller,
          isNewArrival: formData.isNewArrival,
          imagesToDelete,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to update product');
      }
      toast.success('Product updated successfully');
      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message || 'Failed to update product');
      toast.error(err.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md w-full rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <div>
              <p className="text-sm font-medium text-slate-900">
                Loading product
              </p>
              <p className="text-xs text-slate-500">
                Fetching latest details, please wait…
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-blue-500">
              Product Management
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              Edit Product
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Update product details, pricing, inventory, and media.
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
            {/* Left column - Basic info, Frame Details, Dimensions */}
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
                        {categoryOptions.map((cat) => (
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
                        {styleOptions.map((style) => (
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
                        {occasionOptions.map((occasion) => (
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

              {/* Size & Style Options */}
              <div className="space-y-6">
                {/* Size Options */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-slate-900">
                      Size Options
                    </h2>
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
                                value={size.price || ''}
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
                                value={size.offerPrice || ''}
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

                {/* Style Options */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-slate-900">
                      Style Options
                    </h2>
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
                                value={style.additionalPrice || ''}
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

                {/* Tags */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-semibold text-slate-900 mb-4">
                    Tags
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        value={formData.tagsInput}
                        onChange={(e) => updateFormData('tagsInput', e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                        placeholder="Type tag and press Enter or comma"
                      />
                      <p className="mt-1 text-xs text-slate-500">Press Enter or comma to add tags</p>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Media */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-semibold text-slate-900 mb-4">
                    Media
                  </h2>
                  <ImageUploader
                    images={images}
                    onImagesChange={(imgs) => {
                      setImages(imgs);
                      if (!featuredImage && imgs.length > 0) {
                        setFeaturedImage(imgs[0]);
                      }
                    }}
                    onImagesDelete={setImagesToDelete}
                    featuredImage={featuredImage}
                    onFeaturedChange={setFeaturedImage}
                  />
                </div>
              </div>
            </div>
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
                <span>{submitting ? 'Saving Changes...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}