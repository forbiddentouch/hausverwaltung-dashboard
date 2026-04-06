'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Phone,
  Search,
  ChevronDown,
  X,
  Filter,
  Calendar,
  Star,
  Mail,
  Check,
  Users,
  FileText,
  ChevronUp,
  Copy,
} from 'lucide-react'

type Call = {
  id: string
  caller_number: string | null
  caller_name: string | null
  status: 'new' | 'in_progress' | 'done'
  started_at: string
  duration: number
  task: string
  task_icon: string
  task_color: string
  summary: string | null
  mood: string
  transcript: string | null
}

// Demo data
const demoCalls: Call[] = [
  {
    id: '1',
    caller_number: '+49 170 1234567',
    caller_name: 'Klaus Brenner',
    duration: 180,
    started_at: new Date().toISOString(),
    status: 'new',
    task: 'Heizungsprobleme aufnehmen',
    task_icon: '🔥',
    task_color: 'orange',
    summary: 'Kunde klagt über Heizungsausfall seit 2 Tagen. Termin für Techniker gewünscht.',
    mood: 'Ruhig',
    transcript: null,
  },
  {
    id: '2',
    caller_number: '+49 163 9876543',
    caller_name: 'Tanja Feldmann',
    duration: 145,
    started_at: new Date(Date.now() - 86400000).toISOString(),
    status: 'new',
    task: 'Mitarbeiteranfragen',
    task_icon: '👤',
    task_color: 'blue',
    summary: 'Allgemeine Auskunft zur Wärmepumpe gewünscht.',
    mood: 'Freundlich',
    transcript: null,
  },
  {
    id: '3',
    caller_number: '+49 152 5555444',
    caller_name: 'Mehmet Yilmaz',
    duration: 90,
    started_at: new Date(Date.now() - 86400000).toISOString(),
    status: 'new',
    task: 'Neukundenanfragen aufnehmen',
    task_icon: '✨',
    task_color: 'green',
    summary: 'Neukunde interessiert an Angebot für Wärmepumpe.',
    mood: 'Interessiert',
    transcript: null,
  },
  {
    id: '4',
    caller_number: '+49 177 3214321',
    caller_name: 'Anna-Maria Krüger',
    duration: 210,
    started_at: new Date(Date.now() - 86400000).toISOString(),
    status: 'in_progress',
    task: 'Verkaufs- und Akquiseanrufe',
    task_icon: '💰',
    task_color: 'green',
    summary: 'Angebotsanfrage für Preisnachfrage. Angebotsdokument soll zugesendet werden.',
    mood: 'Geschäftlich',
    transcript: null,
  },
  {
    id: '5',
    caller_number: '+49 151 7778889',
    caller_name: 'Holger Steinmetz',
    duration: 167,
    started_at: new Date(Date.now() - 86400000).toISOString(),
    status: 'new',
    task: 'Heizungsprobleme aufnehmen',
    task_icon: '🔥',
    task_color: 'orange',
    summary: 'Störungsmeldung Heizung. Keine Warmwasserversorgung.',
    mood: 'Besorgt',
    transcript: null,
  },
  {
    id: '6',
    caller_number: '+49 160 1112223',
    caller_name: 'Nadine Hofstetter',
    duration: 245,
    started_at: new Date(Date.now() - 86400000).toISOString(),
    status: 'done',
    task: 'Notfall',
    task_icon: '🚨',
    task_color: 'red',
    summary: 'Notfall: Heizungsrohrbruch. Sofortiger Techniker angefordert. Reklamation eingereicht.',
    mood: 'Aufgeregt',
    transcript: null,
  },
]

function formatDuration(sec: number | null) {
  if (!sec) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
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

function getTaskColor(color: string) {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  }
  return colors[color] || colors.blue
}

