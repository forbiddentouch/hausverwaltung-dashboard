'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronRight,
  Phone,
  Users,
  UserCheck,
  Calendar,
  Settings,
  ListTodo,
  Palette,
  Copy,
} from 'lucide-react'

const menuItems = [
  { href: '/anrufe', label: 'Anrufe', icon: Phone },
  { href: '/kontakte', label: 'Kontakte', icon: Users },
  { href: '/mitarbeiter', label: 'Mitarbeiter', icon: UserCheck },
  { href: '/kalender', label: 'Kalender', icon: Calendar, badge: 'Neu' },
]

const optionItems = [
  { href: '/einstellungen', label: 'Einstellungen', icon: Settings },
  { href: '/aufgaben', label: 'Aufgaben', icon: ListTodo },
  { href: '/stil', label: 'Stil', icon: Palette },
]

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href))

  const NavLink = ({ href, label, icon: Icon, badge }: { href: string; label: string; icon: any; badge?: string }) => {
    const active = isActive(href)
    return (
      <Link
        href={href}
        className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          active ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
          {label}
        </div>
        {badge && (
          <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
            {badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-white border-r border-slate-200 flex flex-col z-10">
      {/* TOP: ImmoGreta branding with avatar */}
      <div className="px-4 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {/* Avatar image */}
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/greta-avatar.svg"
                alt="ImmoGreta"
                width={36}
                height={36}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-900 text-sm leading-tight">ImmoGreta</p>
              <p className="text-xs text-slate-500 leading-tight">Hausverwaltung</p>
            </div>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded transition-colors">
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* MENU section */}
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 mb-3">Menu</p>
          <div className="space-y-1">
            {menuItems.map(({ href, label, icon, badge }) => (
              <NavLink key={href} href={href} label={label} icon={icon} badge={badge} />
            ))}
          </div>
        </div>

        {/* OPTIONEN section */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 mb-3">Optionen</p>
          <div className="space-y-1">
            {optionItems.map(({ href, label, icon }) => (
              <NavLink key={href} href={href} label={label} icon={icon} />
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM area */}
      <div className="px-3 py-4 border-t border-slate-200 space-y-4">
        {/* Green card */}
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

        {/* Phone number */}
        <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2.5">
          <span className="text-xs font-medium text-slate-700">+1 (662) 439-4944</span>
          <button className="p-1 hover:bg-slate-200 rounded transition-colors">
            <Copy className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>

        {/* Help link */}
        <Link href="#" className="block text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors">
          Hilfe benötigt? →
        </Link>
      </div>
    </aside>
  )
}
