// Shared TypeScript types for the entire app

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
  token?: string;        // legacy — DummyJSON used this field name previously
  accessToken?: string;  // current — DummyJSON now uses this field name
  refreshToken?: string;
}

export interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  sku: string;
  weight: number;
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: Review[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  images: string[];
  thumbnail: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface Category {
  slug: string;
  name: string;
  url: string;
}

export type SortField = 'price' | 'rating' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface ProductFormData {
  title: string;
  description: string;
  price: number | string;
  stock: number | string;
  category: string;
  thumbnail: string;
}
