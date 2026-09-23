'use client';

import { Suspense, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setToken } from '@/lib/axios';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('from') ?? '/products';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Guard against duplicate submissions
  const inFlight = useRef(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inFlight.current || loading) return;

    inFlight.current = true;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Invalid credentials. Please try again.');
        return;
      }

      // Hydrate the in-memory token so Axios interceptor can use it immediately.
      // The Route Handler normalises accessToken → token, but we fall back just in case.
      setToken(data.token ?? data.accessToken);
      router.push(redirectTo);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Product Admin</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to manage your products</p>
        </div>

        {/* Card */}
        <div className="card shadow-xl border-0 ring-1 ring-gray-200">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Error banner */}
            {error && (
              <div
                role="alert"
                id="login-error"
                className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
              >
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Username */}
            <div>
              <label htmlFor="username" className="label">Username</label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="emilys"
                className="input"
                aria-describedby={error ? 'login-error' : undefined}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
              />
            </div>

            {/* Demo hint */}
            <div className="rounded-lg bg-primary-50 border border-primary-100 px-3 py-2 text-xs text-primary-700">
              <strong>Demo credentials:</strong> username <code>emilys</code> / password <code>emilyspass</code>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading || !username || !password}
              className="btn-primary w-full py-2.5 text-base"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by{' '}
          <a href="https://dummyjson.com" target="_blank" rel="noreferrer" className="underline hover:text-gray-600">
            DummyJSON
          </a>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
