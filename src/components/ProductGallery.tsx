'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  title: string;
  featuredImage?: string;
  className?: string;
}

export default function ProductGallery({ images, title, featuredImage, className }: ProductGalleryProps) {
  // Deduplicate images - filter out featuredImage from images array to prevent duplicates
  const uniqueImages = featuredImage 
    ? [featuredImage, ...images.filter(img => img !== featuredImage)]
    : images;
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [showZoomHint, setShowZoomHint] = useState(true);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const zoomedImageRef = useRef<HTMLDivElement>(null);

  const selectedImage = uniqueImages[selectedIndex] || '';

  useEffect(() => {
    // Hide zoom hint after 3 seconds
    const timer = setTimeout(() => setShowZoomHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Helper function to get the correct image path
  const getImagePath = (image: string) => {
    if (!image) return '/placeholder-image.jpg';
    if (image.startsWith('http') || image.startsWith('/')) {
      return image;
    }
    return `/uploads/products/${image}`;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Clamp values between 0 and 100
    setZoomPosition({ 
      x: Math.max(0, Math.min(100, x)), 
      y: Math.max(0, Math.min(100, y)) 
    });
  };

  const handleMouseEnter = () => {
    setIsZooming(true);
    setShowZoomHint(false);
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
    setZoomPosition({ x: 50, y: 50 });
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex(prev => (prev === 0 ? uniqueImages.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex(prev => (prev === uniqueImages.length - 1 ? 0 : prev + 1));
  };

  // Handle click outside zoomed image
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        zoomedImageRef.current && 
        !zoomedImageRef.current.contains(e.target as Node) &&
        isZooming
      ) {
        setIsZooming(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isZooming]);

  if (uniqueImages.length === 0) {
    return (
      <div className={`w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center ${className || ''}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No image available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col gap-4 ${className || ''}`}>
      {/* Main Image Container with Zoom */}
      <div className="relative group">
        <div
          ref={imageContainerRef}
          className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 cursor-crosshair"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
        >
          {/* Base Image */}
          <Image
            src={getImagePath(selectedImage)}
            alt={`${title} - Image ${selectedIndex + 1}`}
            fill
            className={`object-cover transition-all duration-300 ${isZooming ? 'opacity-0 lg:opacity-100' : 'opacity-100'}`}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={selectedIndex === 0}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-image.jpg';
            }}
          />
          
          {/* Mobile Zoom Overlay - shows zoomed image in place */}
          <div
            className={`absolute inset-0 lg:hidden transition-opacity duration-200 ${isZooming ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            style={{
              backgroundImage: `url(${getImagePath(selectedImage)})`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundSize: '200%',
              backgroundRepeat: 'no-repeat',
            }}
          />

          {/* Zoom Lens Indicator (Desktop) */}
          {isZooming && (
            <div 
              className="hidden lg:block absolute w-32 h-32 border-2 border-blue-500 bg-blue-500/10 pointer-events-none rounded-lg transition-all duration-75 z-40"
              style={{
                left: `calc(${zoomPosition.x}% - 64px)`,
                top: `calc(${zoomPosition.y}% - 64px)`,
                transform: `translate(${zoomPosition.x < 15 ? '30px' : zoomPosition.x > 85 ? '-30px' : '0'}, ${zoomPosition.y < 15 ? '30px' : zoomPosition.y > 85 ? '-30px' : '0'})`,
              }}
            />
          )}

          {/* Zoom Hint */}
          {showZoomHint && !isZooming && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/70 backdrop-blur-sm text-white text-sm rounded-full animate-pulse z-30">
              <ZoomIn className="w-4 h-4" />
              <span>Hover to zoom</span>
            </div>
          )}

          {/* Navigation Arrows */}
          {uniqueImages.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 hover:shadow-xl z-30"
                aria-label="Previous image"
                type="button"
              >
                <ChevronLeft className="w-5 h-5 text-gray-800" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 hover:shadow-xl z-30"
                aria-label="Next image"
                type="button"
              >
                <ChevronRight className="w-5 h-5 text-gray-800" />
              </button>
            </>
          )}

          {/* Image Counter Badge */}
          {uniqueImages.length > 1 && (
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-sm font-medium rounded-full z-30">
              {selectedIndex + 1} / {uniqueImages.length}
            </div>
          )}
        </div>

        {/* Zoomed Image Container - Fixed z-index to be above everything */}
        {isZooming && (
          <div 
            ref={zoomedImageRef}
            className="hidden lg:block absolute left-full top-0 ml-4 w-[450px] h-[450px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-100"
            style={{
              // Ensure it doesn't go off-screen on smaller screens
              maxWidth: 'calc(100vw - 2rem)',
              left: '100%',
              transform: 'translateX(16px)',
            }}
          >
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url(${getImagePath(selectedImage)})`,
                backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                backgroundSize: '250%',
                backgroundRepeat: 'no-repeat',
              }}
            />
            {/* Zoom Level Indicator */}
            <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full z-10">
              2.5x Zoom
            </div>
            {/* Close Button */}
            <button
              onClick={() => setIsZooming(false)}
              className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-sm text-white rounded-full hover:bg-black/80 transition-colors z-10"
              aria-label="Close zoom"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Thumbnails Strip */}
      {uniqueImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide z-20">
          {uniqueImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden transition-all duration-200 z-20 ${
                selectedIndex === index
                  ? 'ring-2 ring-blue-600 ring-offset-2 scale-105 shadow-lg'
                  : 'border-2 border-gray-200 hover:border-blue-400 hover:shadow-md'
              }`}
              type="button"
            >
              <Image
                src={getImagePath(image)}
                alt={`${title} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-image.jpg';
                }}
              />
              {/* Active Indicator Overlay */}
              {selectedIndex === index && (
                <div className="absolute inset-0 bg-blue-600/10" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}