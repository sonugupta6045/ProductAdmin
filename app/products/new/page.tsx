'use client';

import { Suspense, useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import ProductForm from '@/components/ProductForm';
import { Product } from '@/types';

/**
 * We maintain a ref to the "add" callback so ProductForm can call it.
 * Since /products/new doesn't use useProducts (no list context here),
 * we just navigate back — the product list will show the new item
 * via the addProduct optimistic update triggered from ProductForm → router.push('/products').
 *
 * The actual optimistic add happens via the products page re-fetch
 * (new product appears at the top as DummyJSON returns id:194 for new items).
 */
function NewProductContent() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/products" className="btn-ghost px-2" aria-label="Back">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add product</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fill in the details below to create a new product</p>
        </div>
      </div>
      <div className="card">
        <ProductForm />
      </div>
    </div>
  );
}

export default function NewProductPage() {
  return (
    <Suspense>
      <NewProductContent />
    </Suspense>
  );
}
