'use client';

import { useState } from 'react';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useEffect } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (q: string) => void;
}

/**
 * Debounced search bar (~500 ms).
 * The local state controls the input; the debounced value triggers the URL update
 * (which fires the actual API request via useProducts).
 */
export default function SearchBar({ value, onChange }: SearchBarProps) {
  const [local, setLocal] = useState(value);
  const debounced = useDebounce(local, 500);

  // Sync external value changes (e.g. from URL on mount)
  useEffect(() => {
    setLocal(value);
  }, [value]);

  // When debounced value changes, propagate upward → router.push in parent
  useEffect(() => {
    if (debounced !== value) {
      onChange(debounced);
    }
  }, [debounced]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleClear() {
    setLocal('');
    onChange('');
  }

  return (
    <div className="relative flex-1 min-w-0">
      <label htmlFor="search-input" className="sr-only">Search products</label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          id="search-input"
          type="search"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder="Search products…"
          className="input pl-9 pr-9"
          autoComplete="off"
        />
        {local && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-2 flex items-center px-1 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
