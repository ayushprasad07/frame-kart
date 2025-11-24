'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/ImageUploader';
import { motion } from 'framer-motion';

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
        throw new Error(errorData.error || 'Failed to create product');
      }

      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-28">
      <motion.h1
        className="text-4xl font-extrabold text-gray-900 mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        Add New Product
      </motion.h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-10 max-w-4xl w-full"
        encType="multipart/form-data"
      >
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-300 rounded-md text-red-700 font-medium">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-5 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-lg"
              placeholder="Enter product title"
            />
          </div>

          {/* Price Row */}
          <div className="flex gap-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Base Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.basePrice}
                onChange={e => setFormData(prev => ({ ...prev, basePrice: e.target.value }))}
                className="w-full px-5 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-lg"
                placeholder="Enter base price"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Offer Price (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.offerPrice}
                onChange={e => setFormData(prev => ({ ...prev, offerPrice: e.target.value }))}
                className="w-full px-5 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-lg"
                placeholder="Enter offer price (optional)"
              />
            </div>
          </div>

          {/* Category Row */}
          <div className="flex gap-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Category *
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Frames, Artwork, Accessories"
                className="w-full px-5 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-lg"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Sub Category
              </label>
              <input
                type="text"
                value={formData.subCategory}
                onChange={e => setFormData(prev => ({ ...prev, subCategory: e.target.value }))}
                placeholder="e.g., Wooden Frames, Digital Art"
                className="w-full px-5 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-lg"
              />
            </div>
          </div>

          {/* Material and SKU Row */}
          <div className="flex gap-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Material *
              </label>
              <input
                type="text"
                required
                value={formData.material}
                onChange={e => setFormData(prev => ({ ...prev, material: e.target.value }))}
                placeholder="e.g., Wood, Metal, Canvas"
                className="w-full px-5 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-lg"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                SKU *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={e => setFormData(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                placeholder="e.g., PROD-001"
                className="w-full px-5 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-lg"
              />
            </div>
          </div>

          {/* Stock Quantity and Weight Row */}
          <div className="flex gap-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={e => setFormData(prev => ({ ...prev, stockQuantity: e.target.value }))}
                placeholder="Enter stock quantity"
                className="w-full px-5 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-lg"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Weight (kg)
              </label>
              <input
                type="number"
                min="0"
                value={formData.weight}
                onChange={e => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="Enter product weight"
                className="w-full px-5 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-lg"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter product description"
              className="w-full px-5 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none text-lg"
            />
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Detailed Description
            </label>
            <textarea
              rows={6}
              value={formData.detailedDescription}
              onChange={e => setFormData(prev => ({ ...prev, detailedDescription: e.target.value }))}
              placeholder="Enter detailed product description (optional)"
              className="w-full px-5 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none text-lg"
            />
          </div>

          {/* ImageUploader component */}
          <ImageUploader
            images={images}
            onImagesChange={handleImagesChange}
            featuredImage={featuredImage}
            onFeaturedImageChange={handleFeaturedImageChange}
          />

          {/* Form buttons */}
          <div className="flex gap-6 mt-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition text-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-4 bg-black text-white rounded-md hover:bg-gray-900 transition disabled:opacity-50 text-lg font-semibold"
            >
              {submitting ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
