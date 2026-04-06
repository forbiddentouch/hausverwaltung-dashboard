import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser-side Supabase client – stores session in cookies so the
 * Next.js middleware (createServerClient) can read it server-side.
 * Use THIS client in all 'use client' components instead of the
 * plain createClient from @supabase/supabase-js.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Singleton for convenience in client components
let _client: ReturnType<typeof createBrowserClient> | null = null
export function getSupabaseBrowserClient() {
  if (!_client) _client = createSupabaseBrowserClient()
  return _client
}
