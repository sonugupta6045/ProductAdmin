'use client';

import { usePathname } from 'next/navigation';

const ROUTE_LABELS: Record<string, string> = {
  '/products': 'Products',
  '/products/new': 'Add Product',
};

function getBreadcrumb(pathname: string): { label: string; href?: string }[] {
  if (pathname.match(/^\/products\/\d+\/edit$/)) {
    return [
      { label: 'Products', href: '/products' },
      { label: 'Edit Product' },
    ];
  }
  if (pathname.match(/^\/products\/\d+$/)) {
    return [
      { label: 'Products', href: '/products' },
      { label: 'View Product' },
    ];
  }
  const label = ROUTE_LABELS[pathname];
  if (label) return [{ label }];
  return [{ label: 'Dashboard' }];
}

export default function Navbar() {
  const pathname = usePathname();
  const crumbs = getBreadcrumb(pathname);

  return (
    <header className="hidden md:flex items-center justify-between h-14 px-6 bg-white border-b border-gray-200 sticky top-0 z-20">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <span className="text-gray-400 font-medium">Dashboard</span>
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {crumb.href ? (
              <a href={crumb.href} className="text-gray-500 hover:text-gray-900 transition-colors">
                {crumb.label}
              </a>
            ) : (
              <span className="font-semibold text-gray-900">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          className="relative p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200" />

        {/* User avatar */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0 select-none">
            E
          </div>
          <div className="hidden lg:block leading-tight">
            <p className="text-xs font-semibold text-gray-900">Emily</p>
            <p className="text-[11px] text-gray-400">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
