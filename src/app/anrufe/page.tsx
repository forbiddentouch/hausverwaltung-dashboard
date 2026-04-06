'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Phone,
  PhoneMissed,
  PhoneCall,
  Clock,
  Search,
  ChevronDown,
  X,
  Filter,
  Calendar,
  Star,
  Mail,
  Check,
  Flame,
  AlertTriangle,
  UserCheck,
  Users,
  FileText,
  ChevronUp,
  Copy,
} from 'lucide-react'

type Call = {
  id: string
  caller_number: string | null
  status: 'completed' | 'in_progress' | 'missed'
  started_at: string
  ended_at: string | null
  duration_sec: number | null
  transcript: string | null
  summary: string | null
  tenant_id: string | null
  contact_name?: string
  contact_phone?: string
  contact_address?: string
}

function formatDuration(sec: number | null) {
  if (!sec) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m} min` : `${s}s`
}

function formatDurationLong(sec: number | null) {
  if (!sec) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m > 0) return `${m} min ${s}s`
  return `${s}s`
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffH = diffMs / 1000 / 3600
  if (diffH < 24 && d.getDate() === now.getDate()) {
    return `Heute um ${d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`
  }
  if (diffH < 48)
    return `Gestern um ${d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`
  return (
    d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) +
    ` um ${d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`
  )
}

function getCategory(summary: string | null): {
  label: string
  emoji: string
  bg: string
  text: string
  borderColor: string
} {
  if (!summary)
    return {
      label: 'Ohne Aufgabe',
      emoji: '📋',
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      borderColor: 'border-gray-200',
    }
  const s = summary.toLowerCase()

  if (
    s.includes('notfall') ||
    s.includes('rohrbruch') ||
    s.includes('dringend') ||
    s.includes('wasser') ||
    s.includes('gas')
  ) {
    return {
      label: 'Notfall',
      emoji: '🚨',
      bg: 'bg-red-50',
      text: 'text-red-700',
      borderColor: 'border-red-200',
    }
  }

  if (
    s.includes('heizung') ||
    s.includes('störung') ||
    s.includes('wartung') ||
    s.includes('reparatur') ||
    s.includes('thermostat') ||
    s.includes('temperatur')
  ) {
    return {
      label: 'Heizungsprobleme aufnehmen',
      emoji: '🔥',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      borderColor: 'border-orange-200',
    }
  }

  if (
    s.includes('neukunde') ||
    s.includes('interessent') ||
    s.includes('neukundenanfrage') ||
    s.includes('erstanfrage')
  ) {
    return {
      label: 'Neukunden',
      emoji: '🌱',
      bg: 'bg-green-50',
      text: 'text-green-700',
      borderColor: 'border-green-200',
    }
  }

  if (
    s.includes('mitarbeiter') ||
    s.includes('personal') ||
    s.includes('kollege') ||
    s.includes('team')
  ) {
    return {
      label: 'Mitarbeiter',
      emoji: '👥',
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      borderColor: 'border-yellow-200',
    }
  }

  return {
    label: 'Testanruf',
    emoji: '📞',
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    borderColor: 'border-gray-200',
  }
}

function mapStatus(dbStatus: string): 'Neu' | 'In Bearbeitung' | 'Erledigt' {
  switch (dbStatus) {
    case 'missed':
      return 'Neu'
    case 'in_progress':
      return 'In Bearbeitung'
    case 'completed':
      return 'Erledigt'
    default:
      return 'Neu'
  }
}

const tabs = [
  { key: 'all', label: 'Alle' },
  { key: 'missed', label: 'Neu' },
  { key: 'in_progress', label: 'In Bearbeitung' },
  { key: 'completed', label: 'Erledigt' },
  { key: 'archived', label: 'Archiviert' },
]

// ── Transcript component ────────────────────────────────────────────────────
function TranscriptSection({
  transcript,
  callId,
  callerNumber,
}: {
  transcript: string | null
  callId: string
  callerNumber: string | null
}) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!transcript) {
    return (
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Gesprächsprotokoll
        </p>
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 text-center">
          <FileText className="w-6 h-6 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Kein Transkript verfügbar</p>
        </div>
      </div>
    )
  }

  function copyTranscript() {
    navigator.clipboard.writeText(transcript!)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Parse transcript lines: "Agent: ..." / "Caller: ..."
  const lines = transcript.split('\n').filter(l => l.trim())

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Gesprächsprotokoll
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={copyTranscript}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Kopiert' : 'Kopieren'}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            {open ? (
              <><ChevronUp className="w-3.5 h-3.5" /> Einklappen</>
            ) : (
              <><ChevronDown className="w-3.5 h-3.5" /> Volltext anzeigen</>
            )}
          </button>
        </div>
      </div>

      {/* Preview or full transcript */}
      <div className="bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
        {!open ? (
          // Short preview: first 3 lines
          <div className="p-3 space-y-2">
            {lines.slice(0, 3).map((line, i) => {
              const isAgent = line.toLowerCase().startsWith('agent') || line.toLowerCase().startsWith('greta') || line.toLowerCase().startsWith('ki')
              return (
                <div key={i} className={`flex gap-2 ${isAgent ? '' : 'flex-row-reverse'}`}>
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${isAgent ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                    {isAgent ? 'G' : 'A'}
                  </div>
                  <div className={`text-xs rounded-lg px-3 py-2 max-w-[80%] ${isAgent ? 'bg-blue-50 text-blue-900' : 'bg-white text-slate-700 border border-slate-200'}`}>
                    {line.replace(/^(Agent|Greta|KI|Caller|Anrufer|Kunde):\s*/i, '')}
                  </div>
                </div>
              )
            })}
            {lines.length > 3 && (
              <p className="text-xs text-slate-400 text-center pt-1">+ {lines.length - 3} weitere Nachrichten</p>
            )}
          </div>
        ) : (
          // Full conversation
          <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
            {lines.map((line, i) => {
              const isAgent = line.toLowerCase().startsWith('agent') || line.toLowerCase().startsWith('greta') || line.toLowerCase().startsWith('ki')
              return (
                <div key={i} className={`flex gap-2 ${isAgent ? '' : 'flex-row-reverse'}`}>
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${isAgent ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                    {isAgent ? 'G' : 'A'}
                  </div>
                  <div className={`text-xs rounded-lg px-3 py-2 max-w-[80%] leading-relaxed ${isAgent ? 'bg-blue-50 text-blue-900' : 'bg-white text-slate-700 border border-slate-200'}`}>
                    {line.replace(/^(Agent|Greta|KI|Caller|Anrufer|Kunde):\s*/i, '')}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Raw text toggle (for unformatted transcripts) */}
      {lines.length <= 1 && transcript.length > 0 && (
        <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
          {transcript}
        </div>
      )}
    </div>
  )
}
// ────────────────────────────────────────────────────────────────────────────

export default function AnrufePage() {
  const [calls, setCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [showShortCalls, setShowShortCalls] = useState(false)
  const [selectedCall, setSelectedCall] = useState<Call | null>(null)
  const [statusMap, setStatusMap] = useState<Record<string, 'Neu' | 'In Bearbeitung' | 'Erledigt'>>({})

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('calls')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(100)
      const calls = (data ?? []) as Call[]
      setCalls(calls)

      const initialStatus: Record<string, 'Neu' | 'In Bearbeitung' | 'Erledigt'> = {}
      calls.forEach(c => {
        initialStatus[c.id] = mapStatus(c.status)
      })
      setStatusMap(initialStatus)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = calls.filter(c => {
    let matchTab = true
    if (activeTab !== 'all') {
      if (activeTab === 'missed') matchTab = c.status === 'missed'
      else if (activeTab === 'in_progress') matchTab = c.status === 'in_progress'
      else if (activeTab === 'completed') matchTab = c.status === 'completed'
      else if (activeTab === 'archived') matchTab = false
    }

    const matchSearch =
      !search ||
      (c.caller_number ?? '').includes(search) ||
      (c.summary ?? '').toLowerCase().includes(search.toLowerCase())

    const matchDuration = !showShortCalls || (c.duration_sec ?? 0) >= 30

    return matchTab && matchSearch && matchDuration
  })

  const handleStatusToggle = (callId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const current = statusMap[callId] || 'Neu'
    let next: 'Neu' | 'In Bearbeitung' | 'Erledigt'
    if (current === 'Neu') next = 'In Bearbeitung'
    else if (current === 'In Bearbeitung') next = 'Erledigt'
    else next = 'Neu'
    setStatusMap(prev => ({ ...prev, [callId]: next }))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900">Anrufe</h1>
        <p className="text-slate-500 text-sm mt-1">
          Verwalten Sie die Anrufe, die ImmoGreta für Sie getätigt hat.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="px-8 flex items-center gap-8 border-b border-slate-200">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.key
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter row */}
      <div className="px-8 py-4 border-b border-slate-200 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-64 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Suche..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-opacity-5 focus:border-slate-900"
          />
        </div>

        <button
          onClick={() => setShowShortCalls(!showShortCalls)}
          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
            showShortCalls
              ? 'bg-slate-100 border-slate-300 text-slate-900'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Kurze Anrufe anzeigen
        </button>

        <button className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center gap-2">
          Weitergeleitet an
          <ChevronDown className="w-4 h-4" />
        </button>

        <button className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Datum
        </button>

        <button className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center gap-2">
          <Filter className="w-4 h-4" />+ Filter hinzufügen
        </button>
      </div>

      {/* Table */}
      <div className="px-8 py-6">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Lädt...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Phone className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-600 text-sm">Keine Anrufe gefunden</p>
          </div>
        ) : (
          <div className="space-y-1 border border-slate-200 rounded-lg overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1.5fr_2fr_1.5fr_1fr] px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <div>Kontakt</div>
              <div>Aufgabe</div>
              <div>Datum</div>
              <div>Status</div>
            </div>

            {/* Table rows */}
            <div>
              {filtered.map(call => {
                const cat = getCategory(call.summary)
                const displayStatus = statusMap[call.id] || mapStatus(call.status)
                return (
                  <button
                    key={call.id}
                    onClick={() => setSelectedCall(call)}
                    className="w-full grid grid-cols-[1.5fr_2fr_1.5fr_1fr] items-center px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left"
                  >
                    {/* Kontakt */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-slate-600">
                        {call.caller_number?.[0] || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {call.contact_name || call.caller_number || 'Unbekannt'}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {call.caller_number}
                        </p>
                      </div>
                    </div>

                    {/* Aufgabe */}
                    <div className="flex items-start">
                      <div
                        className={`px-3 py-1.5 rounded-lg border ${cat.bg} ${cat.text} ${cat.borderColor} text-sm font-medium flex items-center gap-1.5`}
                      >
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </div>
                    </div>

                    {/* Datum */}
                    <div className="flex items-start">
                      <div className="text-sm text-slate-600">
                        <div className="font-medium">{formatDuration(call.duration_sec)}</div>
                        <div className="text-xs text-slate-400">
                          {formatDate(call.started_at)}
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={displayStatus !== 'Neu'}
                        onChange={e => handleStatusToggle(call.id, e as any)}
                        className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                      />
                      <span className="text-sm text-slate-600">{displayStatus}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right side detail panel */}
      {selectedCall && (
        <div className="fixed right-0 top-0 h-screen w-96 bg-white border-l border-slate-200 shadow-xl z-50 overflow-y-auto">
          {/* Header with close button */}
          <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
            <h2 className="text-lg font-semibold text-slate-900">Details</h2>
            <button
              onClick={() => setSelectedCall(null)}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Time and title */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                {formatDate(selectedCall.started_at)}
              </p>
              <h3 className="text-xl font-semibold text-slate-900">
                {getCategory(selectedCall.summary).label}
              </h3>
            </div>

            {/* Duration and mood pills */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-slate-100 rounded-full text-sm font-medium text-slate-700">
                {formatDurationLong(selectedCall.duration_sec)}
              </div>
              <div className="px-3 py-1.5 bg-green-100 rounded-full text-sm font-medium text-green-700">
                Ruhig
              </div>
            </div>

            {/* Summary */}
            {selectedCall.summary && (
              <div>
                <p className="text-sm text-slate-700 leading-relaxed mb-2">
                  {selectedCall.summary}
                </p>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Mehr anzeigen
                </button>
              </div>
            )}

            {/* Contact card */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-sm font-semibold text-slate-600">
                  {(selectedCall.contact_name || selectedCall.caller_number || 'U')[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedCall.contact_name || 'Kontakt'}
                  </p>
                  <p className="text-xs text-slate-500">{selectedCall.caller_number}</p>
                </div>
              </div>
              {selectedCall.contact_address && (
                <p className="text-xs text-slate-600">{selectedCall.contact_address}</p>
              )}
            </div>

            {/* Ausgeführte Aufgabe section */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Ausgeführte Aufgabe
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium flex items-center gap-1.5 ${
                      getCategory(selectedCall.summary).bg
                    } ${getCategory(selectedCall.summary).text} ${
                      getCategory(selectedCall.summary).borderColor
                    }`}
                  >
                    <span>{getCategory(selectedCall.summary).emoji}</span>
                    <span>{getCategory(selectedCall.summary).label}</span>
                  </div>
                </div>

                {/* Task details as tags */}
                {selectedCall.summary && (
                  <div className="flex flex-wrap gap-2">
                    {selectedCall.summary.split(',').map((tag, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1 text-xs bg-slate-100 text-slate-600 rounded-full"
                      >
                        {tag.trim()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Aktionen section */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Aktionen
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>E-Mail versendet</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-slate-400" />
                  <span>Vorlage angewendet</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Weitergeleitet</span>
                </div>
              </div>
            </div>

            {/* Feedback section */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Feedback
              </p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i}
                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        i < 3 ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Transcript section */}
            <TranscriptSection transcript={selectedCall.transcript} callId={selectedCall.id} callerNumber={selectedCall.caller_number} />
          </div>
        </div>
      )}
    </div>
  )
}
