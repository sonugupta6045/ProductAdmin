'use client';

interface AsyncStateProps {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyMessage?: string;
  onRetry: () => void;
  skeletonRows?: number;
  children: React.ReactNode;
}

/**
 * Wraps any data-fetching view with consistent loading / empty / error states.
 * Always include a Retry button on error.
 */
export default function AsyncState({
  loading,
  error,
  empty,
  emptyMessage = 'No results found.',
  onRetry,
  skeletonRows = 6,
  children,
}: AsyncStateProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-3" aria-busy="true" aria-label="Loading…">
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <div key={i} className="h-14 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 py-16 text-center"
      >
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-800">Something went wrong</p>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">{error}</p>
        </div>
        <button id="retry-btn" onClick={onRetry} className="btn-primary">
          Try again
        </button>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center text-gray-500">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-100">
          <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}
