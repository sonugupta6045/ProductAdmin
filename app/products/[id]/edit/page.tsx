'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchProduct } from '@/lib/api/products';
import { Product } from '@/types';
import ProductForm from '@/components/ProductForm';
import AsyncState from '@/components/AsyncState';
import { isDeleted, mergeWithOverride } from '@/lib/productOverrides';

function EditProductContent() {
  const params = useParams();
  const rawId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  function load() {
    const id = parseInt(rawId, 10);
    if (isNaN(id)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    setNotFound(false);

    fetchProduct(id, controller.signal)
      .then((p) => {
        if (isDeleted(p.id)) {
          setNotFound(true);
        } else {
          setProduct(mergeWithOverride(p));
        }
        setLoading(false);
      })
      .catch((err) => {
        if (err instanceof Error && err.name === 'CanceledError') return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (
          err instanceof Error &&
          (err.message.includes('404') || err.message.includes('not found'))
        ) {
          setNotFound(true);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load product');
        }
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [rawId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (notFound) {
    return (
      <div className="flex flex-col items-center gap-6 py-20 text-center">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100">
          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
          <p className="text-gray-500 mt-2">
            No product exists for ID{' '}
            <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{rawId}</code>.
          </p>
        </div>
        <Link href="/products" className="btn-primary">
          ← Back to products
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={product ? `/products/${product.id}` : '/products'} className="btn-ghost px-2" aria-label="Back">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit product</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {product ? `Editing: ${product.title}` : 'Loading product…'}
          </p>
        </div>
      </div>

      <AsyncState
        loading={loading}
        error={error}
        empty={false}
        onRetry={load}
        skeletonRows={6}
      >
        {product && (
          <div className="card">
            <ProductForm product={product} />
          </div>
        )}
      </AsyncState>
    </div>
  );
}

export default function EditProductPage() {
  return (
    <Suspense>
      <EditProductContent />
    </Suspense>
  );
}
