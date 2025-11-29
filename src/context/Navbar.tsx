'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ShoppingCart, Package, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext'; // Assuming you have this context
import Image from 'next/image';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartItems } = useCart(); // Get cart items from context

  // Calculate total quantity dynamically
  const cartCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <header className="relative">
      {/* Glassmorphic Navbar */}
      <nav className="fixed top-0 text-white w-full z-50 border-b border-gray-200/50 shadow-sm bg-white/40 backdrop-blur-lg backdrop-filter rounded-b-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center content-center">
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
            <div className="hidden md:flex text-white items-center space-x-1">
              <Link
                href="/"
                className="px-4 py-2 text-neutral-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg font-medium transition-all duration-300"
              >
                Home
              </Link>
              <Link
                href="/products"
                className="px-4 py-2 text-neutral-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg font-medium transition-all duration-300"
              >
                Products
              </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2">
              {/* Orders Button */}
              <Link
                href="/orders"
                className="hidden sm:flex items-center space-x-2 px-4 py-2 text-neutral-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg font-medium transition-all duration-300 group"
              >
                <Package className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span>Orders</span>
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex items-center space-x-2 px-4 py-2 text-neutral-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg font-medium transition-all duration-300 group"
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
                className="md:hidden flex items-center justify-center w-10 h-10 text-neutral-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-300"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu with Glassmorphism */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200/50 bg-white/40 backdrop-blur-lg backdrop-filter rounded-b-xl">
            <div className="px-4 py-4 space-y-2">
              <Link
                href="/"
                className="block px-4 py-3 text-neutral-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg font-medium transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/products"
                className="block px-4 py-3 text-neutral-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg font-medium transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                All Products
              </Link>
              

              <div className="border-t border-gray-200/50 pt-2 mt-2">
                <Link
                  href="/orders"
                  className="flex items-center space-x-3 px-4 py-3 text-neutral-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg font-medium transition-all duration-300"
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
      
      {/* Spacer to prevent content from going behind fixed navbar */}
      <div className="h-16"></div>
    </header>
  );
}