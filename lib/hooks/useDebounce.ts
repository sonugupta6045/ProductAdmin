import { useEffect, useState } from 'react';

/**
 * Generic debounce hook — delays updating the returned value until
 * `delay` milliseconds have passed without `value` changing.
 * Used by SearchBar to avoid firing a request on every keystroke.
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
