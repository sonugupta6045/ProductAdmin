'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useProducts } from '@/lib/hooks/useProducts';
import { Product } from '@/types';
import AsyncState from '@/components/AsyncState';
import ProductTable from '@/components/ProductTable';
import ProductCards from '@/components/ProductCards';

function ProductsContent() {
  const {
    products,
    total,
    loading,
    error,
    page,
    limit,
    retry,
  } = useProducts();

  // Basic mock delete handler for now
  const [toDelete, setToDelete] = useState<Product | null>(null);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total > 0 ? `${total} products total` : 'Manage your product catalogue'}
          </p>
        </div>
        <Link href="/products/new" className="btn-primary">
          Add product
        </Link>
      </div>

      {toDelete && (
        <div className="bg-amber-100 text-amber-800 p-4 mb-4 rounded-lg">
          Requested delete for: {toDelete.title} (Delete functionality coming in a later step)
          <button className="ml-4 underline" onClick={() => setToDelete(null)}>Dismiss</button>
        </div>
      )}

      <AsyncState
        loading={loading}
        error={error}
        empty={!loading && !error && products.length === 0}
        onRetry={retry}
        skeletonRows={limit}
      >
        <ProductTable products={products} onDelete={setToDelete} page={page} limit={limit} />
        <ProductCards products={products} onDelete={setToDelete} />
      </AsyncState>
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
