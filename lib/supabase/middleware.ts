import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Public paths that never need Supabase session handling
const PUBLIC_PREFIXES = ['/api/demo/', '/api/demo-status']

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Skip Supabase session handling for public API routes and when env vars are missing
  const pathname = request.nextUrl.pathname
  const isPublicRoute = PUBLIC_PREFIXES.some(p => pathname.startsWith(p))

  if (isPublicRoute || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Still protect dashboard routes even if Supabase isn't configured
    if (pathname.startsWith('/dashboard') && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Redirect logged-in users away from auth pages (except signout)
  if (request.nextUrl.pathname.startsWith('/auth/') && 
      !request.nextUrl.pathname.includes('/signout') &&
      !request.nextUrl.pathname.includes('/callback') &&
      user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}
