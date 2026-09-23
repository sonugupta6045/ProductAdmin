'use client';

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const PAGE_SIZES = [10, 20, 50];

export default function Pagination({
  page,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = Math.min((page - 1) * limit + 1, total);
  const end = Math.min(page * limit, total);

  // Build page number window: always show first, last, and up to 3 around current
  function getPageNumbers(): (number | '…')[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | '…')[] = [1];
    if (page > 3) pages.push('…');
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) {
      pages.push(p);
    }
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
    return pages;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
      {/* Showing X–Y of Z */}
      <p className="text-sm text-gray-500 shrink-0">
        {total === 0
          ? 'No results'
          : `Showing ${start}–${end} of ${total}`}
      </p>

      <div className="flex items-center gap-3 flex-wrap justify-center">
        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="page-size" className="text-sm text-gray-500 shrink-0">
            Rows per page:
          </label>
          <select
            id="page-size"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="input w-20 py-1.5 text-sm"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Page buttons */}
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button
            id="prev-page-btn"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="btn-secondary px-2.5 py-1.5 text-sm disabled:opacity-40"
            aria-label="Previous page"
          >
            ‹ Prev
          </button>

          {getPageNumbers().map((p, i) =>
            p === '…' ? (
              <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-sm select-none">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                aria-current={p === page ? 'page' : undefined}
                className={`min-w-[2rem] px-2 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  p === page
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            id="next-page-btn"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="btn-secondary px-2.5 py-1.5 text-sm disabled:opacity-40"
            aria-label="Next page"
          >
            Next ›
          </button>
        </nav>
      </div>
    </div>
  );
}
