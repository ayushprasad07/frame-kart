"use client";

import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  id: string;
  title: string;
  basePrice: number;
  offerPrice: number;
  image: string;
  category: string;
  hasOffer: boolean;
}

export default function ProductCard({ 
  id, 
  title, 
  basePrice, 
  offerPrice, 
  image, 
  category,
  hasOffer 
}: ProductCardProps) {
  // Safe price formatting with fallbacks
  const formatPrice = (price: number | undefined): string => {
    if (price === undefined || price === null || isNaN(price)) {
      return 'Price N/A';
    }
    return `₹${price.toLocaleString()}`;
  };

  // Calculate discount percentage safely
  const discountPercent = hasOffer && offerPrice && basePrice && basePrice > 0
    ? Math.round(((basePrice - offerPrice) / basePrice) * 100)
    : 0;

  // Determine if we should show offer (only if both prices exist and offer is lower)
  const shouldShowOffer = hasOffer && basePrice && offerPrice && offerPrice < basePrice;

  return (
    <Link href={`/products/${id}`} className="group block">
      <div className="relative bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.currentTarget;
                target.style.display = 'none';
                // Show the parent's fallback content
                const parent = target.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = 'w-full h-full flex items-center justify-center text-gray-400 text-4xl';
                  fallback.innerHTML = '🖼️';
                  parent.appendChild(fallback);
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
              🖼️
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 shadow-sm">
            {category}
          </div>

          {/* Discount Badge */}
          {shouldShowOffer && discountPercent > 0 && (
            <div className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white rounded-full text-xs font-bold shadow-sm">
              {discountPercent}% OFF
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 min-h-[3rem]">
            {title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {/* Price Display */}
              {shouldShowOffer ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(offerPrice)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(basePrice)}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(basePrice)}
                </span>
              )}
            </div>
            <button 
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
              onClick={(e) => e.preventDefault()} // Prevent link navigation when button is clicked
            >
              View
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}