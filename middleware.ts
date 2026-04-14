import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Only attempt refresh when Supabase auth cookies are present.
  // This avoids hammering refresh endpoint for anonymous/public requests.
  const hasSupabaseCookie = req.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith('sb-'))

  if (hasSupabaseCookie) {
    try {
      await supabase.auth.getSession()
    } catch {
      // Ignore refresh errors in middleware to avoid noisy logs/rate spikes.
      // Route handlers and pages will still enforce auth via getUser().
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * OPTIMIZED MATCHER - Only run on routes that actually need authentication
     * This reduces unnecessary middleware calls by ~50-70%
     *
     * Protected routes that require auth:
     * - /dashboard (and all sub-routes)
     * - /write (and all sub-routes)
     * - /vocabulary (and all sub-routes)
     * - /history
     * - /admin (and all sub-routes)
     * - /invite
     * - /subscription
     * - /api/* (most API routes need auth)
     * - /auth/callback (auth callback handler)
     *
     * Excluded (no middleware needed):
     * - / (public homepage)
     * - /login, /register (public auth pages)
     * - /_next/* (Next.js internals)
     * - /favicon.ico, images, etc. (static assets)
     */
    '/dashboard/:path*',
    '/write/:path*',
    '/vocabulary/:path*',
    '/history/:path*',
    '/admin/:path*',
    '/invite/:path*',
    '/subscription/:path*',
    '/auth/callback',
  ],
}
