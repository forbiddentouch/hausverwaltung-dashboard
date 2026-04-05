import { supabase } from '@/lib/supabase'
import { Building2, Phone, User, Ticket } from 'lucide-react'

async function getMandanten() {
  const { data: tenants, error } = await supabase
    .from('tenants')
    .select('*')
    .order('name', { ascending: true })

  if (error) console.error(error)
  return (tenants ?? []) as Record<string, unknown>[]
}

async function getTicketCountPerTenant(): Promise<Record<string, number>> {
  const { data } = await supabase
    .from('tickets')
    .select('mieter_id')
    .not('mieter_id', 'is', null)

  if (!data) return {}
  const counts: Record<string, number> = {}
  for (const row of data) {
    const id = row.mieter_id as string
    counts[id] = (counts[id] ?? 0) + 1
  }
  return counts
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const AVATAR_COLORS = [
  'from-blue-400 to-blue-600',
  'from-violet-400 to-violet-600',
  'from-emerald-400 to-emerald-600',
  'from-amber-400 to-amber-600',
  'from-pink-400 to-pink-600',
  'from-cyan-400 to-cyan-600',
]

export default async function MandantenPage() {
  const [mandanten, ticketCounts] = await Promise.all([getMandanten(), getTicketCountPerTenant()])

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Mandanten</h1>
        <p className="text-slate-500 text-sm mt-1">Mieter und Ansprechpartner</p>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-800">{mandanten.length}</p>
          <p className="text-sm text-slate-500">Registrierte Mandanten</p>
        </div>
      </div>

      {/* Grid */}
      {mandanten.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-16 text-center">
          <Building2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Noch keine Mandanten erfasst</p>
          <p className="text-slate-300 text-xs mt-1">Mandanten werden über die Supabase-Tabelle hinzugefügt</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mandanten.map((m, i) => {
            const name = m.name as string
            const initials = getInitials(name)
            const color = AVATAR_COLORS[i % AVATAR_COLORS.length]
            const ticketCount = ticketCounts[m.id as string] ?? 0

            return (
              <div
                key={m.id as string}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                {/* Avatar + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-11 h-11 rounded-full bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-white text-sm font-bold">{initials}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
                    <p className="text-xs text-slate-400">Mieter</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  {m.phone_number ? (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                      <span className="text-xs text-slate-500 font-mono">{m.phone_number as string}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-200 flex-shrink-0" />
                      <span className="text-xs text-slate-300 italic">Keine Nummer</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Ticket className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                    <span className="text-xs text-slate-500">
                      {ticketCount === 0
                        ? 'Keine Tickets'
                        : ticketCount === 1
                        ? '1 Ticket'
                        : `${ticketCount} Tickets`}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
