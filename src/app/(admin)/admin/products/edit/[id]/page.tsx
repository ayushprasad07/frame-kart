'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ImageUploader from '@/components/ImageUploader';
import { toast } from 'sonner';

interface SizeOption {
  size: string;
  price: number;
  offerPrice?: number;
}

interface StyleOption {
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
  isActive: boolean;
  isFeatured: boolean;
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
    stockQuantity: '',
    sku: '',
    deliveryEstimate: '',
    weight: '',
    isAvailable: true,
    isActive: true,
    isFeatured: false,
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

      setFormData({
        title: product.title ?? '',
        basePrice: product.basePrice?.toString() ?? '',
        offerPrice: product.offerPrice?.toString() ?? '',
        description: product.description ?? '',
        detailedDescription: product.detailedDescription ?? '',
        category: product.category ?? '',
        subCategory: product.subCategory ?? '',
        material: product.material ?? '',
        stockQuantity: product.stockQuantity?.toString() ?? '',
        sku: product.sku ?? '',
        deliveryEstimate: product.deliveryEstimate ?? '',
        weight: product.weight?.toString() ?? '',
        isAvailable: product.isAvailable ?? true,
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
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
    } finally {
      setLoading(false);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
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

  const handleToggle = (key: 'isAvailable' | 'isActive' | 'isFeatured') => {
    setFormData((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/products/update/${productId}`, {
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
          stockQuantity: Number(formData.stockQuantity || 0),
          sku: formData.sku,
          sizes,
          styles,
          images,
          featuredImage: featuredImage || images[0] || '',
          tags,
          weight: formData.weight ? Number(formData.weight) : null,
          deliveryEstimate: formData.deliveryEstimate || '5-7 business days',
          isAvailable: formData.isAvailable,
          isActive: formData.isActive,
          isFeatured: formData.isFeatured,
          imagesToDelete,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to update product');
      }
      toast.success('Product updated successfully');
      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message || 'Failed to update product');
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
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-blue-500">
              Product Management
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              Edit product
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Update pricing, inventory, media and merchandising details.
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
                      Category
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
                      Material
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
                      SKU
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, sku: e.target.value }))
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
                      Base price (₹)
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
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
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

              {/* Tags */}
              <section className="space-y-3 border-t border-slate-200 pt-5">
                <h2 className="text-sm font-semibold text-slate-900">
                  Tags & merchandising
                </h2>
                <div>
                  <label className="text-xs font-medium text-slate-800">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tagsInput}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, tagsInput: e.target.value }))
                    }
                    onKeyDown={handleTagKeyDown}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                    placeholder="Press Enter to add tag"
                  />
                  {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="group inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-800 hover:bg-slate-200"
                        >
                          <span>#{tag}</span>
                          <span className="text-slate-400 group-hover:text-red-500">
                            ×
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
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
                className="inline-flex items-center gap-2 cursor-pointer rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                <span>{submitting ? 'Saving changes…' : 'Save changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
