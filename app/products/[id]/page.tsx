'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { fetchProduct } from '@/lib/api/products';
import { Product } from '@/types';
import AsyncState from '@/components/AsyncState';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-sm text-gray-600 font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const rawId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const abortRef = useRef<AbortController | null>(null);

  function load() {
    const id = parseInt(rawId, 10);
    if (isNaN(id)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    setNotFound(false);

    fetchProduct(id, controller.signal)
      .then((p) => {
        setProduct(p);
        setLoading(false);
      })
      .catch((err) => {
        if (err instanceof Error && err.name === 'CanceledError') return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (
          err instanceof Error &&
          (err.message.includes('404') || err.message.includes('not found'))
        ) {
          setNotFound(true);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load product');
        }
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [rawId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (notFound) {
    return (
      <div className="flex flex-col items-center gap-6 py-20 text-center">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100">
          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
          <p className="text-gray-500 mt-2">
            No product exists for ID <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{rawId}</code>.
          </p>
        </div>
        <Link href="/products" className="btn-primary">
          ← Back to products
        </Link>
      </div>
    );
  }

  return (
    <AsyncState
      loading={loading}
      error={error}
      empty={false}
      onRetry={load}
      skeletonRows={8}
    >
      {product && (
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
            <Link href="/products" className="hover:text-primary-600 transition-colors">
              Products
            </Link>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium truncate">{product.title}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image gallery */}
            <div className="space-y-3">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                <Image
                  src={product.images[selectedImage] ?? product.thumbnail}
                  alt={product.title}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                        i === selectedImage
                          ? 'border-primary-500'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      aria-label={`View image ${i + 1}`}
                    >
                      <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-5">
              <div>
                <span className="badge-blue capitalize">{product.category}</span>
                <h1 className="mt-2 text-3xl font-bold text-gray-900">{product.title}</h1>
                {product.brand && (
                  <p className="text-sm text-gray-500 mt-1">by {product.brand}</p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <p className="text-4xl font-bold text-primary-600">
                  ${product.price.toFixed(2)}
                </p>
                {product.discountPercentage > 0 && (
                  <span className="badge-red text-sm">
                    -{product.discountPercentage.toFixed(0)}% off
                  </span>
                )}
              </div>

              <StarRating rating={product.rating} />

              <p className="text-gray-600 leading-relaxed">{product.description}</p>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Stock', value: `${product.stock} units` },
                  { label: 'SKU', value: product.sku },
                  { label: 'Availability', value: product.availabilityStatus },
                  { label: 'Min. Order', value: `${product.minimumOrderQuantity} units` },
                  { label: 'Shipping', value: product.shippingInformation },
                  { label: 'Warranty', value: product.warrantyInformation },
                  { label: 'Return Policy', value: product.returnPolicy },
                  { label: 'Weight', value: `${product.weight} kg` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
                  </div>
                ))}
              </div>

              {/* Tags */}
              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <span key={tag} className="badge-gray text-xs">{tag}</span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Link href={`/products/${product.id}/edit`} className="btn-primary">
                  Edit product
                </Link>
                <Link href="/products" className="btn-secondary">
                  ← Back
                </Link>
              </div>
            </div>
          </div>

          {/* Reviews */}
          {product.reviews?.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Customer reviews ({product.reviews.length})
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {product.reviews.map((review, i) => (
                  <div key={i} className="card">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{review.reviewerName}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(review.date).toLocaleDateString()}
                        </p>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </AsyncState>
  );
}
