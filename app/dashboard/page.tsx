'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchProducts, fetchCategories } from '@/lib/api/products';
import { Product, Category } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  lowStockProducts: Product[];
  outOfStockCount: number;
  categoryBreakdown: { name: string; slug: string; count: number }[];
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  colorClass,
  href,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
  href?: string;
}) {
  const content = (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-4">
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${colorClass}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }
  return content;
}

// ─── Skeleton loaders ─────────────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <div className="card">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse" />
        <div className="space-y-2">
          <div className="w-16 h-7 bg-gray-200 rounded animate-pulse" />
          <div className="w-24 h-4 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-16 h-4 bg-gray-100 rounded animate-pulse" />
          <div className="w-12 h-4 bg-gray-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// ─── Category bar ─────────────────────────────────────────────────────────────

function CategoryRow({
  name,
  count,
  maxCount,
}: {
  name: string;
  count: number;
  maxCount: number;
}) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;

  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-sm text-gray-700 capitalize w-36 truncate shrink-0">
        {name}
      </span>
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-500 tabular-nums w-8 text-right">
        {count}
      </span>
    </div>
  );
}

// ─── Stock badge ──────────────────────────────────────────────────────────────

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <span className="badge-red">Out of stock</span>;
  if (stock < 5) return <span className="badge-red">{stock} left</span>;
  return <span className="badge-yellow">{stock} left</span>;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadStats() {
    setLoading(true);
    setError(null);
    try {
      // Fetch all products (limit=0 returns every product) + categories in parallel
      const [productsRes, categories] = await Promise.all([
        fetchProducts({ limit: 0 }),
        fetchCategories(),
      ]);

      const { products, total } = productsRes;

      // Compute category breakdown
      const countMap = new Map<string, number>();
      products.forEach((p) => {
        countMap.set(p.category, (countMap.get(p.category) || 0) + 1);
      });

      const categoryBreakdown = categories
        .map((cat: Category) => ({
          name: cat.name,
          slug: cat.slug,
          count: countMap.get(cat.slug) || 0,
        }))
        .filter((c) => c.count > 0)
        .sort((a, b) => b.count - a.count);

      // Low stock & out of stock
      const lowStockProducts = products
        .filter((p) => p.stock < 10)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 10);

      const outOfStockCount = products.filter((p) => p.stock === 0).length;

      setStats({
        totalProducts: total,
        totalCategories: categories.length,
        lowStockProducts,
        outOfStockCount,
        categoryBreakdown,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load dashboard data'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Product inventory overview
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-500 mt-0.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
              <button
                onClick={loadStats}
                className="mt-2 text-sm text-red-700 underline hover:text-red-900"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Section 1: Summary cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : stats ? (
          <>
            <StatCard
              label="Total Products"
              value={stats.totalProducts}
              href="/products"
              colorClass="bg-blue-100 text-blue-600"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
            />
            <StatCard
              label="Categories"
              value={stats.totalCategories}
              colorClass="bg-purple-100 text-purple-600"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              }
            />
            <StatCard
              label="Low Stock"
              value={stats.lowStockProducts.length}
              colorClass="bg-amber-100 text-amber-600"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              }
            />
            <StatCard
              label="Out of Stock"
              value={stats.outOfStockCount}
              colorClass="bg-red-100 text-red-600"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              }
            />
          </>
        ) : null}
      </div>

      {/* ── Section 2 & 3: Two-column layout ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              Products per Category
            </h2>
            {stats && (
              <span className="text-xs text-gray-400">
                {stats.categoryBreakdown.length} categories
              </span>
            )}
          </div>
          {loading ? (
            <TableSkeleton rows={6} />
          ) : stats ? (
            <div className="max-h-80 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {stats.categoryBreakdown.map((cat) => (
                <CategoryRow
                  key={cat.slug}
                  name={cat.name}
                  count={cat.count}
                  maxCount={stats.categoryBreakdown[0]?.count || 1}
                />
              ))}
            </div>
          ) : null}
        </div>

        {/* Low stock alert table */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              Low Stock Alerts
            </h2>
            {stats && stats.lowStockProducts.length > 0 && (
              <span className="badge-red">
                {stats.lowStockProducts.length} items
              </span>
            )}
          </div>
          {loading ? (
            <TableSkeleton rows={5} />
          ) : stats && stats.lowStockProducts.length > 0 ? (
            <div className="overflow-x-auto -mx-4">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="table-header-cell">Product</th>
                    <th className="table-header-cell">Category</th>
                    <th className="table-header-cell text-right">Price</th>
                    <th className="table-header-cell text-right">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.lowStockProducts.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-gray-50/60 transition-colors duration-100"
                    >
                      <td className="table-cell">
                        <Link
                          href={`/products/${p.id}`}
                          className="font-medium text-gray-900 hover:text-primary-600 transition-colors line-clamp-1"
                        >
                          {p.title}
                        </Link>
                      </td>
                      <td className="table-cell">
                        <span className="badge-blue capitalize text-xs">
                          {p.category}
                        </span>
                      </td>
                      <td className="table-cell text-right font-medium text-gray-900 tabular-nums">
                        ${p.price.toFixed(2)}
                      </td>
                      <td className="table-cell text-right">
                        <StockBadge stock={p.stock} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              <svg className="w-10 h-10 mx-auto text-green-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              All products are well-stocked!
            </div>
          )}
        </div>
      </div>
    </>
  );
}
