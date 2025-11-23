import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
}

export default function ProductCard({ id, title, price, image, category }: ProductCardProps) {
  return (
    <Link href={`/products/${id}`} className="group">
      <div className="relative bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
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
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
            {title}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-gray-900">₹{price.toLocaleString()}</span>
            <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              View
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
