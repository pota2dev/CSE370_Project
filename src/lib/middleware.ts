import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if the route is a protected route that requires authentication
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith('/createRoom') || 
    request.nextUrl.pathname.startsWith('/protected') ||
    (request.nextUrl.pathname.startsWith('/api/rooms') && 
     request.method !== 'GET'); // Only protect POST, PUT, DELETE operations

  if (!user && isProtectedRoute) {
    // Store the original URL to redirect back after login
    const redirectTo = request.nextUrl.pathname;
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirectTo', redirectTo);
    return NextResponse.redirect(url);
  }
  
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // If the user is attempting to access the room creation API without being authenticated
  if (!user && request.nextUrl.pathname.startsWith('/api/rooms') && request.method === 'POST') {
    return NextResponse.json(
      { error: 'Unauthorized: You must be logged in to create a room' },
      { status: 401 }
    );
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  return supabaseResponse
}