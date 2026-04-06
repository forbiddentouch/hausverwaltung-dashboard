'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Ticket, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

function formatDate(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) {
    return 'Heute, ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  }
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Gestern, ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function PrioritaetBadge({ p }: { p: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    hoch: { label: 'Hoch', cls: 'bg-red-50 text-red-600' },
    mittel: { label: 'Mittel', cls: 'bg-amber-50 text-amber-600' },
    niedrig: { label: 'Niedrig', cls: 'bg-slate-50 text-slate-500' },
  }
  const s = map[p] ?? { label: p, cls: 'bg-slate-50 text-slate-500' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    offen: {
      label: 'Offen',
      cls: 'bg-orange-50 text-orange-600',
      icon: <AlertTriangle className="w-3 h-3" />,
    },
    in_bearbeitung: {
      label: 'In Bearbeitung',
      cls: 'bg-blue-50 text-blue-600',
      icon: <Clock className="w-3 h-3" />,
    },
    erledigt: {
      label: 'Erledigt',
      cls: 'bg-green-50 text-green-600',
      icon: <CheckCircle className="w-3 h-3" />,
    },
  }
  const s = map[status] ?? { label: status, cls: 'bg-slate-50 text-slate-500', icon: null }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
      {s.icon}
      {s.label}
    </span>
  )
}

const KATEGORIE_ICONS: Record<string, string> = {
  'Wasserschaden': '💧',
  'Heizung': '🔥',
  'Strom': '⚡',
  'Lärm': '🔊',
  'Schlüssel': '🔑',
  'Reparatur': '🔧',
  'Sonstiges': '📋',
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('tickets')
        .select('*')
        .order('erstellt_am', { ascending: false })
        .limit(100)
      setTickets((data ?? []) as Record<string, unknown>[])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const offen = tickets.filter(t => t.status === 'offen').length
  const inBearbeitung = tickets.filter(t => t.status === 'in_bearbeitung').length
  const erledigt = tickets.filter(t => t.status === 'erledigt').length

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Tickets</h1>
        <p className="text-slate-500 text-sm mt-1">Von Lisa automatisch erstellte Aufgaben</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-8">
        <div className="bg-white rounded-2xl p-4 lg:p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{offen}</p>
              <p className="text-xs text-slate-500">Offen</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 lg:p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{inBearbeitung}</p>
              <p className="text-xs text-slate-500 hidden sm:block">In Bearbeitung</p>
              <p className="text-xs text-slate-500 sm:hidden">In Bearb.</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 lg:p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{erledigt}</p>
              <p className="text-xs text-slate-500">Erledigt</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {tickets.length === 0 ? (
          <div className="py-16 text-center">
            <Ticket className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Noch keine Tickets vorhanden</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {tickets.map((ticket) => {
              const kategorie = ticket.kategorie as string
              const emoji = KATEGORIE_ICONS[kategorie] ?? '📋'
              return (
                <div key={ticket.id as string} className="px-4 py-3 lg:px-6 lg:py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                  <span className="text-xl flex-shrink-0" title={kategorie}>{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{kategorie}</p>
                    {(ticket.beschreibung as string | null) && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{ticket.beschreibung as string}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5 lg:hidden">{formatDate(ticket.erstellt_am as string)}</p>
                  </div>
                  <PrioritaetBadge p={ticket.prioritaet as string} />
                  <StatusBadge status={ticket.status as string} />
                  <p className="text-xs text-slate-400 hidden lg:block flex-shrink-0">{formatDate(ticket.erstellt_am as string)}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