function TranscriptSection({
  transcript,
}: {
  transcript: string | null
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

      <div className="bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
        {!open ? (
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
    </div>
  )
}

const tabs = [
  { key: 'all', label: 'Alle' },
  { key: 'new', label: 'Neu' },
  { key: 'in_progress', label: 'In Bearbeitung' },
  { key: 'done', label: 'Erledigt' },
  { key: 'archived', label: 'Archiviert' },
]

export default function AnrufePage() {
  const [calls, setCalls] = useState<Call[]>(demoCalls)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [showShortCalls, setShowShortCalls] = useState(false)
  const [selectedCall, setSelectedCall] = useState<Call | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data } = await supabase
          .from('calls')
          .select('*')
          .order('started_at', { ascending: false })
          .limit(100)

        if (data && data.length > 0) {
          setCalls(data as any[])
        }
      } catch (error) {
        console.error('Error loading calls:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = calls.filter(c => {
    let matchTab = true
    if (activeTab !== 'all') {
      if (activeTab === 'new') matchTab = c.status === 'new'
      else if (activeTab === 'in_progress') matchTab = c.status === 'in_progress'
      else if (activeTab === 'done') matchTab = c.status === 'done'
      else if (activeTab === 'archived') matchTab = false
    }

    const matchSearch =
      !search ||
      (c.caller_number ?? '').includes(search) ||
      (c.caller_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (c.summary ?? '').toLowerCase().includes(search.toLowerCase())

    const matchDuration = !showShortCalls || (c.duration ?? 0) >= 30

    return matchTab && matchSearch && matchDuration
  })

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
            placeholder="Suche nach Name, Nummer..."
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
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            {/* Table header - desktop only */}
            <div className="hidden lg:grid grid-cols-[2fr_2.5fr_1.5fr_1.5fr_1fr] px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <div>Kontakt</div>
              <div>Aufgabe</div>
              <div>Dauer</div>
              <div>Datum</div>
              <div>Status</div>
            </div>

            {/* Table rows */}
            <div className="divide-y divide-slate-100">
              {filtered.map(call => {
                const colors = getTaskColor(call.task_color)
                return (
                  <button
                    key={call.id}
                    onClick={() => setSelectedCall(call)}
                    className="w-full flex flex-col gap-2 px-4 py-3 lg:grid lg:grid-cols-[2fr_2.5fr_1.5fr_1.5fr_1fr] lg:items-center lg:px-5 lg:py-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    {/* Top row mobile: Kontakt + Status */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-slate-600">
                        {call.caller_name?.[0] || call.caller_number?.[0] || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {call.caller_name || call.caller_number || 'Unbekannt'}
                        </p>
                        <p className="text-xs text-slate-400 truncate lg:block hidden">
                          {call.caller_number}
                        </p>
                        <p className="text-xs text-slate-400 lg:hidden">
                          {formatDuration(call.duration)} · {formatDate(call.started_at)}
                        </p>
                      </div>
                      <div className={`px-2.5 py-1 rounded-full text-xs font-medium lg:hidden ${
                        call.status === 'new'
                          ? 'bg-blue-100 text-blue-700'
                          : call.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {call.status === 'new' ? 'Neu' : call.status === 'in_progress' ? 'In Bearb.' : 'Erledigt'}
                      </div>
                    </div>

                    {/* Aufgabe */}
                    <div className="flex items-start lg:justify-start">
                      <div
                        className={`px-3 py-1.5 rounded-lg border ${colors.bg} ${colors.text} ${colors.border} text-xs lg:text-sm font-medium flex items-center gap-1.5`}
                      >
                        <span>{call.task_icon}</span>
                        <span className="truncate">{call.task}</span>
                      </div>
                    </div>

                    {/* Dauer - desktop only */}
                    <div className="hidden lg:block text-sm text-slate-600 font-medium">
                      {formatDuration(call.duration)}
                    </div>

                    {/* Datum - desktop only */}
                    <div className="hidden lg:block text-sm text-slate-600">
                      <div className="font-medium">{formatDate(call.started_at)}</div>
                    </div>

                    {/* Status - desktop only */}
                    <div className="hidden lg:flex items-center gap-2">
                      <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        call.status === 'new'
                          ? 'bg-blue-100 text-blue-700'
                          : call.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {call.status === 'new' ? 'Neu' : call.status === 'in_progress' ? 'In Bearbeitung' : 'Erledigt'}
                      </div>
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
        <div className="fixed right-0 top-0 h-screen w-full sm:w-96 bg-white border-l border-slate-200 shadow-xl z-50 overflow-y-auto">
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
            {/* Title and date */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                {formatDate(selectedCall.started_at)}
              </p>
              <h3 className="text-xl font-semibold text-slate-900">
                {selectedCall.task}
              </h3>
            </div>

            {/* Duration and mood pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="px-3 py-1.5 bg-slate-100 rounded-full text-sm font-medium text-slate-700">
                {formatDuration(selectedCall.duration)}
              </div>
              <div className="px-3 py-1.5 bg-slate-100 rounded-full text-sm font-medium text-slate-700">
                {selectedCall.mood}
              </div>
            </div>

            {/* Summary */}
            {selectedCall.summary && (
              <div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedCall.summary}
                </p>
              </div>
            )}

            {/* Contact card */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-sm font-semibold text-slate-600">
                  {(selectedCall.caller_name || selectedCall.caller_number || 'U')[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedCall.caller_name || 'Anrufer'}
                  </p>
                  <p className="text-xs text-slate-500">{selectedCall.caller_number}</p>
                </div>
              </div>
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
                      getTaskColor(selectedCall.task_color).bg
                    } ${getTaskColor(selectedCall.task_color).text} ${
                      getTaskColor(selectedCall.task_color).border
                    }`}
                  >
                    <span>{selectedCall.task_icon}</span>
                    <span>{selectedCall.task}</span>
                  </div>
                </div>
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
                  <span>Benachrichtigung versendet</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-slate-400" />
                  <span>Erfolgreich bearbeitet</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Weitergeleitet an Mitarbeiter</span>
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
            <TranscriptSection transcript={selectedCall.transcript} />
          </div>
        </div>
      )}
    </div>
  )
}
