'use client'

import { CalendarDays, Phone } from 'lucide-react'

const upcomingCallbacks = [
  {
    id: '1',
    name: 'Klaus Müller',
    time: 'Heute, 15:30',
  },
  {
    id: '2',
    name: 'Petra Wagner',
    time: 'Morgen, 10:00',
  },
  {
    id: '3',
    name: 'Robert Schneider',
    time: 'Mittwoch, 14:15',
  },
]

export default function KalenderPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-slate-800">Kalender</h1>
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Neu</span>
        </div>
        <p className="text-slate-600 text-sm mt-2">Verwalten Sie Termine und Rückrufe</p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 mb-6">
        <div className="text-center">
          <CalendarDays className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-700 mb-1">Kalender kommt bald</h2>
          <p className="text-slate-500 text-sm">
            Termine und Rückrufe werden hier verwaltet. Diese Funktion ist in Kürze verfügbar.
          </p>
        </div>
      </div>

      {/* Upcoming Callbacks */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Anstehende Rückrufe</h2>
        <div className="space-y-2">
          {upcomingCallbacks.map((callback) => (
            <div key={callback.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{callback.name}</p>
                  <p className="text-xs text-slate-500">{callback.time}</p>
                </div>
              </div>
              <button className="px-3 py-2 text-blue-600 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                Anrufen
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
