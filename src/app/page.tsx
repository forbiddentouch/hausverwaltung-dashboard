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
  if (d.toDateString() === now.toDateString())
    return `Heute, ${d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`
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
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[status] ?? 'bg-[#C7C7CC]'}`} />
}

function PrioBadge({ prio }: { prio: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    hoch:    { cls: 'bg-[#FF3B301A] text-[#FF3B30]', label: 'Dringend' },
    mittel:  { cls: 'bg-[#FF95001A] text-[#FF9500]', label: 'Alltäglich' },
    niedrig: { cls: 'bg-[#F2F2F7] text-[#6E6E73]',   label: 'Gelegenheit' },
  }
  const s = map[prio] ?? map.niedrig
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>
}

interface Stats {
  callsToday: number; openTickets: number; totalCalls: number; forwardedCalls: number
  recentCalls: Record<string, unknown>[]; recentTickets: Record<string, unknown>[]
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
      const today = new Date(); today.setHours(0, 0, 0, 0)
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
          callsToday: callsToday.count ?? 0, openTickets: openTickets.count ?? 0,
          totalCalls: totalCalls.count ?? 0, forwardedCalls: forwardedCalls.count ?? 0,
          recentCalls: (recentCalls.data ?? []) as Record<string, unknown>[],
          recentTickets: (recentTickets.data ?? []) as Record<string, unknown>[],
          ticketsByPrio: { dringend: ticketsHoch.count ?? 0, alltaeglich: ticketsMittel.count ?? 0, beiGelegenheit: ticketsNiedrig.count ?? 0 },
        })
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    loadStats()
  }, [])

  const capitalizedDate = (() => {
    const s = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    return s.charAt(0).toUpperCase() + s.slice(1)
  })()

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="pt-2">
        <h1 className="text-3xl lg:text-4xl font-bold text-[#1D1D1F] tracking-tight">Dashboard</h1>
        <p className="text-[#6E6E73] text-sm mt-1.5">{capitalizedDate}</p>
      </div>

      {/* Status banner */}
      <div className="bg-[#1D1D1F] rounded-3xl px-6 py-5 lg:px-8 lg:py-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
            <span className="text-white/70 text-xs font-medium uppercase tracking-widest">Live</span>
          </div>
          <p className="text-white text-lg font-semibold tracking-tight">ImmoGreta ist aktiv</p>
          <p className="text-white/50 text-sm mt-0.5 font-medium">+1 (662) 439-4944</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
          <Phone className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Phone,          bg: '#007AFF', value: stats.callsToday,     label: 'Anrufe heute' },
          { icon: Ticket,         bg: '#FF9500', value: stats.openTickets,    label: 'Offene Tickets' },
          { icon: PhoneForwarded, bg: '#34C759', value: stats.forwardedCalls, label: 'Weitergeleitet' },
          { icon: TrendingUp,     bg: '#AF52DE', value: stats.totalCalls,     label: 'Gesamt' },
        ].map(({ icon: Icon, bg, value, label }) => (
          <div key={label} className="bg-white rounded-3xl p-5 lg:p-6" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ background: bg }}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-3xl lg:text-4xl font-bold text-[#1D1D1F] tracking-tight leading-none">{value}</p>
            <p className="text-xs text-[#6E6E73] mt-2 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Prioritäten */}
      <div className="bg-white rounded-3xl p-5 lg:p-6" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <h2 className="text-base font-bold text-[#1D1D1F] tracking-tight mb-4">Offene Anfragen</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: AlertTriangle,  bg: '#FF3B301A', iconColor: '#FF3B30', value: stats.ticketsByPrio.dringend,      label: 'Dringend' },
            { icon: CalendarClock,  bg: '#FF95001A', iconColor: '#FF9500', value: stats.ticketsByPrio.alltaeglich,   label: 'Alltäglich' },
            { icon: Inbox,          bg: '#F2F2F7',   iconColor: '#AEAEB2', value: stats.ticketsByPrio.beiGelegenheit,label: 'Gelegenheit' },
          ].map(({ icon: Icon, bg, iconColor, value, label }) => (
            <div key={label} className="rounded-2xl p-4 text-center" style={{ background: bg }}>
              <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: iconColor }} />
              <p className="text-2xl font-bold tracking-tight" style={{ color: iconColor }}>{value}</p>
              <p className="text-xs font-semibold mt-1" style={{ color: iconColor }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Letzte Anrufe */}
        <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="px-5 py-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1D1D1F] tracking-tight">Letzte Anrufe</h2>
            <Link href="/anrufe" className="flex items-center gap-1 text-xs font-semibold text-[#007AFF] hover:opacity-70 transition-opacity">
              Alle <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="h-px bg-[#F2F2F7] mx-5" />
          {stats.recentCalls.length === 0 ? (
            <div className="py-12 text-center">
              <PhoneMissed className="w-10 h-10 text-[#C7C7CC] mx-auto mb-3" />
              <p className="text-sm font-medium text-[#3A3A3C]">Noch keine Anrufe</p>
            </div>
          ) : (
            <div>
              {stats.recentCalls.map((call, i) => (
                <div key={call.id as string}>
                  <div className="px-5 py-3.5 flex items-center gap-3 hover:bg-[#F9F9F9] transition-colors">
                    <CallStatusDot status={call.status as string} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1D1D1F] truncate">{(call.caller_number as string) || 'Unbekannt'}</p>
                      <p className="text-xs text-[#AEAEB2] mt-0.5">{formatTime(call.started_at as string)}</p>
                    </div>
                    <span className="text-xs font-medium text-[#AEAEB2]">{formatDuration(call.duration_sec as number | null)}</span>
                  </div>
                  {i < stats.recentCalls.length - 1 && <div className="h-px bg-[#F2F2F7] ml-14" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Neueste Tickets */}
        <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="px-5 py-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1D1D1F] tracking-tight">Neueste Tickets</h2>
            <Link href="/tickets" className="flex items-center gap-1 text-xs font-semibold text-[#007AFF] hover:opacity-70 transition-opacity">
              Alle <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="h-px bg-[#F2F2F7] mx-5" />
          {stats.recentTickets.length === 0 ? (
            <div className="py-12 text-center">
              <Ticket className="w-10 h-10 text-[#C7C7CC] mx-auto mb-3" />
              <p className="text-sm font-medium text-[#3A3A3C]">Keine offenen Tickets</p>
            </div>
          ) : (
            <div>
              {stats.recentTickets.map((ticket, i) => (
                <div key={ticket.id as string}>
                  <div className="px-5 py-3.5 flex items-center gap-3 hover:bg-[#F9F9F9] transition-colors">
                    <span className="text-xl flex-shrink-0">
                      {ticket.kategorie === 'Reparatur' ? '🔧' : ticket.kategorie === 'Wartung' ? '🛠️' : ticket.kategorie === 'Anfrage' ? '❓' : ticket.kategorie === 'Beschwerde' ? '⚠️' : '📋'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1D1D1F] truncate">{ticket.kategorie as string}</p>
                      {ticket.beschreibung ? <p className="text-xs text-[#AEAEB2] truncate mt-0.5">{String(ticket.beschreibung)}</p> : null}
                    </div>
                    <PrioBadge prio={ticket.prioritaet as string} />
                  </div>
                  {i < stats.recentTickets.length - 1 && <div className="h-px bg-[#F2F2F7] ml-14" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Schnellzugriff */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4">
        {[
          { icon: Users,    bg: '#007AFF', value: '3',    label: 'Mitarbeiter aktiv' },
          { icon: ListTodo, bg: '#AF52DE', value: '8',    label: 'Aufgaben konfiguriert' },
          { icon: Clock,    bg: '#34C759', value: '24/7', label: 'Verfügbarkeit' },
        ].map(({ icon: Icon, bg, value, label }) => (
          <div key={label} className="bg-white rounded-3xl p-5 flex items-center gap-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1D1D1F] tracking-tight leading-none">{value}</p>
              <p className="text-xs text-[#6E6E73] font-medium mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
