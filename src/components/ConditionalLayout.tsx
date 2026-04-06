'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from './Sidebar'
import FloatingGreta from './FloatingGreta'
import BrandStyle from './BrandStyle'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')

  const isPublicPage = pathname === '/login' || pathname === '/reset-password'
  const isOnboardingPage = pathname === '/onboarding'

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        setAuthState('authenticated')
        // Logged-in user on login page → redirect to dashboard
        if (isPublicPage) {
          router.replace('/')
        }
      } else {
        setAuthState('unauthenticated')
        // Not logged in and not on a public page → redirect to login
        if (!isPublicPage) {
          router.replace('/login')
        }
      }
    }

    checkAuth()

    // Listen for auth state changes (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuthState('authenticated')
      } else {
        setAuthState('unauthenticated')
        if (!isPublicPage) {
          router.replace('/login')
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname, isPublicPage, router])

  // Public pages: render immediately
  if (isPublicPage) {
    return <>{children}</>
  }

  // Loading state while checking auth
  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Laden...</p>
        </div>
      </div>
    )
  }

  // Not authenticated → will redirect, show nothing
  if (authState === 'unauthenticated') {
    return null
  }

  // Onboarding page: no sidebar
  if (isOnboardingPage) {
    return <>{children}</>
  }

  // Authenticated: full layout
  return (
    <div className="flex h-full">
      <BrandStyle />
      <Sidebar />
      <main className="ml-56 flex-1 min-h-full p-8 bg-slate-50">
        {children}
      </main>
      <FloatingGreta />
    </div>
  )
}
