'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Phone, Ticket, Clock, TrendingUp, ArrowRight, PhoneMissed,
  Users, ListTodo, PhoneForwarded, AlertTriangle, CalendarClock, Inbox,
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
    completed: 'bg-[#34C759]',
    in_progress: 'bg-[#007AFF]',
    missed: 'bg-[#FF3B30]',
  }
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[status] ?? 'bg-[#AEAEB2]'}`} />
}

function PrioBadge({ prio }: { prio: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    hoch:    { cls: 'bg-[#FF3B301A] text-[#FF3B30]', label: 'Dringend' },
    mittel:  { cls: 'bg-[#FF95001A] text-[#FF9500]', label: 'Alltäglich' },
    niedrig: { cls: 'bg-[#F5F5F7] text-[#6E6E73]',   label: 'Gelegenheit' },
  }
  const style = map[prio] ?? map.niedrig
  return (
    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${style.cls}`}>
      {style.label}
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
    callsToday: 0, openTickets: 0, totalCalls: 0, forwardedCalls: 0,
    recentCalls: [], recentTickets: [],
    ticketsByPrio: { dringend: 0, alltaeglich: 0, beiGelegenheit: 0 },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      try {
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
      } catch (err) {
        console.error('Dashboard load error:', err)
      }
      setLoading(false)
    }
    loadStats()
  }, [])

  const capitalizedDate = (() => {
    const s = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    return s.charAt(0).toUpperCase() + s.slice(1)
  })()

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#6E6E73]">Wird geladen…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-[#1D1D1F] tracking-tight">Dashboard</h1>
        <p className="text-[#6E6E73] text-sm mt-1">{capitalizedDate}</p>
      </div>

      {/* Status banner */}
      <div className="bg-[#007AFF] rounded-2xl px-5 py-5 lg:px-7 lg:py-6 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
          <span className="text-white/90 text-sm font-medium">ImmoGreta ist aktiv</span>
        </div>
        <p className="text-white/70 text-sm font-medium tracking-wide">+1 (662) 439-4944</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Phone,         bg: 'bg-[#007AFF1A]', iconCls: 'text-[#007AFF]', value: stats.callsToday,    label: 'Anrufe heute' },
          { icon: Ticket,        bg: 'bg-[#FF95001A]', iconCls: 'text-[#FF9500]', value: stats.openTickets,   label: 'Offene Tickets' },
          { icon: PhoneForwarded,bg: 'bg-[#34C7591A]', iconCls: 'text-[#34C759]', value: stats.forwardedCalls,label: 'Weitergeleitet' },
          { icon: TrendingUp,    bg: 'bg-[#AF52DE1A]', iconCls: 'text-[#AF52DE]', value: stats.totalCalls,    label: 'Anrufe gesamt' },
        ].map(({ icon: Icon, bg, iconCls, value, label }) => (
          <div key={label} className="bg-white rounded-2xl p-4 lg:p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${iconCls}`} />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-[#1D1D1F] tracking-tight">{value}</p>
            <p className="text-xs font-medium text-[#6E6E73] mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Offene Anfragen nach Priorität */}
      <div className="bg-white rounded-2xl p-4 lg:p-6 mb-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h2 className="text-sm font-semibold text-[#1D1D1F] mb-4">Offene Anfragen nach Priorität</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#FF3B301A] rounded-2xl p-3 lg:p-4 text-center">
            <AlertTriangle className="w-5 h-5 text-[#FF3B30] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#FF3B30]">{stats.ticketsByPrio.dringend}</p>
            <p className="text-xs font-semibold text-[#FF3B30] mt-1">Dringend</p>
          </div>
          <div className="bg-[#FF95001A] rounded-2xl p-3 lg:p-4 text-center">
            <CalendarClock className="w-5 h-5 text-[#FF9500] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#FF9500]">{stats.ticketsByPrio.alltaeglich}</p>
            <p className="text-xs font-semibold text-[#FF9500] mt-1">Alltäglich</p>
          </div>
          <div className="bg-[#F5F5F7] rounded-2xl p-3 lg:p-4 text-center">
            <Inbox className="w-5 h-5 text-[#AEAEB2] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#3A3A3C]">{stats.ticketsByPrio.beiGelegenheit}</p>
            <p className="text-xs font-semibold text-[#6E6E73] mt-1">Gelegenheit</p>
          </div>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Recent calls */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div className="px-4 lg:px-5 py-4 flex items-center justify-between border-b border-[#F5F5F7]">
            <h2 className="text-sm font-semibold text-[#1D1D1F]">Letzte Anrufe</h2>
            <Link href="/anrufe" className="text-xs text-[#007AFF] font-medium flex items-center gap-1 hover:opacity-70 transition-opacity">
              Alle anzeigen <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {stats.recentCalls.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <PhoneMissed className="w-10 h-10 text-[#AEAEB2] mx-auto mb-3" />
              <p className="text-sm font-medium text-[#3A3A3C]">Noch keine Anrufe</p>
              <p className="text-xs text-[#AEAEB2] mt-1">+1 (662) 439-4944 anrufen</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F5F5F7]">
              {stats.recentCalls.map((call) => (
                <div key={call.id as string} className="px-4 lg:px-5 py-3 flex items-center gap-3 hover:bg-[#F5F5F7] transition-colors">
                  <CallStatusDot status={call.status as string} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1D1D1F] truncate">
                      {(call.caller_number as string) || 'Unbekannte Nummer'}
                    </p>
                    <p className="text-xs text-[#AEAEB2]">{formatTime(call.started_at as string)}</p>
                  </div>
                  <span className="text-xs text-[#AEAEB2] flex-shrink-0">{formatDuration(call.duration_sec as number | null)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent tickets */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div className="px-4 lg:px-5 py-4 flex items-center justify-between border-b border-[#F5F5F7]">
            <h2 className="text-sm font-semibold text-[#1D1D1F]">Neueste Tickets</h2>
            <Link href="/tickets" className="text-xs text-[#007AFF] font-medium flex items-center gap-1 hover:opacity-70 transition-opacity">
              Alle anzeigen <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {stats.recentTickets.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Ticket className="w-10 h-10 text-[#AEAEB2] mx-auto mb-3" />
              <p className="text-sm font-medium text-[#3A3A3C]">Keine offenen Tickets</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F5F5F7]">
              {stats.recentTickets.map((ticket) => (
                <div key={ticket.id as string} className="px-4 lg:px-5 py-3 flex items-center gap-3 hover:bg-[#F5F5F7] transition-colors">
                  <span className="text-lg flex-shrink-0">
                    {ticket.kategorie === 'Reparatur' ? '🔧' : ticket.kategorie === 'Wartung' ? '🛠️' : ticket.kategorie === 'Anfrage' ? '❓' : ticket.kategorie === 'Beschwerde' ? '⚠️' : '📋'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1D1D1F] truncate">{ticket.kategorie as string}</p>
                    {ticket.beschreibung ? <p className="text-xs text-[#AEAEB2] truncate">{String(ticket.beschreibung)}</p> : null}
                  </div>
                  <PrioBadge prio={ticket.prioritaet as string} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Users,   bg: 'bg-[#007AFF1A]', iconCls: 'text-[#007AFF]', value: '3',    label: 'Aktive Mitarbeiter' },
          { icon: ListTodo,bg: 'bg-[#AF52DE1A]', iconCls: 'text-[#AF52DE]', value: '8',    label: 'Konfigurierte Aufgaben' },
          { icon: Clock,   bg: 'bg-[#34C7591A]', iconCls: 'text-[#34C759]', value: '24/7', label: 'Verfügbarkeit' },
        ].map(({ icon: Icon, bg, iconCls, value, label }) => (
          <div key={label} className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${iconCls}`} />
            </div>
            <p className="text-2xl font-bold text-[#1D1D1F] tracking-tight">{value}</p>
            <p className="text-xs font-medium text-[#6E6E73] mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
