'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploaderProps {
  images: string[]; // Changed from File[] to string[] (URLs)
  onImagesChange: (images: string[]) => void;
  onImagesDelete?: (images: string[]) => void; // Added this prop
  featuredImage: string; // Changed from File | null to string
  onFeaturedChange: (image: string) => void; // Changed prop name
}

export default function ImageUploader({
  images,
  onImagesChange,
  onImagesDelete,
  featuredImage,
  onFeaturedChange,
}: ImageUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]); // Track images marked for deletion

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length > 0) {
      // Create previews for new files
      const newPreviews: { [key: string]: string } = {};
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews[file.name] = e.target?.result as string;
          setPreviews(prev => ({ ...prev, ...newPreviews }));
        };
        reader.readAsDataURL(file);
      });

      // Store local files for preview
      setLocalFiles(prev => [...prev, ...files]);

      // Create temporary URLs for the new images
      const newImageUrls = files.map(file => URL.createObjectURL(file));
      
      // Combine existing images with new ones
      const updatedImages = [...images, ...newImageUrls];
      onImagesChange(updatedImages);

      // Set first image as featured if none is set
      if (!featuredImage && newImageUrls.length > 0) {
        onFeaturedChange(newImageUrls[0]);
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const imageToRemove = images[index];
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);

    // If it's a local file (new upload), clean up the object URL
    if (imageToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove);
      // Also remove from local files
      setLocalFiles(prev => prev.filter(file => 
        URL.createObjectURL(file) !== imageToRemove
      ));
    } else {
      // If it's an existing image from server, add to delete list
      const updatedImagesToDelete = [...imagesToDelete, imageToRemove];
      setImagesToDelete(updatedImagesToDelete);
      onImagesDelete?.(updatedImagesToDelete);
    }

    // If removed image was featured, set new featured image
    if (featuredImage === imageToRemove) {
      onFeaturedChange(newImages[0] || '');
    }
  };

  const setAsFeatured = (image: string) => {
    onFeaturedChange(image);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    if (files.length > 0) {
      // Create previews for new files
      const newPreviews: { [key: string]: string } = {};
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews[file.name] = e.target?.result as string;
          setPreviews(prev => ({ ...prev, ...newPreviews }));
        };
        reader.readAsDataURL(file);
      });

      // Store local files
      setLocalFiles(prev => [...prev, ...files]);

      // Create temporary URLs
      const newImageUrls = files.map(file => URL.createObjectURL(file));
      const updatedImages = [...images, ...newImageUrls];
      onImagesChange(updatedImages);

      if (!featuredImage && newImageUrls.length > 0) {
        onFeaturedChange(newImageUrls[0]);
      }
    }
  };

  // Helper to get image source for display
  const getImageSrc = (image: string) => {
    if (image.startsWith('blob:')) {
      return image; // Local file blob URL
    }
    // For existing images, you might want to prepend your base URL
    return image;
  };

  // Helper to get image name for display
  const getImageName = (image: string, index: number) => {
    if (image.startsWith('blob:')) {
      const correspondingFile = localFiles.find(file => 
        URL.createObjectURL(file) === image
      );
      return correspondingFile?.name || `image-${index + 1}`;
    }
    return image.split('/').pop() || `image-${index + 1}`;
  };

  return (
    <div className="space-y-6">
      {/* Featured Image */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 text-slate-200">
          Featured Image *
        </label>
        {featuredImage ? (
          <div className="flex items-center gap-4 p-4 border border-slate-700 rounded-md bg-slate-800/50">
            <div className="relative w-20 h-20 bg-slate-700 rounded-md overflow-hidden">
              <Image
                src={getImageSrc(featuredImage)}
                alt="Featured"
                fill
                className="object-cover"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.src = '/api/placeholder/80/80';
                }}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-100">
                {getImageName(featuredImage, images.indexOf(featuredImage))}
              </p>
              <p className="text-sm text-slate-400">
                Featured image
              </p>
            </div>
            <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
              Featured
            </span>
          </div>
        ) : (
          <div className="p-8 border-2 border-dashed border-slate-600 rounded-md text-center bg-slate-800/30">
            <p className="text-slate-400">No featured image selected</p>
            <p className="text-sm text-slate-500 mt-1">
              Select images below and set one as featured
            </p>
          </div>
        )}
      </div>

      {/* Image Upload Area */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 text-slate-200">
          Product Images *
        </label>
        
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-600 rounded-md p-6 text-center hover:border-slate-400 transition-colors cursor-pointer bg-slate-800/30"
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
              className="mx-auto h-12 w-12 text-slate-500"
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
              <p className="text-sm font-medium text-slate-200">
                Drag and drop images here, or click to select
              </p>
              <p className="text-sm text-slate-400">
                PNG, JPG, GIF up to 10MB each
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 text-slate-200">
            Selected Images ({images.length})
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="relative group border border-slate-600 rounded-md overflow-hidden bg-slate-800/50"
              >
                <div className="relative h-24 bg-slate-700">
                  <Image
                    src={getImageSrc(image)}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/api/placeholder/96/96';
                    }}
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