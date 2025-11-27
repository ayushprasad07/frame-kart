'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';


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
      // Create previews for new files
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

      // Add new files to images
      const newImages = [...images, ...files];
      onImagesChange(newImages);

      // Set first image as featured if none is set
      if (!featuredImage && files.length > 0) {
        onFeaturedImageChange(files[0]);
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const fileToRemove = images[index];
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);

    // Remove preview
    setPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[fileToRemove.name];
      return newPreviews;
    });

    // If removed image was featured, set new featured image
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
      {/* Featured Image */}
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

      {/* Image Upload Area */}
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
            <svg
              className="mx-auto h-10 w-10 text-slate-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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

      {/* Image Previews */}
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
    stockQuantity: '',
    sku: '',
    weight: '',
    deliveryEstimate: '5-7 business days',
    isAvailable: true,
    isActive: true,
    isFeatured: false,
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

  const handleToggle = (key: 'isAvailable' | 'isActive' | 'isFeatured') => {
    setFormData((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
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

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.message);
      }
      toast.success('Product created successfully');
      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
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

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          encType="multipart/form-data"
        >
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Top layout: main + side */}
          <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.25fr)]">
            {/* Main card */}
            <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              {/* Basic info */}
              <section className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Basic information
                  </h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
                    Required
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="flex items-center justify-between text-xs font-medium text-slate-800">
                      <span>Product title</span>
                      <span className="text-[10px] text-slate-500">
                        Max 200 characters
                      </span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, title: e.target.value }))
                      }
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                      placeholder="E.g. Abstract wall art print"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-800">
                      Category *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, category: e.target.value }))
                      }
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                      placeholder="Main category"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-800">
                      Sub category
                    </label>
                    <input
                      type="text"
                      value={formData.subCategory}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          subCategory: e.target.value,
                        }))
                      }
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-800">
                      Material *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.material}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, material: e.target.value }))
                      }
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                      placeholder="E.g. Canvas, premium paper"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-800">
                      SKU *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, sku: e.target.value.toUpperCase() }))
                      }
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                      placeholder="Unique identifier"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center justify-between text-xs font-medium text-slate-800">
                    <span>Short description</span>
                    <span className="text-[10px] text-slate-500">
                      Shown on listing cards
                    </span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                    placeholder="Describe the product in 1–2 sentences."
                  />
                </div>

                <div>
                  <label className="flex items-center justify-between text-xs font-medium text-slate-800">
                    <span>Detailed description</span>
                    <span className="text-[10px] text-slate-500">
                      Markdown & rich copy supported
                    </span>
                  </label>
                  <textarea
                    rows={5}
                    value={formData.detailedDescription}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        detailedDescription: e.target.value,
                      }))
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                    placeholder="Add detailed specs, care instructions, etc."
                  />
                </div>
              </section>

              {/* Pricing & Inventory */}
              <section className="space-y-4 border-t border-slate-200 pt-5">
                <h2 className="text-sm font-semibold text-slate-900">
                  Pricing & inventory
                </h2>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-xs font-medium text-slate-800">
                      Base price (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={formData.basePrice}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          basePrice: e.target.value,
                        }))
                      }
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-800">
                      Offer price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.offerPrice}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          offerPrice: e.target.value,
                        }))
                      }
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-800">
                      Stock quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stockQuantity}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          stockQuantity: e.target.value,
                        }))
                      }
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-xs font-medium text-slate-800">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, weight: e.target.value }))
                      }
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                      placeholder="For shipping calculations"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-slate-800">
                      Delivery estimate
                    </label>
                    <input
                      type="text"
                      value={formData.deliveryEstimate}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          deliveryEstimate: e.target.value,
                        }))
                      }
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                      placeholder="e.g. 3–5 business days"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Side card: Status + media */}
            <div className="space-y-6">
              {/* Status toggles */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-slate-900">
                  Visibility & status
                </h2>
                <div className="space-y-3 text-xs text-slate-800">
                  <button
                    type="button"
                    onClick={() => handleToggle('isActive')}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-left hover:border-blue-500/80 hover:bg-blue-50"
                  >
                    <span>
                      <span className="block text-xs font-medium">
                        Active
                      </span>
                      <span className="mt-0.5 block text-[11px] text-slate-500">
                        Controls if product is visible in store.
                      </span>
                    </span>
                    <span
                      className={`inline-flex h-5 w-9 items-center rounded-full p-0.5 transition ${
                        formData.isActive ? 'bg-blue-500' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`h-3.5 w-3.5 rounded-full bg-white shadow transition ${
                          formData.isActive ? 'translate-x-4' : ''
                        }`}
                      />
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggle('isAvailable')}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-left hover:border-blue-500/80 hover:bg-blue-50"
                  >
                    <span>
                      <span className="block text-xs font-medium">
                        In stock
                      </span>
                      <span className="mt-0.5 block text-[11px] text-slate-500">
                        Toggle purchasing availability.
                      </span>
                    </span>
                    <span
                      className={`inline-flex h-5 w-9 items-center rounded-full p-0.5 transition ${
                        formData.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`h-3.5 w-3.5 rounded-full bg-white shadow transition ${
                          formData.isAvailable ? 'translate-x-4' : ''
                        }`}
                      />
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggle('isFeatured')}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-left hover:border-blue-500/80 hover:bg-blue-50"
                  >
                    <span>
                      <span className="block text-xs font-medium">
                        Featured
                      </span>
                      <span className="mt-0.5 block text-[11px] text-slate-500">
                        Highlight on home & category pages.
                      </span>
                    </span>
                    <span
                      className={`inline-flex h-5 w-9 items-center rounded-full p-0.5 transition ${
                        formData.isFeatured ? 'bg-amber-400' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`h-3.5 w-3.5 rounded-full bg-white shadow transition ${
                          formData.isFeatured ? 'translate-x-4' : ''
                        }`}
                      />
                    </span>
                  </button>
                </div>
              </div>

              {/* Media */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Media
                  </h2>
                  <span className="text-[10px] text-slate-500">
                    Max 10 images
                  </span>
                </div>

                <AddProductImageUploader
                  images={images}
                  onImagesChange={handleImagesChange}
                  featuredImage={featuredImage}
                  onFeaturedImageChange={handleFeaturedImageChange}
                />

                {featuredImage && (
                  <p className="mt-2 text-[11px] text-slate-500">
                    Featured image is used on primary product card.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-gradient-to-t from-white via-white/95 to-transparent pt-4">
            <div className="mx-auto flex max-w-5xl items-center justify-end gap-3 pb-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                <span>{submitting ? 'Creating product…' : 'Create Product'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}