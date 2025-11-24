'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  title: string;
  featuredImage?: string; // Add featuredImage as optional prop
}

export default function ProductGallery({ images, title, featuredImage }: ProductGalleryProps) {
  // Use featuredImage as the first image if available, otherwise use the first image from images array
  const allImages = featuredImage ? [featuredImage, ...images] : images;
  const [selectedImage, setSelectedImage] = useState(allImages[0] || '');

  if (allImages.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No image available</p>
      </div>
    );
  }

  // Helper function to get the correct image path
  const getImagePath = (image: string) => {
    if (image.startsWith('http') || image.startsWith('/')) {
      return image;
    }
    return `/uploads/products/${image}`;
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={getImagePath(selectedImage)}
          alt={title}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(image)}
              className={`relative h-24 bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === image
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Image
                src={getImagePath(image)}
                alt={`${title} - Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 10vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}