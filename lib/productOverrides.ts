/**
 * productOverrides.ts
 *
 * A thin localStorage layer that stores user-made edits and deletes so they
 * persist across page refreshes — even though DummyJSON does not persist them
 * server-side.
 *
 * Storage keys:
 *   "pa_overrides"  → Record<id, Partial<Product>>   (edited fields)
 *   "pa_deleted"    → number[]                        (deleted product IDs)
 *
 * All functions are safe to call during SSR (typeof window guard).
 */

import { Product } from '@/types';

const OVERRIDES_KEY = 'pa_overrides';
const DELETED_KEY = 'pa_deleted';

// ─── Low-level helpers ────────────────────────────────────────────────────────

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded — silently ignore
  }
}

// ─── Override store ───────────────────────────────────────────────────────────

type Overrides = Record<string, Partial<Product>>;

/** Returns all stored overrides as a plain object. */
export function getAllOverrides(): Overrides {
  return readJSON<Overrides>(OVERRIDES_KEY, {});
}

/** Returns the override patch for a single product, or null if none. */
export function getOverride(id: number): Partial<Product> | null {
  const all = getAllOverrides();
  return all[String(id)] ?? null;
}

/**
 * Saves (merges) a partial product patch for a given id.
 * Existing override fields not present in `patch` are preserved.
 */
export function setOverride(id: number, patch: Partial<Product>): void {
  const all = getAllOverrides();
  all[String(id)] = { ...(all[String(id)] ?? {}), ...patch };
  writeJSON(OVERRIDES_KEY, all);
}

/** Removes all local overrides for a product (reset to original API data). */
export function clearOverride(id: number): void {
  const all = getAllOverrides();
  delete all[String(id)];
  writeJSON(OVERRIDES_KEY, all);
}

/**
 * Merges a product from the API with any locally stored overrides.
 * If no override exists, the product is returned as-is.
 */
export function mergeWithOverride(product: Product): Product {
  const patch = getOverride(product.id);
  return patch ? { ...product, ...patch } : product;
}

// ─── Deleted IDs store ────────────────────────────────────────────────────────

/** Returns the list of product IDs the user has deleted locally. */
export function getDeletedIds(): number[] {
  return readJSON<number[]>(DELETED_KEY, []);
}

/** Returns true if this product was locally deleted. */
export function isDeleted(id: number): boolean {
  return getDeletedIds().includes(id);
}

/** Marks a product as locally deleted (hides it from the list). */
export function addDeletedId(id: number): void {
  const ids = getDeletedIds();
  if (!ids.includes(id)) {
    writeJSON(DELETED_KEY, [...ids, id]);
  }
}

/**
 * Un-marks a product as deleted.
 * Used by "Reset to original" to fully restore a product.
 */
export function removeDeletedId(id: number): void {
  const ids = getDeletedIds();
  writeJSON(
    DELETED_KEY,
    ids.filter((x) => x !== id)
  );
}

/**
 * Fully resets a product: clears its override patch AND removes it from the
 * deleted list. After calling this, the product will show DummyJSON data again.
 */
export function resetProduct(id: number): void {
  clearOverride(id);
  removeDeletedId(id);
}
