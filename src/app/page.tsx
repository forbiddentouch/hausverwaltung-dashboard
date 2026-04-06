'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Phone, Ticket, Clock, TrendingUp, ArrowRight, PhoneCall, PhoneMissed,
  Users, ListTodo, Timer, PhoneForwarded, AlertTriangle, CalendarClock, Inbox,
} from 'lucide-react'
import Link from 'next/link'

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return `Heute, ${d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`
  }
  return `Gestern, ${d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`
}

function formatDuration(sec: number | null) {
  if (!sec) return '—'
  const m = Math.floor(sec / 60)
  return m > 0 ? `${m} min` : `${sec}s`
}

function CallStatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    completed: 'bg-green-400',
    in_progress: 'bg-blue-400',
    missed: 'bg-red-400',
  }
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[status] ?? 'bg-slate-300'}`} />
}

function PrioBadge({ prio }: { prio: string }) {
  const map: Record<string, { bg: string; label: string }> = {
    hoch: { bg: 'bg-red-50 text-red-600', label: 'Dringend' },
    mittel: { bg: 'bg-yellow-50 text-yellow-700', label: 'Alltäglich' },
    niedrig: { bg: 'bg-slate-50 text-slate-500', label: 'Bei Gelegenheit' },
  }
  const style = map[prio] ?? map.niedrig
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${style.bg}`}>
      {style.label}
    </span>
  )
}

function PulsingDot() {
  return (
    <span className="relative inline-flex">
      <span className="animate-pulse w-2 h-2 bg-green-400 rounded-full" />
    </span>
  )
}

interface Stats {
  callsToday: number
  openTickets: number
  totalCalls: number
  forwardedCalls: number
  recentCalls: Record<string, unknown>[]
  recentTickets: Record<string, unknown>[]
  ticketsByPrio: { dringend: number; alltaeglich: number; beiGelegenheit: number }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    callsToday: 0,
    openTickets: 0,
    totalCalls: 0,
    forwardedCalls: 0,
    recentCalls: [],
    recentTickets: [],
    ticketsByPrio: { dringend: 0, alltaeglich: 0, beiGelegenheit: 0 },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const [callsToday, openTickets, totalCalls, forwardedCalls, recentCalls, recentTickets, ticketsHoch, ticketsMittel, ticketsNiedrig] = await Promise.all([
        supabase.from('calls').select('id', { count: 'exact', head: true }).gte('started_at', today.toISOString()),
        supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('status', 'offen'),
        supabase.from('calls').select('id', { count: 'exact', head: true }),
        supabase.from('calls').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('calls').select('*').order('started_at', { ascending: false }).limit(5),
        supabase.from('tickets').select('*').order('erstellt_am', { ascending: false }).limit(5),
        supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('status', 'offen').eq('prioritaet', 'hoch'),
        supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('status', 'offen').eq('prioritaet', 'mittel'),
        supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('status', 'offen').eq('prioritaet', 'niedrig'),
      ])

