/**
 * Auth API — all calls go through the shared Axios instance.
 * Never import axios directly in this file.
 *
 * NOTE: DummyJSON changed their auth response from `token` to `accessToken`.
 * We handle both shapes for forward/backward compatibility.
 */

import api, { setToken } from '@/lib/axios';

interface AuthResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
  token?: string;       // legacy field
  accessToken?: string; // current field
  refreshToken?: string;
}

export async function loginApi(
  username: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', {
    username,
    password,
    expiresInMins: 60,
  });
  // DummyJSON now returns accessToken; fall back to token for any cached version
  const jwt = data.accessToken ?? data.token ?? '';
  setToken(jwt);
  return data;
}

export async function logoutApi(): Promise<void> {
  setToken(null);
  // Hit our Next.js route handler to clear the HttpOnly cookie
  await fetch('/api/auth/logout', { method: 'POST' });
}
