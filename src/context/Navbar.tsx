'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingCart, Package, Menu, X, Search, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const { cartItems } = useCart();
  const router = useRouter();

  const cartCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  // Categories list
  const categories = [
    { name: 'Wooden Frames', slug: 'wooden' },
    { name: 'Metal Frames', slug: 'metal' },
    { name: 'Canvas Frames', slug: 'canvas' },
    { name: 'Vintage Frames', slug: 'vintage' },
    { name: 'Modern Frames', slug: 'modern' },
    { name: 'Custom Frames', slug: 'custom' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="relative">
      {/* Top Promotional Bar */}
      {/* <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-2 px-4 text-sm text-center">
        <span className="animate-pulse">🎉</span>
        <span className="ml-2 font-medium">Free Shipping on orders above ₹999 | Use code: FRAME20 for 20% OFF</span>
      </div> */}

      {/* Glassmorphic Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50' 
          : 'bg-white/40 backdrop-blur-lg border-b border-gray-200/30'
      } rounded-b-xl`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="relative w-32 h-32 transition-transform duration-300 group-hover:scale-105">
                  <Image 
                    src='/Nova_Crafto.png' 
                    alt='NovaCrafto - Premium Frames & Artwork'
                    fill
                    className="object-contain object-left"
                    priority
                    sizes="(max-width: 768px) 128px, 160px"
                  />
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                href="/"
                className="px-4 py-2 text-neutral-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl font-medium transition-all duration-300"
              >
                Home
              </Link>
              <Link
                href="/products"
                className="px-4 py-2 text-neutral-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl font-medium transition-all duration-300"
              >
                All Products
              </Link>
              
              {/* Categories Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setIsCategoryOpen(true)}
                onMouseLeave={() => setIsCategoryOpen(false)}
              >
                <button className="flex items-center gap-1 px-4 py-2 text-neutral-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl font-medium transition-all duration-300">
                  Categories
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                <div className={`absolute top-full left-0 mt-1 w-56 transition-all duration-200 ${
                  isCategoryOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                }`}>
                  <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 py-2 overflow-hidden">
                    {categories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/products?category=${category.slug}`}
                        className="block px-5 py-2.5 text-neutral-700 hover:text-blue-600 hover:bg-blue-50/70 transition-all duration-200"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex items-center flex-1 max-w-xs mx-6">
              <form onSubmit={handleSearch} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search frames..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100/70 hover:bg-gray-100 focus:bg-white rounded-xl border border-transparent focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-300 text-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </form>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-1">
              {/* Search Toggle - Mobile/Tablet */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 text-neutral-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl transition-all duration-300"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Orders Button */}
              <Link
                href="/orders"
                className="hidden sm:flex items-center space-x-2 px-4 py-2 text-neutral-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl font-medium transition-all duration-300 group"
              >
                <Package className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span>Orders</span>
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex items-center space-x-2 px-4 py-2 text-neutral-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl font-medium transition-all duration-300 group"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-br from-pink-500 to-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden lg:inline">Cart</span>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden flex items-center justify-center w-10 h-10 text-neutral-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl transition-all duration-300"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="lg:hidden px-4 pb-4 bg-white/40 backdrop-blur-lg border-t border-gray-200/30">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search frames..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-4 py-3 bg-gray-100/70 focus:bg-white rounded-xl border border-transparent focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-300"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200/50 bg-white/80 backdrop-blur-xl rounded-b-xl">
            <div className="px-4 py-4 space-y-1">
              <Link
                href="/"
                className="block px-4 py-3 text-neutral-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl font-medium transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/products"
                className="block px-4 py-3 text-neutral-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl font-medium transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                All Products
              </Link>
              
              {/* Mobile Categories */}
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Categories</p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/products?category=${category.slug}`}
                      className="px-3 py-2 text-sm text-neutral-600 hover:text-blue-600 hover:bg-blue-50/70 rounded-lg transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200/50 pt-2 mt-2">
                <Link
                  href="/orders"
                  className="flex items-center space-x-3 px-4 py-3 text-neutral-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl font-medium transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Package className="w-5 h-5" />
                  <span>My Orders</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
      
      {/* Spacer for fixed navbar + promo bar */}
      {/* <div className="h-20"></div> */}
    </header>
  );
}