      setStats({
        callsToday: callsToday.count ?? 0,
        openTickets: openTickets.count ?? 0,
        totalCalls: totalCalls.count ?? 0,
        forwardedCalls: forwardedCalls.count ?? 0,
        recentCalls: (recentCalls.data ?? []) as Record<string, unknown>[],
        recentTickets: (recentTickets.data ?? []) as Record<string, unknown>[],
        ticketsByPrio: {
          dringend: ticketsHoch.count ?? 0,
          alltaeglich: ticketsMittel.count ?? 0,
          beiGelegenheit: ticketsNiedrig.count ?? 0,
        },
      })
      setLoading(false)
    }
    loadStats()
  }, [])

  const today = new Date()
  const dateString = today.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  const capitalizedDate = dateString.charAt(0).toUpperCase() + dateString.slice(1)

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Dashboard wird geladen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">{capitalizedDate}</p>
      </div>

      {/* ImmoGreta status banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl px-5 py-5 lg:px-8 lg:py-6 mb-6 flex items-center justify-between shadow-lg">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <PulsingDot />
            <span className="text-blue-100 text-sm font-semibold">ImmoGreta ist aktiv</span>
          </div>
          <h2 className="text-white font-bold text-lg lg:text-xl mb-1">Ihre KI-Assistentin nimmt Anrufe entgegen</h2>
          <p className="text-blue-100 text-xs lg:text-sm">+1 (662) 439-4944 · Automatische Ticket-Erstellung</p>
        </div>
        <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 ml-4">
          <div className="animate-bounce">
            <PhoneCall className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 lg:p-5 shadow-sm">
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
            <Phone className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-slate-900">{stats.callsToday}</p>
          <p className="text-sm font-semibold text-slate-700 mt-1">Anrufe heute</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 lg:p-5 shadow-sm">
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-3">
            <Ticket className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600" />
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-slate-900">{stats.openTickets}</p>
          <p className="text-sm font-semibold text-slate-700 mt-1">Offene Tickets</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 lg:p-5 shadow-sm">
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg bg-green-50 flex items-center justify-center mb-3">
            <PhoneForwarded className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-slate-900">{stats.forwardedCalls}</p>
          <p className="text-sm font-semibold text-slate-700 mt-1">Weitergeleitet</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 lg:p-5 shadow-sm">
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg bg-violet-50 flex items-center justify-center mb-3">
            <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-violet-600" />
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-slate-900">{stats.totalCalls}</p>
          <p className="text-sm font-semibold text-slate-700 mt-1">Anrufe gesamt</p>
        </div>
      </div>

      {/* Anfragen nach Priorität */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 lg:p-6 mb-6">
        <h2 className="text-sm font-bold text-slate-900 mb-4">Offene Anfragen nach Priorität</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 lg:p-4 text-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mx-auto mb-2" />
            <p className="text-2xl lg:text-3xl font-bold text-red-700">{stats.ticketsByPrio.dringend}</p>
            <p className="text-xs lg:text-sm font-semibold text-red-600 mt-1">Dringend</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 lg:p-4 text-center">
            <CalendarClock className="w-5 h-5 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl lg:text-3xl font-bold text-yellow-700">{stats.ticketsByPrio.alltaeglich}</p>
            <p className="text-xs lg:text-sm font-semibold text-yellow-600 mt-1">Alltäglich</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 lg:p-4 text-center">
            <Inbox className="w-5 h-5 text-slate-500 mx-auto mb-2" />
            <p className="text-2xl lg:text-3xl font-bold text-slate-700">{stats.ticketsByPrio.beiGelegenheit}</p>
            <p className="text-xs lg:text-sm font-semibold text-slate-500 mt-1">Bei Gelegenheit</p>
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent calls */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 lg:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Letzte Anrufe</h2>
            <Link href="/anrufe" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold">
              Alle anzeigen <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {stats.recentCalls.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <PhoneMissed className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 text-sm font-medium">Noch keine Anrufe</p>
              <p className="text-slate-400 text-xs mt-1">Ruf +1 (662) 439-4944 an</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.recentCalls.map((call) => (
                <div key={call.id as string} className="px-4 lg:px-6 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                  <CallStatusDot status={call.status as string} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {(call.caller_number as string) || 'Unbekannte Nummer'}
                    </p>
                    <p className="text-xs text-slate-500">{formatTime(call.started_at as string)}</p>
                  </div>
                  <span className="text-xs text-slate-500 flex-shrink-0">{formatDuration(call.duration_sec as number | null)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent tickets */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 lg:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Neueste Tickets</h2>
            <Link href="/tickets" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold">
              Alle anzeigen <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {stats.recentTickets.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Ticket className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 text-sm font-medium">Keine offenen Tickets</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.recentTickets.map((ticket) => (
                <div key={ticket.id as string} className="px-4 lg:px-6 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                  <div className="flex-shrink-0 text-lg">
                    {ticket.kategorie === 'Reparatur' && '🔧'}
                    {ticket.kategorie === 'Wartung' && '🛠️'}
                    {ticket.kategorie === 'Anfrage' && '❓'}
                    {ticket.kategorie === 'Beschwerde' && '⚠️'}
                    {!['Reparatur', 'Wartung', 'Anfrage', 'Beschwerde'].includes(ticket.kategorie as string) && '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{ticket.kategorie as string}</p>
                    {ticket.beschreibung && <p className="text-xs text-slate-500 truncate">{ticket.beschreibung as string}</p>}
                  </div>
                  <PrioBadge prio={ticket.prioritaet as string} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">3</p>
          <p className="text-sm font-semibold text-slate-700 mt-1">Aktive Mitarbeiter</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-3">
            <ListTodo className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">8</p>
          <p className="text-sm font-semibold text-slate-700 mt-1">Konfigurierte Aufgaben</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">24/7</p>
          <p className="text-sm font-semibold text-slate-700 mt-1">Verfügbarkeit</p>
        </div>
      </div>
    </div>
  )
}
