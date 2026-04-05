'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Phone,
  Ticket,
  Building2,
  Settings,
  Radio,
} from 'lucide-react'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/anrufe', label: 'Anrufe', icon: Phone },
  { href: '/tickets', label: 'Tickets', icon: Ticket },
  { href: '/mandanten', label: 'Mandanten', icon: Building2 },
  { href: '/einstellungen', label: 'Einstellungen', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-slate-100 flex flex-col z-10">
      {/* Logo / Brand */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm leading-tight">Lisa AI</p>
            <p className="text-xs text-slate-400 leading-tight">Hausverwaltung</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Lisa Status */}
      <div className="px-4 py-4 border-t border-slate-100">
        <div className="bg-green-50 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
              L
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">Lisa ist aktiv</p>
            <p className="text-xs text-slate-400">24/7 erreichbar</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
