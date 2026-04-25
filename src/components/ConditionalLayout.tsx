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
        if (isPublicPage) {
          router.replace('/')
        }
      } else {
        setAuthState('unauthenticated')
        if (!isPublicPage) {
          router.replace('/login')
        }
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: unknown) => {
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

  if (isPublicPage) {
    return <>{children}</>
  }

  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#6E6E73]">Laden…</p>
        </div>
      </div>
    )
  }

  if (authState === 'unauthenticated') {
    return null
  }

  if (isOnboardingPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-full">
      <BrandStyle />
      <Sidebar />
      <main className="flex-1 min-h-full p-4 pt-16 bg-[#F5F5F7] lg:ml-56 lg:p-8 lg:pt-8">
        {children}
      </main>
      <FloatingGreta />
    </div>
  )
}
