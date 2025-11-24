'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ShoppingCart, Package, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext'; // Assuming you have this context

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartItems } = useCart(); // Get cart items from context

  // Calculate total quantity dynamically
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="relative">
      {/* Glassmorphic Navbar */}
      <nav className="fixed top-0 text-white w-full z-50 border-b border-gray-200/50 shadow-sm bg-white/40 backdrop-blur-lg backdrop-filter rounded-b-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  F
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FrameKart
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex text-white items-center space-x-1">
              <Link
                href="/products"
                className="px-4 py-2 text-neutral-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg font-medium transition-all duration-300"
              >
                Products
              </Link>
              <Link
                href="/"
                className="px-4 py-2 text-neutral-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg font-medium transition-all duration-300"
              >
                Home
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
                      {cartCount}
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
                href="/products"
                className="block px-4 py-3 text-neutral-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg font-medium transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/products?category=frames"
                className="block px-4 py-3 text-neutral-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg font-medium transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Frames
              </Link>
              <Link
                href="/products?category=artwork"
                className="block px-4 py-3 text-neutral-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg font-medium transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Artwork
              </Link>
              <Link
                href="/products?category=accessories"
                className="block px-4 py-3 text-neutral-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg font-medium transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Accessories
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
    </header>
  );
}
