import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Clears the auth token cookie, effectively ending the session.
 */
export async function POST() {
  const response = NextResponse.json({ success: true }, { status: 200 });
  response.cookies.set('token', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Expire immediately
  });
  return response;
}
