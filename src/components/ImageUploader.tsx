'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploaderProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  featuredImage: File | null;
  onFeaturedImageChange: (image: File) => void;
}

export default function ImageUploader({
  images,
  onImagesChange,
  featuredImage,
  onFeaturedImageChange,
}: ImageUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length > 0) {
      // Create previews for new files
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews(prev => ({
            ...prev,
            [file.name]: e.target?.result as string
          }));
        };
        reader.readAsDataURL(file);
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
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews(prev => ({
            ...prev,
            [file.name]: e.target?.result as string
          }));
        };
        reader.readAsDataURL(file);
      });

      const newImages = [...images, ...files];
      onImagesChange(newImages);

      if (!featuredImage && files.length > 0) {
        onFeaturedImageChange(files[0]);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Featured Image */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Featured Image *
        </label>
        {featuredImage ? (
          <div className="flex items-center gap-4 p-4 border border-gray-300 rounded-md">
            <div className="relative w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
              <Image
                src={previews[featuredImage.name] || URL.createObjectURL(featuredImage)}
                alt="Featured"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {featuredImage.name}
              </p>
              <p className="text-sm text-gray-500">
                {(featuredImage.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              Featured
            </span>
          </div>
        ) : (
          <div className="p-8 border-2 border-dashed border-gray-300 rounded-md text-center">
            <p className="text-gray-500">No featured image selected</p>
            <p className="text-sm text-gray-400 mt-1">
              Select images below and set one as featured
            </p>
          </div>
        )}
      </div>

      {/* Image Upload Area */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Product Images *
        </label>
        
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
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
              className="mx-auto h-12 w-12 text-gray-400"
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
              <p className="text-sm font-medium text-gray-900">
                Drag and drop images here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, GIF up to 10MB each
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Selected Images ({images.length})
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={`${image.name}-${index}`}
                className="relative group border border-gray-200 rounded-md overflow-hidden"
              >
                <div className="relative h-24 bg-gray-100">
                  <Image
                    src={previews[image.name] || URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
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
}