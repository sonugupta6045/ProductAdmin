'use client';

import { useEffect, useState } from 'react';
import { fetchCategories } from '@/lib/api/products';
import { Category, SortField, SortOrder } from '@/types';

interface FilterSortBarProps {
  category: string;
  onCategoryChange: (c: string) => void;
  sortBy: SortField | '';
  order: SortOrder;
  onSortChange: (field: SortField | '', order: SortOrder) => void;
  searchActive: boolean; // When true, category filter is disabled
}

interface SortOption {
  label: string;
  field: SortField | '';
  order: SortOrder;
}

const SORT_OPTIONS: SortOption[] = [
  { label: 'Default', field: '', order: 'asc' },
  { label: 'Price: Low → High', field: 'price', order: 'asc' },
  { label: 'Price: High → Low', field: 'price', order: 'desc' },
  { label: 'Rating: High → Low', field: 'rating', order: 'desc' },
  { label: 'Rating: Low → High', field: 'rating', order: 'asc' },
  { label: 'Title: A → Z', field: 'title', order: 'asc' },
  { label: 'Title: Z → A', field: 'title', order: 'desc' },
];

function toSortValue(field: SortField | '', order: SortOrder): string {
  return field ? `${field}-${order}` : '';
}

/**
 * FilterSortBar — category dropdown + sort dropdown.
 *
 * DummyJSON limitation: /products/search?q= and /products/category/:name
 * are separate endpoints that cannot be combined in a single request.
 * Decision: while a search term is active, the category dropdown is disabled
 * and shows a tooltip explaining the limitation.
 * See lib/api/products.ts for the API-level routing logic.
 */
export default function FilterSortBar({
  category,
  onCategoryChange,
  sortBy,
  order,
  onSortChange,
  searchActive,
}: FilterSortBarProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchCategories(controller.signal)
      .then(setCategories)
      .catch(() => {/* silently ignore — non-critical */});
    return () => controller.abort();
  }, []);

  const currentSortValue = toSortValue(sortBy, order);

  function handleSortChange(value: string) {
    if (!value) {
      onSortChange('', 'asc');
      return;
    }
    const found = SORT_OPTIONS.find((o) => toSortValue(o.field, o.order) === value);
    if (found) onSortChange(found.field, found.order);
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Category filter */}
      <div className="relative group">
        <label htmlFor="category-filter" className="sr-only">Filter by category</label>
        <select
          id="category-filter"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          disabled={searchActive}
          title={
            searchActive
              ? 'Clear search to filter by category'
              : 'Filter by category'
          }
          className={`input py-1.5 text-sm pr-8 ${
            searchActive ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        {/* Tooltip when search is active */}
        {searchActive && (
          <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block z-10">
            <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap shadow-lg">
              Clear search to filter by category
              <div className="absolute top-full left-4 -mt-px border-4 border-transparent border-t-gray-800" />
            </div>
          </div>
        )}
      </div>

      {/* Sort */}
      <div>
        <label htmlFor="sort-select" className="sr-only">Sort by</label>
        <select
          id="sort-select"
          value={currentSortValue}
          onChange={(e) => handleSortChange(e.target.value)}
          className="input py-1.5 text-sm"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={toSortValue(opt.field, opt.order)} value={toSortValue(opt.field, opt.order)}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Active search notice */}
      {searchActive && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
          Category filter unavailable while searching — clear the search field to enable it.
        </p>
      )}
    </div>
  );
}
