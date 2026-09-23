'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';

interface ProductTableProps {
  products: Product[];
  onDelete: (product: Product) => void;
  /** Current page number (1-indexed) — used to compute the correct Sr. No. offset */
  page: number;
  /** Page size — used alongside page to compute Sr. No. */
  limit: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1">
      <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span className="text-xs font-medium text-gray-700">{rating.toFixed(1)}</span>
    </span>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <span className="badge-red">Out of stock</span>;
  if (stock < 10) return <span className="badge-yellow">{stock} left</span>;
  return <span className="badge-green">{stock} in stock</span>;
}

export default function ProductTable({ products, onDelete, page, limit }: ProductTableProps) {
  // First serial number on this page — e.g. page 2, limit 10 → starts at 11
  const startIndex = (page - 1) * limit + 1;

  return (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            <th className="table-header-cell w-10 text-center">#</th>
            <th className="table-header-cell w-16">Image</th>
            <th className="table-header-cell">Title</th>
            <th className="table-header-cell">Category</th>
            <th className="table-header-cell text-right">Price</th>
            <th className="table-header-cell">Rating</th>
            <th className="table-header-cell">Stock</th>
            <th className="table-header-cell text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {products.map((product, idx) => (
            <tr key={product.id} className="hover:bg-gray-50/60 transition-colors duration-100">
              {/* Sr. No. */}
              <td className="table-cell text-center text-xs font-medium text-gray-400 tabular-nums">
                {startIndex + idx}
              </td>
              {/* Thumbnail */}
              <td className="table-cell">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    src={product.thumbnail}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="40px"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://placehold.co/40x40/e5e7eb/9ca3af?text=?';
                    }}
                  />
                </div>
              </td>

              {/* Title */}
              <td className="table-cell max-w-xs">
                <Link
                  href={`/products/${product.id}`}
                  className="font-medium text-gray-900 hover:text-primary-600 transition-colors line-clamp-2"
                >
                  {product.title}
                </Link>
              </td>

              {/* Category */}
              <td className="table-cell">
                <span className="badge-blue capitalize">{product.category}</span>
              </td>

              {/* Price */}
              <td className="table-cell text-right font-semibold text-gray-900">
                ${product.price.toFixed(2)}
              </td>

              {/* Rating */}
              <td className="table-cell">
                <StarRating rating={product.rating} />
              </td>

              {/* Stock */}
              <td className="table-cell">
                <StockBadge stock={product.stock} />
              </td>

              {/* Actions */}
              <td className="table-cell text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/products/${product.id}`}
                    className="btn-ghost px-2 py-1 text-xs"
                  >
                    View
                  </Link>
                  <Link
                    href={`/products/${product.id}/edit`}
                    className="btn-secondary px-2 py-1 text-xs"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => onDelete(product)}
                    className="btn-danger px-2 py-1 text-xs"
                    aria-label={`Delete ${product.title}`}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
