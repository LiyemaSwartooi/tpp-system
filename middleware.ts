import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Get the user's session
  const { data: { session }, error } = await supabase.auth.getSession()

  // Skip middleware for public paths
  if (isPublicPath(request.nextUrl.pathname)) {
    return res
  }

  // If the user is not signed in, redirect to the sign-in page
  if (!session) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/access-portal'
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Allow access to the landing page for all users (signed in or not)
  // Removed automatic redirect from root path to let users see the landing page

  // If the user is signed in and trying to access the access portal, redirect to their dashboard
  if (session && request.nextUrl.pathname === '/access-portal') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile) {
      const redirectPath = profile.role === 'coordinator' ? '/coordinator' : '/student'
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }
  }

  // Protect coordinator routes
  if (session && request.nextUrl.pathname.startsWith('/coordinator')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'coordinator') {
      const redirectUrl = new URL('/access-denied', request.url)
      redirectUrl.searchParams.set('reason', 'unauthorized')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Protect student routes
  if (session && request.nextUrl.pathname.startsWith('/student')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'student') {
      const redirectUrl = new URL(profile?.role === 'coordinator' ? '/coordinator' : '/access-denied', request.url)
      redirectUrl.searchParams.set('reason', 'unauthorized')
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

// List of public paths that don't require authentication
const publicPaths = [
  '/',
  '/access-portal',
  '/access-denied',
  '/about',
  '/privacy-policy',
  '/terms-of-service',
  '/contact-support',
  // Auth routes
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/login',
  '/auth/signup',
  // Allow all files in the public directory
  '/*.jpg',
  '/*.jpeg',
  '/*.png',
  '/*.gif',
  '/*.svg',
  '/*.ico',
  '/*.webp',
  '/*.avif',
  // Next.js specific paths
  '/_next/static/*',
  '/_next/image*',
  '/_next/webpack-hmr*',
  // API and auth routes
  '/api/auth/*',
  '/api/health',
  // Common static files
  '/favicon.ico',
  '/manifest.json',
  '/site.webmanifest',
  '/robots.txt',
  '/sitemap.xml'
]

// Check if the current path is public
function isPublicPath(path: string): boolean {
  return publicPaths.some(publicPath => {
    if (publicPath.endsWith('*')) {
      return path.startsWith(publicPath.slice(0, -1))
    }
    return path === publicPath
  })
}

export const config = {
  matcher: [
    /*
     * Only run middleware on paths that don't match:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - All image files (jpg, jpeg, png, gif, svg, ico, webp, avif)
     * - Static files (txt, json, xml, etc.)
     * - API routes
     * - Public files
     * - Auth routes
     */
    '/((?!_next/static|_next/image|.*\\.(?:jpg|jpeg|png|gif|svg|ico|webp|avif|txt|json|xml)$|api/|auth/|access-portal|access-denied|about|privacy-policy|terms-of-service|contact-support).*)',
  ],
}
