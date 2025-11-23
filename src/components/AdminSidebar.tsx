'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
      <nav className="space-y-2">
        <Link
          href="/admin/products"
          className={`block px-4 py-3 rounded-lg transition-colors ${
            isActive('/admin/products')
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          Products
        </Link>
        <Link
          href="/admin/orders"
          className={`block px-4 py-3 rounded-lg transition-colors ${
            isActive('/admin/orders')
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          Orders
        </Link>
        <Link
          href="/"
          className="block px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors mt-8"
        >
          ← Back to Store
        </Link>
      </nav>
    </aside>
  );
}

