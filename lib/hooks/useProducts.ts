import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchProducts } from '@/lib/api/products';
import { Product, ProductsResponse, SortField, SortOrder } from '@/types';

// ─── URL param sanitisation helpers ──────────────────────────────────────────

/** Parses an integer query param; returns `fallback` on NaN or out-of-bounds. */
function safeInt(value: string | null, fallback: number, min = 1): number {
  const n = parseInt(value ?? '', 10);
  return isNaN(n) || n < min ? fallback : n;
}

const VALID_PAGE_SIZES = [10, 20, 50];
const VALID_SORT_FIELDS: SortField[] = ['price', 'rating', 'title'];
const VALID_SORT_ORDERS: SortOrder[] = ['asc', 'desc'];

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseProductsReturn {
  products: Product[];
  total: number;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  q: string;
  category: string;
  sortBy: SortField | '';
  order: SortOrder;
  setPage: (p: number) => void;
  setLimit: (l: number) => void;
  setQ: (q: string) => void;
  setCategory: (c: string) => void;
  setSort: (field: SortField | '', order: SortOrder) => void;
  retry: () => void;
  // Optimistic local-state helpers (for add/edit/delete)
  addProduct: (p: Product) => void;
  updateProduct: (p: Product) => void;
  removeProduct: (id: number) => void;
}

export function useProducts(): UseProductsReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Sanitise URL params ──────────────────────────────────────────────────
  const rawPage = searchParams.get('page');
  const rawLimit = searchParams.get('limit');
  const rawSortBy = searchParams.get('sortBy') as SortField | null;
  const rawOrder = searchParams.get('order') as SortOrder | null;

  const q = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';
  const limitRaw = safeInt(rawLimit, 10, 1);
  const limit = VALID_PAGE_SIZES.includes(limitRaw) ? limitRaw : 10;
  const sortBy: SortField | '' = VALID_SORT_FIELDS.includes(rawSortBy as SortField)
    ? (rawSortBy as SortField)
    : '';
  const order: SortOrder = VALID_SORT_ORDERS.includes(rawOrder as SortOrder)
    ? (rawOrder as SortOrder)
    : 'asc';

  // ── Async state ─────────────────────────────────────────────────────────
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derive page AFTER we know total so we can clamp it
  const total = data?.total ?? 0;
  const maxPage = Math.max(1, Math.ceil(total / limit));
  const page = Math.min(Math.max(safeInt(rawPage, 1), 1), maxPage || 1);

  // ── Abort controller ref — cancels stale requests ───────────────────────
  const abortRef = useRef<AbortController | null>(null);
  const retryTrigger = useRef(0);

  const doFetch = useCallback(async () => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchProducts(
        {
          limit,
          skip: (page - 1) * limit,
          q: q || undefined,
          category: category || undefined,
          sortBy: sortBy || undefined,
          order,
        },
        controller.signal
      );
      setData(result);
    } catch (err) {
      // Ignore abort errors (stale requests)
      if (err instanceof Error && err.name === 'CanceledError') return;
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [limit, page, q, category, sortBy, order]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    doFetch();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doFetch, retryTrigger.current]);

  // ── URL navigation helpers ───────────────────────────────────────────────
  function buildUrl(overrides: Record<string, string | number | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(overrides)) {
      if (v === undefined || v === '') {
        params.delete(k);
      } else {
        params.set(k, String(v));
      }
    }
    return `/products?${params.toString()}`;
  }

  const setPage = (p: number) => router.push(buildUrl({ page: p }));
  const setLimit = (l: number) => router.push(buildUrl({ limit: l, page: 1 }));
  const setQ = (newQ: string) =>
    router.push(buildUrl({ q: newQ || undefined, page: 1 }));
  const setCategory = (c: string) =>
    router.push(buildUrl({ category: c || undefined, page: 1 }));
  const setSort = (field: SortField | '', ord: SortOrder) =>
    router.push(buildUrl({ sortBy: field || undefined, order: ord }));

  const retry = () => {
    retryTrigger.current += 1;
    doFetch();
  };

  // ── Optimistic local-state helpers ────────────────────────────────────────
  const addProduct = (p: Product) =>
    setData((prev) =>
      prev
        ? { ...prev, products: [p, ...prev.products], total: prev.total + 1 }
        : prev
    );

  const updateProduct = (p: Product) =>
    setData((prev) =>
      prev
        ? {
            ...prev,
            products: prev.products.map((x) => (x.id === p.id ? p : x)),
          }
        : prev
    );

  const removeProduct = (id: number) =>
    setData((prev) =>
      prev
        ? {
            ...prev,
            products: prev.products.filter((x) => x.id !== id),
            total: prev.total - 1,
          }
        : prev
    );

  return {
    products: data?.products ?? [],
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
    addProduct,
    updateProduct,
    removeProduct,
  };
}
