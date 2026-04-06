import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

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
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Public routes – always accessible
  if (pathname.startsWith('/login')) {
    if (user) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return supabaseResponse
  }

  // Onboarding is accessible for logged-in users
  if (pathname.startsWith('/onboarding')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return supabaseResponse
  }

  // Protect all other routes – must be logged in
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check if user has an organization – graceful fallback if table doesn't exist yet
  try {
    const { data: membership, error } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    // Only redirect to onboarding if query succeeded but no membership found
    if (!error && !membership) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  } catch {
    // Table doesn't exist yet (migration not run) – allow access anyway
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|greta-avatar.png|greta-avatar.svg).*)'],
}
