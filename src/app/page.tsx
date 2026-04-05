import { supabase } from '@/lib/supabase'
import { Phone, Ticket, Clock, TrendingUp, ArrowRight, PhoneCall, PhoneMissed } from 'lucide-react'
import Link from 'next/link'

async function getStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [callsToday, openTickets, totalCalls, recentCalls] = await Promise.all([
    supabase.from('calls').select('id', { count: 'exact', head: true }).gte('started_at', today.toISOString()),
    supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('status', 'offen'),
    supabase.from('calls').select('id', { count: 'exact', head: true }),
    supabase.from('calls').select('*').order('started_at', { ascending: false }).limit(5),
  ])

  return {
    callsToday: callsToday.count ?? 0,
    openTickets: openTickets.count ?? 0,
    totalCalls: totalCalls.count ?? 0,
    recentCalls: (recentCalls.data ?? []) as Record<string, unknown>[],
  }
}

function formatDuration(sec: number | null) {
  if (!sec) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return `Heute, ${formatTime(iso)}`
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) + ' ' + formatTime(iso)
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    completed: { label: 'Abgeschlossen', cls: 'bg-green-100 text-green-700' },
    in_progress: { label: 'Laufend', cls: 'bg-blue-100 text-blue-700' },
    missed: { label: 'Verpasst', cls: 'bg-red-100 text-red-700' },
  }
  const s = map[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  )
}

export default async function DashboardPage() {
  const stats = await getStats()

  const kpis = [
    { label: 'Anrufe heute', value: stats.callsToday, icon: Phone, color: 'bg-blue-50 text-blue-600', sub: 'Lisa war aktiv' },
    { label: 'Offene Tickets', value: stats.openTickets, icon: Ticket, color: 'bg-orange-50 text-orange-600', sub: 'Handlungsbedarf' },
    { label: 'Anrufe gesamt', value: stats.totalCalls, icon: TrendingUp, color: 'bg-green-50 text-green-600', sub: 'Seit Start' },
    { label: 'Verfügbarkeit', value: '24/7', icon: Clock, color: 'bg-violet-50 text-violet-600', sub: 'Immer erreichbar' },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Übersicht</h1>
        <p className="text-slate-500 text-sm mt-1">
          {new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Lisa Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 mb-8 text-white flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-blue-100 text-sm font-medium">Lisa ist aktiv</span>
          </div>
          <h2 className="text-xl font-bold">Ihre KI-Assistentin nimmt Anrufe entgegen</h2>
          <p className="text-blue-100 text-sm mt-1">+1 (662) 439-4944 · Automatische Ticket-Erstellung</p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <PhoneCall className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-sm font-medium text-slate-700 mt-0.5">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Recent Calls */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Letzte Anrufe</h2>
          <Link href="/anrufe" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
            Alle anzeigen <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats.recentCalls.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <PhoneMissed className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Noch keine Anrufe</p>
            <p className="text-slate-300 text-xs mt-1">Ruf +1 (662) 439-4944 an um den Test zu starten</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {stats.recentCalls.map((call) => (
              <div key={call.id as string} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">
                    {(call.caller_number as string) || 'Unbekannte Nummer'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDate(call.started_at as string)} · {formatDuration(call.duration_sec as number | null)}
                  </p>
                </div>
                <StatusBadge status={call.status as string} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
