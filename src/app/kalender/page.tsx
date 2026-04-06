'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Phone, Plus, Pencil, Trash2, Check, Calendar, Download, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase, getOrganizationId } from '@/lib/supabase'

interface Appointment {
  id: string
  name: string
  telefon: string
  datum: string
  uhrzeit: string
  typ: 'Rückruf' | 'Termin' | 'Besichtigung' | 'Notfall'
  notizen: string
  erledigt: boolean
  createdAt: string
}

const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    name: 'Klaus Müller',
    telefon: '+49 30 123456',
    datum: new Date().toISOString().split('T')[0],
    uhrzeit: '15:30',
    typ: 'Rückruf',
    notizen: 'Frage wegen Nebenkostenabrechnung',
    erledigt: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Petra Wagner',
    telefon: '+49 40 654321',
    datum: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    uhrzeit: '10:00',
    typ: 'Termin',
    notizen: 'Mietvertrag besprechen',
    erledigt: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Robert Schneider',
    telefon: '+49 69 789012',
    datum: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    uhrzeit: '14:15',
    typ: 'Besichtigung',
    notizen: 'Wohnung 3. OG, Interessent aus München',
    erledigt: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Maria Hofmann',
    telefon: '+49 89 321654',
    datum: new Date(Date.now() + 432000000).toISOString().split('T')[0],
    uhrzeit: '09:00',
    typ: 'Termin',
    notizen: 'Übergabe der neuen Wohnung',
    erledigt: false,
    createdAt: new Date().toISOString(),
  },
]

