/**
 * Shared Axios instance — the ONLY file that imports axios directly.
 * All other files import from here.
 *
 * Request interceptor:  attaches the auth token from the token store.
 * Response interceptor: centralises error handling; on 401 clears the token
 *                       and redirects to /login (client-side only).
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// ─── Token store ──────────────────────────────────────────────────────────────
// We keep the token in memory (never exposed to client JS via a readable cookie)
// and refresh it from the HttpOnly cookie path on the server side.
// On the client we hydrate it once after login.

let _token: string | null = null;

export function setToken(token: string | null) {
  _token = token;
}

export function getToken(): string | null {
  return _token;
}

// ─── Axios instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (_token) {
    config.headers.Authorization = `Bearer ${_token}`;
  }
  return config;
});

// ─── Response interceptor ─────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Aborted requests (AbortController) should bubble through silently
    if (axios.isCancel(error)) return Promise.reject(error);

    const status = error.response?.status;

    if (status === 401) {
      // Clear stale token and bounce to login (client-side only)
      _token = null;
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    // Normalise error shape so callers don't have to dig into AxiosError
    const message =
      (error.response?.data as { message?: string })?.message ??
      error.message ??
      'An unexpected error occurred';

    return Promise.reject(new Error(message));
  }
);

export default api;
