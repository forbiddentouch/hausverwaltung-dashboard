'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut } from '@/lib/auth'
import {
  ChevronRight, Phone, Users, UserCheck, Calendar,
  Settings, ListTodo, Palette, Copy, LogOut, Menu, X,
} from 'lucide-react'

const menuItems = [
  { href: '/anrufe',      label: 'Anrufe',      icon: Phone },
  { href: '/kontakte',    label: 'Kontakte',     icon: Users },
  { href: '/mitarbeiter', label: 'Mitarbeiter',  icon: UserCheck },
  { href: '/kalender',    label: 'Kalender',     icon: Calendar, badge: 'Neu' },
]

const optionItems = [
  { href: '/einstellungen', label: 'Einstellungen', icon: Settings },
  { href: '/aufgaben',      label: 'Aufgaben',       icon: ListTodo },
  { href: '/stil',          label: 'Stil',           icon: Palette },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [brand, setBrand] = useState('#2563eb')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const load = () => setBrand(localStorage.getItem('immogreta_brand_color') || '#2563eb')
    load()
    window.addEventListener('storage', load)
    window.addEventListener('immogreta_brand_updated', load)
    return () => {
      window.removeEventListener('storage', load)
      window.removeEventListener('immogreta_brand_updated', load)
    }
  }, [])

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href))

  const NavLink = ({
    href, label, icon: Icon, badge,
  }: { href: string; label: string; icon: React.ElementType; badge?: string }) => {
    const active = isActive(href)
    return (
      <Link
        href={href}
        className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          active ? 'text-white' : 'text-slate-600 hover:bg-gray-50'
        }`}
        style={active ? { backgroundColor: brand } : undefined}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
          {label}
        </div>
        {badge && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded"
            style={active
              ? { backgroundColor: 'rgba(255,255,255,0.25)', color: '#fff' }
              : { backgroundColor: `${brand}20`, color: brand }}
          >
            {badge}
          </span>
        )}
      </Link>
    )
  }

  const sidebarContent = (
    <>
      {/* Branding */}
      <div className="px-4 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/greta-avatar.png" alt="ImmoGreta" width={36} height={36} className="w-full h-full object-cover object-top" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-900 text-sm leading-tight">ImmoGreta</p>
              <p className="text-xs text-slate-500 leading-tight">Hausverwaltung</p>
            </div>
          </div>
          {/* Close button on mobile, chevron on desktop */}
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 hover:bg-gray-100 rounded transition-colors lg:hidden"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded transition-colors hidden lg:block">
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 mb-3">Menu</p>
          <div className="space-y-1">
            {menuItems.map(({ href, label, icon, badge }) => (
              <NavLink key={href} href={href} label={label} icon={icon} badge={badge} />
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 mb-3">Optionen</p>
          <div className="space-y-1">
            {optionItems.map(({ href, label, icon }) => (
              <NavLink key={href} href={href} label={label} icon={icon} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-slate-200 space-y-4">
        <div className="bg-green-50 rounded-xl px-3 py-3 border border-green-200">
          <div className="flex gap-3">
            <div className="flex-shrink-0 pt-0.5">
              <Phone className="w-4 h-4 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-green-900">Rückrufaktion aktivieren</p>
              <p className="text-xs text-green-700 mt-1 leading-snug">
                Aktivieren Sie die Rückrufaktion, sodass ImmoGreta bei leeren Anrufen automatisch zurückruft.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2.5">
          <span className="text-xs font-medium text-slate-700">+1 (662) 439-4944</span>
          <button className="p-1 hover:bg-slate-200 rounded transition-colors">
            <Copy className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>

        <Link href="#" className="block text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors">
          Hilfe benötigt? →
        </Link>

        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          Abmelden
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-30 p-2 bg-white rounded-lg shadow-md border border-slate-200 lg:hidden"
        aria-label="Menü öffnen"
      >
        <Menu className="w-5 h-5 text-slate-700" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - mobile: slide-in overlay, desktop: fixed */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 flex flex-col z-50
          transition-transform duration-300 ease-in-out
          lg:w-56 lg:translate-x-0 lg:z-10
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
