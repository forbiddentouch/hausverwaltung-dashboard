import { supabase } from '@/lib/supabase'
import { Phone, Ticket, Clock, TrendingUp, ArrowRight, PhoneCall, PhoneMissed } from 'lucide-react'
import Link from 'next/link'

async function getStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [callsToday, openTickets, totalCalls, recentCalls, recentTickets] = await Promise.all([
    supabase.from('calls').select('id', { count: 'exact', head: true }).gte('started_at', today.toISOString()),
    supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('status', 'offen'),
    supabase.from('calls').select('id', { count: 'exact', head: true }),
    supabase.from('calls').select('*').order('started_at', { ascending: false }).limit(5),
    supabase.from('tickets').select('*').order('erstellt_am', { ascending: false }).limit(4),
  ])

  return {
    callsToday: callsToday.count ?? 0,
    openTickets: openTickets.count ?? 0,
    totalCalls: totalCalls.count ?? 0,
    recentCalls: (recentCalls.data ?? []) as Record<string, unknown>[],
    recentTickets: (recentTickets.data ?? []) as Record<string, unknown>[],
  }
}

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
  const map: Record<string, string> = {
    hoch: 'bg-red-50 text-red-600',
    mittel: 'bg-yellow-50 text-yellow-700',
    niedrig: 'bg-slate-50 text-slate-500',
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[prio] ?? 'bg-slate-50 text-slate-500'}`}>
      {prio}
    </span>
  )
}

export default async function DashboardPage() {
  const stats = await getStats()

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Übersicht</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Lisa Banner */}
      <div className="bg-blue-600 rounded-xl px-6 py-4 mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-blue-100 text-xs font-medium">Lisa ist aktiv</span>
          </div>
          <p className="text-white font-semibold text-base">Ihre KI-Assistentin nimmt Anrufe entgegen</p>
          <p className="text-blue-200 text-xs mt-0.5">+1 (662) 439-4944 · Automatische Ticket-Erstellung</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
          <PhoneCall className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Anrufe heute', value: stats.callsToday, icon: Phone, sub: 'Lisa war aktiv', iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
          { label: 'Offene Tickets', value: stats.openTickets, icon: Ticket, sub: 'Handlungsbedarf', iconBg: 'bg-orange-50', iconColor: 'text-orange-500' },
          { label: 'Anrufe gesamt', value: stats.totalCalls, icon: TrendingUp, sub: 'Seit Start', iconBg: 'bg-green-50', iconColor: 'text-green-500' },
          { label: 'Verfügbarkeit', value: '24/7', icon: Clock, sub: 'Immer erreichbar', iconBg: 'bg-violet-50', iconColor: 'text-violet-500' },
        ].map(({ label, value, icon: Icon, sub, iconBg, iconColor }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
            </div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-sm font-medium text-slate-600 mt-0.5">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* Recent calls */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Letzte Anrufe</h2>
            <Link href="/anrufe" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5 font-medium">
              Alle anzeigen <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {stats.recentCalls.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <PhoneMissed className="w-8 h-8 text-slate-150 mx-auto mb-2" />
              <p className="text-slate-300 text-sm">Noch keine Anrufe</p>
              <p className="text-slate-200 text-xs mt-0.5">Ruf +1 (662) 439-4944 an</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {stats.recentCalls.map((call) => (
                <div key={call.id as string} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                  <CallStatusDot status={call.status as string} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 font-medium truncate">
                      {(call.caller_number as string) || 'Unbekannte Nummer'}
                    </p>
                    <p className="text-xs text-slate-400">{formatTime(call.started_at as string)}</p>
                  </div>
                  <span className="text-xs text-slate-400">{formatDuration(call.duration_sec as number | null)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent tickets */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Offene Tickets</h2>
            <Link href="/tickets" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5 font-medium">
              Alle anzeigen <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {stats.recentTickets.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Ticket className="w-8 h-8 text-slate-150 mx-auto mb-2" />
              <p className="text-slate-300 text-sm">Keine offenen Tickets</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {stats.recentTickets.map((ticket) => (
                <div key={ticket.id as string} className="px-5 py-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 font-medium truncate">{ticket.kategorie as string}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{(ticket.beschreibung as string) || '—'}</p>
                  </div>
                  <PrioBadge prio={ticket.prioritaet as string} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
