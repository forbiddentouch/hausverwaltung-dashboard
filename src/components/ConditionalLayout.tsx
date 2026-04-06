'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="ml-56 flex-1 min-h-full p-8 bg-slate-50">
        {children}
      </main>
    </div>
  )
}
