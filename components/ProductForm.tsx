'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product, ProductFormData } from '@/types';
import { createProduct, updateProduct } from '@/lib/api/products';

interface ProductFormProps {
  /** If provided, form is in edit mode. Otherwise create mode. */
  product?: Product;
  onSuccess?: (product: Product) => void;
}

const EMPTY_FORM: ProductFormData = {
  title: '',
  description: '',
  price: '',
  stock: '',
  category: '',
  thumbnail: '',
};

/**
 * Shared add/edit form with client-side validation and submit guard.
 *
 * NOTE: DummyJSON does not persist mutations — the API call is made for
 * correctness, but the returned data is used only to update local state.
 * Changes reset on page refresh.
 */
export default function ProductForm({ product, onSuccess }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;
  const inFlight = useRef(false);

  const [form, setForm] = useState<ProductFormData>(
    product
      ? {
          title: product.title,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category,
          thumbnail: product.thumbnail,
        }
      : EMPTY_FORM
  );

  const [errors, setErrors] = useState<Partial<ProductFormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function validate(): boolean {
    const next: Partial<ProductFormData> = {};
    if (!form.title.trim()) next.title = 'Title is required';
    if (!form.description.trim()) next.description = 'Description is required';
    if (!form.category.trim()) next.category = 'Category is required';
    const price = Number(form.price);
    if (isNaN(price) || price <= 0) next.price = 'Price must be a positive number';
    const stock = Number(form.stock);
    if (isNaN(stock) || stock < 0 || !Number.isInteger(stock))
      next.stock = 'Stock must be a non-negative integer';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function field(key: keyof ProductFormData) {
    return {
      value: String(form[key]),
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((prev) => ({ ...prev, [key]: e.target.value })),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inFlight.current || submitting) return;
    if (!validate()) return;

    inFlight.current = true;
    setSubmitting(true);
    setServerError(null);

    try {
      let result: Product;
      if (isEdit) {
        // NOTE: DummyJSON does not persist this — local state only
        result = await updateProduct(product.id, form);
        // The API echoes back the product — merge with original for full shape
        result = { ...product, ...result };
      } else {
        // NOTE: DummyJSON does not persist this — local state only
        result = await createProduct(form);
      }
      onSuccess?.(result);
      router.push('/products');
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'Failed to save product'
      );
    } finally {
      setSubmitting(false);
      inFlight.current = false;
    }
  }

  function FormField({
    id,
    label,
    error,
    children,
  }: {
    id: string;
    label: string;
    error?: string;
    children: React.ReactNode;
  }) {
    return (
      <div>
        <label htmlFor={id} className="label">
          {label}
        </label>
        {children}
        {error && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 max-w-2xl">
      {/* DummyJSON mutation notice */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
        <strong>Note:</strong> DummyJSON does not persist changes server-side.
        Saves update local app state only and will reset on page refresh.
      </div>

      {serverError && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <FormField id="title" label="Title *" error={errors.title as string}>
        <input id="title" type="text" className={`input ${errors.title ? 'border-red-400 focus:ring-red-400' : ''}`} {...field('title')} />
      </FormField>

      <FormField id="description" label="Description *" error={errors.description as string}>
        <textarea
          id="description"
          rows={3}
          className={`input resize-none ${errors.description ? 'border-red-400 focus:ring-red-400' : ''}`}
          value={String(form.description)}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField id="price" label="Price ($) *" error={errors.price as string}>
          <input id="price" type="number" min="0.01" step="0.01" className={`input ${errors.price ? 'border-red-400 focus:ring-red-400' : ''}`} {...field('price')} />
        </FormField>
        <FormField id="stock" label="Stock *" error={errors.stock as string}>
          <input id="stock" type="number" min="0" step="1" className={`input ${errors.stock ? 'border-red-400 focus:ring-red-400' : ''}`} {...field('stock')} />
        </FormField>
      </div>

      <FormField id="category" label="Category *" error={errors.category as string}>
        <input id="category" type="text" placeholder="e.g. smartphones" className={`input ${errors.category ? 'border-red-400 focus:ring-red-400' : ''}`} {...field('category')} />
      </FormField>

      <FormField id="thumbnail" label="Thumbnail URL">
        <input id="thumbnail" type="url" placeholder="https://…" className="input" {...field('thumbnail')} />
        {form.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={String(form.thumbnail)}
            alt="Preview"
            className="mt-2 h-20 w-20 object-cover rounded-lg border border-gray-200"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
      </FormField>

      <div className="flex gap-3 pt-2">
        <button
          id="product-form-submit"
          type="submit"
          disabled={submitting}
          className="btn-primary"
        >
          {submitting ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              {isEdit ? 'Saving…' : 'Creating…'}
            </>
          ) : isEdit ? (
            'Save changes'
          ) : (
            'Create product'
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
