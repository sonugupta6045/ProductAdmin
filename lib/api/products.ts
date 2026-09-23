/**
 * Products API — all calls go through the shared Axios instance.
 * Never import axios directly in this file.
 *
 * NOTE: DummyJSON does NOT persist mutations (create / update / delete).
 * We call the real endpoints so the network tab reflects real API behaviour,
 * but the returned data is used only to update local React state.
 * Changes will reset on page refresh.
 */

import api from '@/lib/axios';
import {
  Category,
  Product,
  ProductFormData,
  ProductsResponse,
  SortField,
  SortOrder,
} from '@/types';

interface FetchProductsParams {
  limit?: number;
  skip?: number;
  q?: string;
  category?: string;
  sortBy?: SortField;
  order?: SortOrder;
}

// ─── Fetch list ───────────────────────────────────────────────────────────────

export async function fetchProducts(
  params: FetchProductsParams,
  signal?: AbortSignal
): Promise<ProductsResponse> {
  const { limit = 10, skip = 0, q, category, sortBy, order } = params;

  // DummyJSON limitation: cannot search AND filter-by-category simultaneously.
  // When q is present we use /products/search; otherwise we may use category.
  // See FilterSortBar component for the corresponding UI affordance.

  if (q) {
    const { data } = await api.get<ProductsResponse>('/products/search', {
      params: { q, limit, skip },
      signal,
    });
    return data;
  }

  if (category) {
    const { data } = await api.get<ProductsResponse>(
      `/products/category/${encodeURIComponent(category)}`,
      { params: { limit, skip, sortBy, order }, signal }
    );
    return data;
  }

  const { data } = await api.get<ProductsResponse>('/products', {
    params: { limit, skip, sortBy, order },
    signal,
  });
  return data;
}

// ─── Fetch single ─────────────────────────────────────────────────────────────

export async function fetchProduct(
  id: number,
  signal?: AbortSignal
): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${id}`, { signal });
  return data;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function fetchCategories(
  signal?: AbortSignal
): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/products/categories', {
    signal,
  });
  return data;
}

// ─── Mutations (local-state only — DummyJSON does not persist) ─────────────

export async function createProduct(
  formData: ProductFormData
): Promise<Product> {
  // NOTE: DummyJSON does not persist this — local state only
  const { data } = await api.post<Product>('/products/add', {
    ...formData,
    price: Number(formData.price),
    stock: Number(formData.stock),
  });
  return data;
}

export async function updateProduct(
  id: number,
  formData: Partial<ProductFormData>
): Promise<Product> {
  // NOTE: DummyJSON does not persist this — local state only
  const { data } = await api.put<Product>(`/products/${id}`, {
    ...formData,
    ...(formData.price !== undefined && { price: Number(formData.price) }),
    ...(formData.stock !== undefined && { stock: Number(formData.stock) }),
  });
  return data;
}

export async function deleteProduct(id: number): Promise<{ id: number }> {
  // NOTE: DummyJSON does not persist this — local state only
  const { data } = await api.delete<{ id: number }>(`/products/${id}`);
  return data;
}
