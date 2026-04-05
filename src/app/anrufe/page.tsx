import { supabase } from '@/lib/supabase'
import { Phone, PhoneMissed, PhoneCall, Clock, ChevronDown } from 'lucide-react'

async function getCalls() {
  const { data, error } = await supabase
    .from('calls')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(50)

  if (error) console.error(error)
  return (data ?? []) as Record<string, unknown>[]
}

function formatDuration(sec: number | null) {
  if (!sec) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; dot: string }> = {
    completed: { label: 'Abgeschlossen', cls: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
    in_progress: { label: 'Laufend', cls: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
    missed: { label: 'Verpasst', cls: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
  }
  const s = map[status] ?? { label: status, cls: 'bg-slate-50 text-slate-600', dot: 'bg-slate-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

function CallIcon({ status }: { status: string }) {
  if (status === 'missed') {
    return (
      <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
        <PhoneMissed className="w-4 h-4 text-red-400" />
      </div>
    )
  }
  if (status === 'in_progress') {
    return (
      <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
        <PhoneCall className="w-4 h-4 text-blue-400" />
      </div>
    )
  }
  return (
    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
      <Phone className="w-4 h-4 text-slate-400" />
    </div>
  )
}

export default async function AnrufePage() {
  const calls = await getCalls()

  const stats = {
    total: calls.length,
    completed: calls.filter(c => c.status === 'completed').length,
    missed: calls.filter(c => c.status === 'missed').length,
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Anrufe</h1>
        <p className="text-slate-500 text-sm mt-1">Alle eingehenden Anrufe bei Lisa</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-sm text-slate-500 mt-0.5">Anrufe gesamt</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-sm text-slate-500 mt-0.5">Abgeschlossen</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-2xl font-bold text-red-500">{stats.missed}</p>
          <p className="text-sm text-slate-500 mt-0.5">Verpasst</p>
        </div>
      </div>

      {/* Call list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {calls.length === 0 ? (
          <div className="py-16 text-center">
            <PhoneMissed className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Noch keine Anrufe vorhanden</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {calls.map((call) => (
              <details key={call.id as string} className="group">
                <summary className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer list-none">
                  <CallIcon status={call.status as string} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700">
                      {(call.caller_number as string) || 'Unbekannte Nummer'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {formatDate(call.started_at as string)}
                      {call.duration_sec ? (
                        <span>· {formatDuration(call.duration_sec as number)}</span>
                      ) : null}
                    </p>
                  </div>
                  <StatusBadge status={call.status as string} />
                  <ChevronDown className="w-4 h-4 text-slate-300 group-open:rotate-180 transition-transform flex-shrink-0" />
                </summary>

                {/* Expanded content */}
                <div className="px-6 pb-5 bg-slate-50 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-6 pt-4">
                    {/* Summary */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Zusammenfassung</p>
                      {call.summary ? (
                        <p className="text-sm text-slate-600 leading-relaxed">{call.summary as string}</p>
                      ) : (
                        <p className="text-sm text-slate-400 italic">Keine Zusammenfassung verfügbar</p>
                      )}
                    </div>
                    {/* Transcript */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Transkript</p>
                      {call.transcript ? (
                        <div className="bg-white rounded-xl p-3 border border-slate-100 max-h-40 overflow-y-auto">
                          <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">
                            {call.transcript as string}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 italic">Kein Transkript verfügbar</p>
                      )}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-xs text-slate-400">Call-ID: </span>
                      <span className="text-xs font-mono text-slate-500">{call.id as string}</span>
                    </div>
                    {(call.tenant_id as string | null) && (
                      <div>
                        <span className="text-xs text-slate-400">Mandant-ID: </span>
                        <span className="text-xs font-mono text-slate-500">{call.tenant_id as string}</span>
                      </div>
                    )}
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
