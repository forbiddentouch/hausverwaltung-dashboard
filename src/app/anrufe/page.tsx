'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Phone, PhoneMissed, PhoneCall, Clock, Search, ChevronDown, ChevronUp } from 'lucide-react'

type Call = {
  id: string
  caller_number: string | null
  status: string
  started_at: string
  ended_at: string | null
  duration_sec: number | null
  transcript: string | null
  summary: string | null
  tenant_id: string | null
}

function formatDuration(sec: number | null) {
  if (!sec) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m} min` : `${s}s`
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffH = diffMs / 1000 / 3600
  if (diffH < 24 && d.getDate() === now.getDate()) {
    return `Heute um ${d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`
  }
  if (diffH < 48) return `Gestern um ${d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) + ` um ${d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`
}

function getCategoryTag(summary: string | null): { label: string; bg: string; text: string } {
  if (!summary) return { label: 'Kein Anliegen', bg: 'bg-slate-100', text: 'text-slate-500' }
  const s = summary.toLowerCase()
  if (s.includes('notfall') || s.includes('rohrbruch') || s.includes('dringend'))
    return { label: 'Notfall', bg: 'bg-red-100', text: 'text-red-700' }
  if (s.includes('heizung') || s.includes('störung') || s.includes('wartung') || s.includes('reparatur'))
    return { label: 'Heizungsproblem', bg: 'bg-orange-100', text: 'text-orange-700' }
  if (s.includes('angebot') || s.includes('preis') || s.includes('kosten') || s.includes('verkauf'))
    return { label: 'Angebotsanfrage', bg: 'bg-yellow-100', text: 'text-yellow-700' }
  if (s.includes('mitarbeiter') || s.includes('personal') || s.includes('kollege'))
    return { label: 'Mitarbeiteranfrage', bg: 'bg-purple-100', text: 'text-purple-700' }
  if (s.includes('neukunde') || s.includes('interessent') || s.includes('neukundenanfrage'))
    return { label: 'Neukundenanfrage', bg: 'bg-green-100', text: 'text-green-700' }
  if (s.includes('miete') || s.includes('mieter') || s.includes('wohnung') || s.includes('kündigung'))
    return { label: 'Mietangelegenheit', bg: 'bg-blue-100', text: 'text-blue-700' }
  return { label: 'Allgemeine Anfrage', bg: 'bg-slate-100', text: 'text-slate-600' }
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; dot: string; text: string }> = {
    completed: { label: 'Abgeschlossen', dot: 'bg-green-500', text: 'text-green-700' },
    in_progress: { label: 'Laufend', dot: 'bg-blue-500', text: 'text-blue-700' },
    missed: { label: 'Verpasst', dot: 'bg-red-500', text: 'text-red-600' },
  }
  const s = map[status] ?? { label: status, dot: 'bg-slate-400', text: 'text-slate-600' }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

const tabs = [
  { key: 'all', label: 'Alle' },
  { key: 'completed', label: 'Abgeschlossen' },
  { key: 'in_progress', label: 'Laufend' },
  { key: 'missed', label: 'Verpasst' },
]

export default function AnrufePage() {
  const [calls, setCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('calls')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(100)
      setCalls((data ?? []) as Call[])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = calls.filter(c => {
    const matchTab = activeTab === 'all' || c.status === activeTab
    const matchSearch = !search ||
      (c.caller_number ?? '').includes(search) ||
      (c.summary ?? '').toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Anrufe</h1>
        <p className="text-slate-400 text-sm mt-0.5">Verwalten Sie die Anrufe, die Lisa für Sie getätigt hat.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-slate-100">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === t.key
                ? 'border-slate-800 text-slate-800'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Suche..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          />
        </div>
        <span className="text-sm text-slate-400">{filtered.length} Anrufe</span>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_3fr_2fr_1fr_1fr] px-5 py-3 border-b border-slate-100 bg-slate-50">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Kontakt</span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Anliegen</span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Datum</span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Dauer</span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-300 text-sm">Lädt...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <PhoneMissed className="w-8 h-8 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Keine Anrufe gefunden</p>
            <p className="text-slate-300 text-xs mt-1">Ruf +1 (662) 439-4944 an um den Test zu starten</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(call => {
              const tag = getCategoryTag(call.summary)
              const isOpen = expanded === call.id
              return (
                <div key={call.id}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : call.id)}
                    className="w-full grid grid-cols-[2fr_3fr_2fr_1fr_1fr] items-center px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    {/* Kontakt */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        call.status === 'missed' ? 'bg-red-50' :
                        call.status === 'in_progress' ? 'bg-blue-50' : 'bg-slate-100'
                      }`}>
                        {call.status === 'missed' ? (
                          <PhoneMissed className="w-3.5 h-3.5 text-red-400" />
                        ) : call.status === 'in_progress' ? (
                          <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
                        ) : (
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-slate-700 truncate">
                        {call.caller_number || 'Unbekannte Nummer'}
                      </span>
                    </div>

                    {/* Anliegen */}
                    <div>
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${tag.bg} ${tag.text}`}>
                        {tag.label}
                      </span>
                      {call.summary && (
                        <p className="text-xs text-slate-400 mt-1 truncate max-w-xs">{call.summary}</p>
                      )}
                    </div>

                    {/* Datum */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-300" />
                      {formatDate(call.started_at)}
                    </div>

                    {/* Dauer */}
                    <span className="text-xs text-slate-500">{formatDuration(call.duration_sec)}</span>

                    {/* Status + expand */}
                    <div className="flex items-center justify-between">
                      <StatusBadge status={call.status} />
                      {isOpen
                        ? <ChevronUp className="w-3.5 h-3.5 text-slate-300" />
                        : <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                      }
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 bg-slate-50 border-t border-slate-100">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Zusammenfassung</p>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {call.summary || <span className="italic text-slate-300">Keine Zusammenfassung verfügbar</span>}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Transkript</p>
                          {call.transcript ? (
                            <div className="bg-white rounded-lg p-3 border border-slate-100 max-h-36 overflow-y-auto">
                              <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{call.transcript}</p>
                            </div>
                          ) : (
                            <p className="text-sm italic text-slate-300">Kein Transkript verfügbar</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
