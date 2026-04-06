'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import FloatingGreta from './FloatingGreta'
import BrandStyle from './BrandStyle'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'
  const isOnboardingPage = pathname === '/onboarding'

  if (isLoginPage || isOnboardingPage) {
    return <>{children}</>
  }

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
