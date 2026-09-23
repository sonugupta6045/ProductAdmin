'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';

interface ProductCardsProps {
  products: Product[];
  onDelete: (product: Product) => void;
}

export default function ProductCards({ products, onDelete }: ProductCardsProps) {
  return (
    <div className="grid md:hidden gap-4 grid-cols-1 sm:grid-cols-2">
      {products.map((product) => (
        <div key={product.id} className="card flex flex-col gap-3">
          {/* Header row */}
          <div className="flex items-start gap-3">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                className="object-cover"
                sizes="56px"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://placehold.co/56x56/e5e7eb/9ca3af?text=?';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${product.id}`}
                className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 text-sm"
              >
                {product.title}
              </Link>
              <span className="badge-blue capitalize mt-1 inline-block text-xs">
                {product.category}
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-gray-900 text-base">
              ${product.price.toFixed(2)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs font-medium text-gray-700">{product.rating.toFixed(1)}</span>
            </span>
            {product.stock === 0 ? (
              <span className="badge-red text-xs">Out of stock</span>
            ) : product.stock < 10 ? (
              <span className="badge-yellow text-xs">{product.stock} left</span>
            ) : (
              <span className="badge-green text-xs">{product.stock} in stock</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1 border-t border-gray-100">
            <Link href={`/products/${product.id}`} className="btn-ghost flex-1 text-xs py-1.5">
              View
            </Link>
            <Link href={`/products/${product.id}/edit`} className="btn-secondary flex-1 text-xs py-1.5">
              Edit
            </Link>
            <button
              onClick={() => onDelete(product)}
              className="btn-danger flex-1 text-xs py-1.5"
              aria-label={`Delete ${product.title}`}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
