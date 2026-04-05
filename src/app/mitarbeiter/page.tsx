'use client'

import { useState } from 'react'
import { Search, Plus, Mail, Phone, CheckCircle2, Circle, X } from 'lucide-react'

interface Staff {
  id: string
  vorname: string
  nachname: string
  email: string
  telefon: string
  themen: string[]
  erreichbar: boolean
}

const initialStaff: Staff[] = [
  {
    id: '1',
    vorname: 'Max',
    nachname: 'Mustermann',
    email: 'max@example.com',
    telefon: '0151 234567',
    themen: ['Heizung', 'Notfall'],
    erreichbar: true,
  },
  {
    id: '2',
    vorname: 'Anna',
    nachname: 'Schmidt',
    email: 'anna@example.com',
    telefon: '0172 345678',
    themen: ['Allgemein', 'Neukunden'],
    erreichbar: true,
  },
  {
    id: '3',
    vorname: 'Tom',
    nachname: 'Weber',
    email: 'tom@example.com',
    telefon: '0160 456789',
    themen: ['Wartung'],
    erreichbar: false,
  },
]

const allThemen = ['Heizung', 'Notfall', 'Allgemein', 'Neukunden', 'Wartung', 'Sonstiges']

const themaColors: Record<string, string> = {
  Heizung: 'bg-orange-50 text-orange-700',
  Notfall: 'bg-red-50 text-red-700',
  Allgemein: 'bg-blue-50 text-blue-700',
  Neukunden: 'bg-green-50 text-green-700',
  Wartung: 'bg-purple-50 text-purple-700',
  Sonstiges: 'bg-slate-50 text-slate-700',
}

export default function MitarbeiterPage() {
  const [staff, setStaff] = useState<Staff[]>(initialStaff)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    vorname: '',
    nachname: '',
    email: '',
    telefon: '',
    themen: [] as string[],
    erreichbar: true,
  })

  const filteredStaff = staff.filter(
    (s) =>
      `${s.vorname} ${s.nachname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddStaff = () => {
    if (formData.vorname && formData.nachname && formData.email && formData.telefon) {
      const newStaff: Staff = {
        id: Date.now().toString(),
        vorname: formData.vorname,
        nachname: formData.nachname,
        email: formData.email,
        telefon: formData.telefon,
        themen: formData.themen,
        erreichbar: formData.erreichbar,
      }
      setStaff([...staff, newStaff])
      setFormData({
        vorname: '',
        nachname: '',
        email: '',
        telefon: '',
        themen: [],
        erreichbar: true,
      })
      setIsModalOpen(false)
    }
  }

  const handleThemaToggle = (thema: string) => {
    setFormData((prev) => ({
      ...prev,
      themen: prev.themen.includes(thema)
        ? prev.themen.filter((t) => t !== thema)
        : [...prev.themen, thema],
    }))
  }

  const getInitials = (vorname: string, nachname: string) => {
    return `${vorname.charAt(0)}${nachname.charAt(0)}`.toUpperCase()
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Mitarbeiter</h1>
        <p className="text-slate-600 text-sm mt-1">
          Legen Sie Ihre Mitarbeiter an, damit ImmoGreta Ihre Anliegen kennt, Anrufe gezielt weiterleiten kann und
          Benachrichtigungen direkt an die richtige Person gehen.
        </p>
      </div>

      {/* Top Bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Nach Name oder E-Mail suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Mitarbeiter erstellen
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredStaff.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-slate-500">Keine Mitarbeiter gefunden</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredStaff.map((member) => (
              <div key={member.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                {/* Name Column */}
                <div className="flex-1 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-700">{getInitials(member.vorname, member.nachname)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{`${member.vorname} ${member.nachname}`}</p>
                    <p className="text-xs text-slate-500">{member.email}</p>
                  </div>
                </div>

                {/* Kontakt Column */}
                <div className="w-32 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <p className="text-sm text-slate-600">{member.telefon}</p>
                  </div>
                </div>

                {/* Themen Column */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1">
                    {member.themen.map((thema) => (
                      <span
                        key={thema}
                        className={`px-2 py-1 rounded text-xs font-medium ${themaColors[thema] || 'bg-slate-50 text-slate-600'}`}
                      >
                        {thema}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status Column */}
                <div className="w-24 flex items-center gap-2 flex-shrink-0">
                  {member.erreichbar ? (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm text-slate-600">erreichbar</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-300" />
                      <span className="text-sm text-slate-500">nicht erreichbar</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Mitarbeiter erstellen</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Vorname"
                  value={formData.vorname}
                  onChange={(e) => setFormData({ ...formData, vorname: e.target.value })}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                />
                <input
                  type="text"
                  placeholder="Nachname"
                  value={formData.nachname}
                  onChange={(e) => setFormData({ ...formData, nachname: e.target.value })}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              <input
                type="email"
                placeholder="E-Mail"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
              />

              <input
                type="tel"
                placeholder="Telefon"
                value={formData.telefon}
                onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Themen</label>
                <div className="space-y-2">
                  {allThemen.map((thema) => (
                    <label key={thema} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.themen.includes(thema)}
                        onChange={() => handleThemaToggle(thema)}
                        className="w-4 h-4 border border-slate-300 rounded text-blue-600 focus:ring-0"
                      />
                      <span className="text-sm text-slate-700">{thema}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.erreichbar}
                  onChange={(e) => setFormData({ ...formData, erreichbar: e.target.checked })}
                  className="w-4 h-4 border border-slate-300 rounded text-blue-600 focus:ring-0"
                />
                <span className="text-sm text-slate-700">Erreichbar</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleAddStaff}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Erstellen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