const TYP_CONFIG: Record<string, { color: string; bg: string; border: string; emoji: string }> = {
  'Rückruf':      { color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200',   emoji: '📞' },
  'Termin':       { color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200', emoji: '📅' },
  'Besichtigung': { color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200',  emoji: '🏠' },
  'Notfall':      { color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',    emoji: '🚨' },
}

function dbRowToAppointment(row: Record<string, unknown>): Appointment {
  return {
    id: row.id as string,
    name: row.name as string,
    telefon: (row.telefon as string) || '',
    datum: row.datum as string,
    uhrzeit: (row.uhrzeit as string)?.slice(0, 5) || '',
    typ: (row.typ as Appointment['typ']) || 'Termin',
    notizen: (row.notizen as string) || '',
    erledigt: row.erledigt as boolean,
    createdAt: (row.created_at as string) || new Date().toISOString(),
  }
}

function buildGoogleCalendarUrl(appointment: Appointment): string {
  const startDate = new Date(`${appointment.datum}T${appointment.uhrzeit}:00`)
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${appointment.typ}: ${appointment.name}`,
    dates: `${fmt(startDate)}/${fmt(endDate)}`,
    details: appointment.notizen
      ? `${appointment.notizen}\nTelefon: ${appointment.telefon}`
      : `Telefon: ${appointment.telefon}`,
    location: '',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function buildOutlookUrl(appointment: Appointment): string {
  const startDate = new Date(`${appointment.datum}T${appointment.uhrzeit}:00`)
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: `${appointment.typ}: ${appointment.name}`,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    body: appointment.notizen
      ? `${appointment.notizen}\nTelefon: ${appointment.telefon}`
      : `Telefon: ${appointment.telefon}`,
  })
  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`
}

function generateICS(appointments: Appointment[]): string {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const events = appointments.map(a => {
    const start = new Date(`${a.datum}T${a.uhrzeit}:00`)
    const end = new Date(start.getTime() + 60 * 60 * 1000)
    const now = new Date()
    const desc = a.notizen ? `${a.notizen}\\nTelefon: ${a.telefon}` : `Telefon: ${a.telefon}`
    return [
      'BEGIN:VEVENT',
      `UID:immogreta-${a.id}@hausverwaltung`,
      `DTSTAMP:${fmt(now)}`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${a.typ}: ${a.name}`,
      `DESCRIPTION:${desc}`,
      `STATUS:${a.erledigt ? 'COMPLETED' : 'CONFIRMED'}`,
      'END:VEVENT',
    ].join('\r\n')
  })
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//ImmoGreta//Hausverwaltung//DE','CALSCALE:GREGORIAN','METHOD:PUBLISH',...events,'END:VCALENDAR'].join('\r\n')
}

function downloadICS(appointments: Appointment[], filename = 'termine.ics') {
  const blob = new Blob([generateICS(appointments)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

const WEEKDAYS = ['Mo','Di','Mi','Do','Fr','Sa','So']
const MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate() }
function getFirstDayOfWeek(year: number, month: number) { const d = new Date(year, month, 1).getDay(); return d === 0 ? 6 : d - 1 }

export default function KalenderPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const hasLoaded = useRef(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [view, setView] = useState<'list' | 'month'>('list')
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [formData, setFormData] = useState<Partial<Appointment>>({ name:'', telefon:'', datum:'', uhrzeit:'', typ:'Termin', notizen:'' })
  const [useDB, setUseDB] = useState(false)
  const [orgId, setOrgId] = useState<string | null>(null)

  const loadFromSupabase = useCallback(async () => {
    try {
      const oid = await getOrganizationId()
      if (!oid) {
        const stored = localStorage.getItem('immogreta_kalender')
        if (stored) { try { setAppointments(JSON.parse(stored)) } catch { setAppointments(SEED_APPOINTMENTS) } }
        else setAppointments(SEED_APPOINTMENTS)
        hasLoaded.current = true
        return
      }
      setOrgId(oid)
      setUseDB(true)
      const { data, error } = await supabase
        .from('kalender')
        .select('*')
        .eq('organization_id', oid)
        .order('datum')
      if (error) throw error
      setAppointments((data || []).map(dbRowToAppointment))
    } catch {
      const stored = localStorage.getItem('immogreta_kalender')
      if (stored) { try { setAppointments(JSON.parse(stored)) } catch { setAppointments(SEED_APPOINTMENTS) } }
      else setAppointments(SEED_APPOINTMENTS)
    }
    hasLoaded.current = true
  }, [])

  useEffect(() => { loadFromSupabase() }, [loadFromSupabase])

  useEffect(() => {
    if (!hasLoaded.current || useDB) return
    localStorage.setItem('immogreta_kalender', JSON.stringify(appointments))
  }, [appointments, useDB])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500) }
  const handleOpenModal = (a?: Appointment) => {
    setEditingId(a?.id ?? null)
    setFormData(a ? { ...a } : { name:'', telefon:'', datum:'', uhrzeit:'', typ:'Termin', notizen:'' })
    setIsModalOpen(true)
  }
  const handleCloseModal = () => { setIsModalOpen(false); setEditingId(null) }

  const handleSave = async () => {
    if (!formData.name || !formData.datum || !formData.uhrzeit) { showToast('Bitte alle Pflichtfelder ausfüllen'); return }
    if (editingId) {
      if (useDB && orgId) {
        await supabase.from('kalender').update({
          name: formData.name,
          telefon: formData.telefon || null,
          datum: formData.datum,
          uhrzeit: formData.uhrzeit,
          typ: formData.typ || 'Termin',
          notizen: formData.notizen || null,
        }).eq('id', editingId)
      }
      setAppointments(prev => prev.map(a => a.id === editingId ? { ...a, ...formData } : a))
      showToast('Termin aktualisiert')
    } else {
      if (useDB && orgId) {
        const { data: inserted, error } = await supabase.from('kalender').insert({
          organization_id: orgId,
          name: formData.name,
          telefon: formData.telefon || null,
          datum: formData.datum,
          uhrzeit: formData.uhrzeit,
          typ: formData.typ || 'Termin',
          notizen: formData.notizen || null,
        }).select().single()
        if (!error && inserted) {
          setAppointments(prev => [...prev, dbRowToAppointment(inserted)])
        }
      } else {
        setAppointments(prev => [...prev, { ...(formData as Appointment), id: Date.now().toString(), erledigt: false, createdAt: new Date().toISOString() }])
      }
      showToast('Termin hinzugefügt')
    }
    handleCloseModal()
  }

  const handleDelete = async (id: string) => {
    if (useDB && orgId) {
      await supabase.from('kalender').delete().eq('id', id)
    }
    setAppointments(prev => prev.filter(a => a.id !== id))
    setDeleteConfirm(null)
    showToast('Termin gelöscht')
  }

  const handleToggle = async (id: string) => {
    const appt = appointments.find(a => a.id === id)
    if (!appt) return
    if (useDB && orgId) {
      await supabase.from('kalender').update({ erledigt: !appt.erledigt }).eq('id', id)
    }
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, erledigt: !a.erledigt } : a))
  }

  const formatDate = (ds: string) => new Date(ds + 'T00:00:00').toLocaleDateString('de-DE', { weekday:'short', day:'2-digit', month:'2-digit' })
  const isToday = (ds: string) => ds === new Date().toISOString().split('T')[0]

  const sorted = [...appointments].sort((a,b) => new Date(`${a.datum}T${a.uhrzeit}`).getTime() - new Date(`${b.datum}T${b.uhrzeit}`).getTime())
  const upcoming = sorted.filter(a => !a.erledigt)
  const completed = sorted.filter(a => a.erledigt)

  // Month view
  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay = getFirstDayOfWeek(calYear, calMonth)
  const calDays: (number|null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) calDays.push(d)
  const apptsByDate: Record<string,Appointment[]> = {}
  appointments.forEach(a => { if (!apptsByDate[a.datum]) apptsByDate[a.datum] = []; apptsByDate[a.datum].push(a) })
  const prevMonth = () => { if (calMonth===0){setCalMonth(11);setCalYear(y=>y-1)} else setCalMonth(m=>m-1) }
  const nextMonth = () => { if (calMonth===11){setCalMonth(0);setCalYear(y=>y+1)} else setCalMonth(m=>m+1) }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Kalender</h1>
            <p className="text-sm text-slate-500 mt-1">{upcoming.length} anstehende Termine</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-white">
              <button onClick={() => setView('list')} className={`px-3 py-2 text-sm font-medium transition-colors ${view==='list'?'bg-blue-600 text-white':'text-slate-600 hover:bg-slate-50'}`}>Liste</button>
              <button onClick={() => setView('month')} className={`px-3 py-2 text-sm font-medium transition-colors ${view==='month'?'bg-blue-600 text-white':'text-slate-600 hover:bg-slate-50'}`}>Monat</button>
            </div>
            <button
              onClick={() => { downloadICS(upcoming, `termine_${new Date().toISOString().split('T')[0]}.ics`); showToast('ICS heruntergeladen – öffne die Datei mit Apple/Google/Outlook Kalender') }}
              className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
            >
              <Download className="w-4 h-4" /> Als .ics exportieren
            </button>
            <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
              <Plus className="w-4 h-4" /> Neuer Termin
            </button>
          </div>
        </div>

        {/* MONTH VIEW */}
        {view === 'month' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition"><ChevronLeft className="w-4 h-4 text-slate-500" /></button>
              <h2 className="font-semibold text-slate-800">{MONTHS[calMonth]} {calYear}</h2>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition"><ChevronRight className="w-4 h-4 text-slate-500" /></button>
            </div>
            <div className="grid grid-cols-7 border-b border-slate-100">
              {WEEKDAYS.map(d => <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">{d}</div>)}
            </div>
            <div className="grid grid-cols-7">
              {calDays.map((day, i) => {
                if (!day) return <div key={`e-${i}`} className="min-h-[80px] border-b border-r border-slate-50" />
                const ds = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
                const dayAppts = apptsByDate[ds] || []
                const today = ds === new Date().toISOString().split('T')[0]
                return (
                  <div key={day} className={`min-h-[80px] border-b border-r border-slate-50 p-1.5 ${today?'bg-blue-50':''}`}>
                    <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${today?'bg-blue-600 text-white':'text-slate-600'}`}>{day}</div>
                    {dayAppts.slice(0,2).map(a => (
                      <div key={a.id} onClick={() => handleOpenModal(a)} className={`text-xs px-1 py-0.5 rounded mb-0.5 cursor-pointer truncate ${TYP_CONFIG[a.typ]?.bg} ${TYP_CONFIG[a.typ]?.color}`}>
                        {a.uhrzeit} {a.name}
                      </div>
                    ))}
                    {dayAppts.length > 2 && <div className="text-xs text-slate-400 px-1">+{dayAppts.length-2} mehr</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* LIST VIEW */}
        {view === 'list' && (
          <>
            <div className="mb-10">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Anstehende Termine</h2>
              {upcoming.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Keine anstehenden Termine</p>
                  <button onClick={() => handleOpenModal()} className="mt-3 text-blue-600 text-sm font-medium hover:underline">Ersten Termin anlegen →</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map(a => {
                    const cfg = TYP_CONFIG[a.typ] || TYP_CONFIG['Termin']
                    return (
                      <div key={a.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
                        <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl ${cfg.bg} border ${cfg.border}`}>
                          {cfg.emoji}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>{a.typ}</span>
                              {isToday(a.datum) && <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">Heute</span>}
                            </div>
                            <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">{formatDate(a.datum)} · {a.uhrzeit}</span>
                          </div>
                          <h3 className="text-base font-semibold text-slate-900 mb-0.5">{a.name}</h3>
                          {a.telefon && <p className="text-xs text-slate-400 mb-1">{a.telefon}</p>}
                          {a.notizen && <p className="text-sm text-slate-500 line-clamp-2">{a.notizen}</p>}
                          <div className="flex items-center gap-3 mt-3 flex-wrap">
                            {a.telefon && (
                              <a href={`tel:${a.telefon.replace(/\s/g,'')}`} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
                                <Phone className="w-3 h-3" /> Anrufen
                              </a>
                            )}
                            <a href={buildGoogleCalendarUrl(a)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600">
                              <ExternalLink className="w-3 h-3" /> Google Kalender
                            </a>
                            <a href={buildOutlookUrl(a)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600">
                              <ExternalLink className="w-3 h-3" /> Outlook
                            </a>
                            <button onClick={() => downloadICS([a], `termin_${a.datum}.ics`)} className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600">
                              <Download className="w-3 h-3" /> .ics
                            </button>
                            <div className="flex-1" />
                            <button onClick={() => handleOpenModal(a)} className="text-slate-400 hover:text-slate-600"><Pencil className="w-4 h-4" /></button>
                            {deleteConfirm === a.id ? (
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleDelete(a.id)} className="text-red-600 text-xs font-semibold">Löschen</button>
                                <button onClick={() => setDeleteConfirm(null)} className="text-slate-400 text-xs">Abbrechen</button>
                              </div>
                            ) : (
                              <button onClick={() => setDeleteConfirm(a.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            )}
                            <button onClick={() => handleToggle(a.id)} className="text-slate-400 hover:text-green-600" title="Erledigt"><Check className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {completed.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Erledigt ({completed.length})</h2>
                <div className="space-y-2">
                  {completed.map(a => (
                    <div key={a.id} className="bg-slate-100 rounded-xl p-3 flex items-center justify-between opacity-60">
                      <div>
                        <p className="text-sm font-medium text-slate-500 line-through">{a.name}</p>
                        <p className="text-xs text-slate-400">{formatDate(a.datum)} · {a.uhrzeit} · {a.typ}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggle(a.id)} className="text-green-600 hover:text-green-700"><Check className="w-4 h-4" /></button>
                        {deleteConfirm === a.id ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleDelete(a.id)} className="text-red-600 text-xs font-semibold">Löschen</button>
                            <button onClick={() => setDeleteConfirm(null)} className="text-slate-400 text-xs">Abbrechen</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(a.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-5">{editingId ? 'Termin bearbeiten' : 'Neuen Termin anlegen'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input type="text" value={formData.name||''} onChange={e=>setFormData({...formData,name:e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="z.B. Klaus Müller" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                <input type="tel" value={formData.telefon||''} onChange={e=>setFormData({...formData,telefon:e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+49 30 123456" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Datum *</label>
                  <input type="date" value={formData.datum||''} onChange={e=>setFormData({...formData,datum:e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Uhrzeit *</label>
                  <input type="time" value={formData.uhrzeit||''} onChange={e=>setFormData({...formData,uhrzeit:e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Typ</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(TYP_CONFIG) as Array<keyof typeof TYP_CONFIG>).map(typ => {
                    const cfg = TYP_CONFIG[typ]; const sel = formData.typ === typ
                    return (
                      <button key={typ} type="button" onClick={() => setFormData({...formData,typ:typ as Appointment['typ']})}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${sel?`${cfg.bg} ${cfg.color} ${cfg.border} ring-2 ring-offset-1`:'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        <span>{cfg.emoji}</span> {typ}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notizen</label>
                <textarea value={formData.notizen||''} onChange={e=>setFormData({...formData,notizen:e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Zusätzliche Informationen..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleCloseModal} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition">Abbrechen</button>
              <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">Speichern</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm px-5 py-3 rounded-xl shadow-lg z-50 text-center">
          {toast}
        </div>
      )}
    </div>
  )
}
