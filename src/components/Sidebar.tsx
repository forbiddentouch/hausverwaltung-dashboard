'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut } from '@/lib/auth'
import {
  Phone, Users, UserCheck, Calendar,
  Settings, ListTodo, Copy, LogOut, Menu, X,
  LayoutDashboard, Link2, ChevronRight,
} from 'lucide-react'

const menuItems = [
  { href: '/',            label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/anrufe',      label: 'Anrufe',       icon: Phone },
  { href: '/kontakte',    label: 'Kontakte',     icon: Users },
  { href: '/mitarbeiter', label: 'Mitarbeiter',  icon: UserCheck },
  { href: '/kalender',    label: 'Kalender',     icon: Calendar },
]

const optionItems = [
  { href: '/einstellungen',   label: 'Einstellungen',  icon: Settings },
  { href: '/integrationen',   label: 'Integrationen',  icon: Link2 },
  { href: '/aufgaben',        label: 'Aufgaben',       icon: ListTodo },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => { setMobileOpen(false) }, [pathname])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href)

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
    const active = isActive(href)
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
          active
            ? 'bg-[#007AFF] text-white'
            : 'text-[#3A3A3C] hover:bg-[#F5F5F7]'
        }`}
      >
        <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? 'text-white' : 'text-[#6E6E73]'}`} />
        <span className="flex-1">{label}</span>
      </Link>
    )
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header / Branding */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 flex-1 min-w-0" onClick={() => setMobileOpen(false)}>
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/greta-avatar.png" alt="ImmoGreta" width={36} height={36} className="w-full h-full object-cover object-top" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#1D1D1F] text-sm leading-tight tracking-tight">ImmoGreta</p>
              <p className="text-xs text-[#6E6E73] leading-tight mt-0.5">Hausverwaltung</p>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 hover:bg-[#F5F5F7] rounded-lg transition-colors lg:hidden"
          >
            <X className="w-4 h-4 text-[#6E6E73]" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 overflow-y-auto">
        <div className="mb-5">
          <p className="text-[10px] font-semibold text-[#AEAEB2] uppercase tracking-widest px-3 mb-2">Menü</p>
          <div className="space-y-0.5">
            {menuItems.map(({ href, label, icon }) => (
              <NavLink key={href} href={href} label={label} icon={icon} />
            ))}
          </div>
        </div>
        <div className="mb-4">
          <p className="text-[10px] font-semibold text-[#AEAEB2] uppercase tracking-widest px-3 mb-2">Optionen</p>
          <div className="space-y-0.5">
            {optionItems.map(({ href, label, icon }) => (
              <NavLink key={href} href={href} label={label} icon={icon} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="px-3 py-4 space-y-3 border-t border-[#E5E5EA]">
        {/* Callback promo */}
        <div className="bg-[#F5F5F7] rounded-2xl px-3 py-3">
          <div className="flex gap-2.5">
            <Phone className="w-4 h-4 text-[#007AFF] flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#1D1D1F]">Rückrufaktion aktivieren</p>
              <p className="text-xs text-[#6E6E73] mt-1 leading-snug">
                Automatischer Rückruf bei verpassten Anrufen.
              </p>
            </div>
          </div>
        </div>

        {/* Phone number */}
        <div className="flex items-center justify-between bg-[#F5F5F7] rounded-xl px-3 py-2.5">
          <span className="text-xs font-medium text-[#1D1D1F]">+1 (662) 439-4944</span>
          <button className="p-1 hover:bg-[#E5E5EA] rounded-lg transition-colors">
            <Copy className="w-3.5 h-3.5 text-[#6E6E73]" />
          </button>
        </div>

        {/* Help */}
        <Link
          href="#"
          className="flex items-center gap-2 px-1 text-xs text-[#007AFF] font-medium hover:opacity-70 transition-opacity"
        >
          Hilfe benötigt?
          <ChevronRight className="w-3 h-3" />
        </Link>

        {/* Logout */}
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#6E6E73] hover:text-[#FF3B30] hover:bg-[#FF3B301A] rounded-xl transition-all font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          Abmelden
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-30 p-2 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-[#E5E5EA] lg:hidden"
        aria-label="Menü öffnen"
      >
        <Menu className="w-5 h-5 text-[#1D1D1F]" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-[#E5E5EA] z-50
          transition-transform duration-300 ease-in-out
          lg:w-56 lg:translate-x-0 lg:z-10
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
