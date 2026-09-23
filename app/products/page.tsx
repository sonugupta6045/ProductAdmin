'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useProducts } from '@/lib/hooks/useProducts';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { Product } from '@/types';
import AsyncState from '@/components/AsyncState';
import ProductTable from '@/components/ProductTable';
import ProductCards from '@/components/ProductCards';
import Pagination from '@/components/Pagination';
import SearchBar from '@/components/SearchBar';
import FilterSortBar from '@/components/FilterSortBar';
import ConfirmDialog from '@/components/ConfirmDialog';
import { deleteProduct } from '@/lib/api/products';

function ProductsContent() {
  const {
    products,
    total,
    loading,
    error,
    page,
    limit,
    q,
    category,
    sortBy,
    order,
    setPage,
    setLimit,
    setQ,
    setCategory,
    setSort,
    retry,
    removeProduct,
  } = useProducts();

  // ── Delete dialog state ──────────────────────────────────────────────────
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteConfirm() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      // NOTE: DummyJSON does not persist this — local state only
      await deleteProduct(toDelete.id);
      removeProduct(toDelete.id);
      setToDelete(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total > 0 ? `${total} products total` : 'Manage your product catalogue'}
          </p>
        </div>
        <Link href="/products/new" id="add-product-btn" className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add product
        </Link>
      </div>

      {/* Search + Filter/Sort bar */}
      <div className="card mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar value={q} onChange={setQ} />
          <FilterSortBar
            category={category}
            onCategoryChange={setCategory}
            sortBy={sortBy}
            order={order}
            onSortChange={setSort}
            searchActive={!!q}
          />
        </div>
      </div>

      {/* Product list */}
      <AsyncState
        loading={loading}
        error={error}
        empty={!loading && !error && products.length === 0}
        emptyMessage={
          q
            ? `No products found for "${q}"`
            : category
            ? `No products in "${category}"`
            : 'No products found'
        }
        onRetry={retry}
        skeletonRows={limit}
      >
        <ProductTable products={products} onDelete={setToDelete} page={page} limit={limit} />
        <ProductCards products={products} onDelete={setToDelete} />
      </AsyncState>

      {/* Pagination */}
      {!loading && !error && total > 0 && (
        <Pagination
          page={page}
          total={total}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={!!toDelete}
        title="Delete product"
        message={
          toDelete
            ? `Are you sure you want to delete "${toDelete.title}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}
