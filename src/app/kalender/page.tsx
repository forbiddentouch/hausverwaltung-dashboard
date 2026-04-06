'use client'

import { useState, useEffect, useRef } from 'react'
import { Phone, Plus, Pencil, Trash2, Check } from 'lucide-react'

interface Appointment {
  id: string
  name: string
  telefon: string
  datum: string
  uhrzeit: string
  typ: 'Rückruf' | 'Termin' | 'Besichtigung'
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
    notizen: '',
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
    notizen: '',
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
    notizen: '',
    erledigt: false,
    createdAt: new Date().toISOString(),
  },
]

export default function KalenderPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const hasLoaded = useRef(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Appointment>>({
    name: '',
    telefon: '',
    datum: '',
    uhrzeit: '',
    typ: 'Termin',
    notizen: '',
  })

  useEffect(() => {
    const stored = localStorage.getItem('immogreta_kalender')
    if (stored) {
      try {
        setAppointments(JSON.parse(stored))
      } catch {
        setAppointments(SEED_APPOINTMENTS)
      }
    } else {
      setAppointments(SEED_APPOINTMENTS)
    }
    hasLoaded.current = true
  }, [])

  // Save only after initial load to avoid wiping data on mount
  useEffect(() => {
    if (!hasLoaded.current) return
    localStorage.setItem('immogreta_kalender', JSON.stringify(appointments))
  }, [appointments])

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const handleOpenModal = (appointment?: Appointment) => {
    if (appointment) {
      setEditingId(appointment.id)
      setFormData(appointment)
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        telefon: '',
        datum: '',
        uhrzeit: '',
        typ: 'Termin',
        notizen: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
  }

  const handleSave = () => {
    if (!formData.name || !formData.datum || !formData.uhrzeit) {
      showToast('Bitte füllen Sie alle erforderlichen Felder aus')
      return
    }

    if (editingId) {
      setAppointments(
        appointments.map((a) =>
          a.id === editingId
            ? {
                ...a,
                ...formData,
                updatedAt: new Date().toISOString(),
              }
            : a
        )
      )
      showToast('Termin aktualisiert')
    } else {
      const newAppointment: Appointment = {
        ...(formData as Appointment),
        id: Date.now().toString(),
        erledigt: false,
        createdAt: new Date().toISOString(),
      }
      setAppointments([...appointments, newAppointment])
      showToast('Termin hinzugefügt')
    }

    handleCloseModal()
  }

  const handleDelete = (id: string) => {
    setAppointments(appointments.filter((a) => a.id !== id))
    setDeleteConfirm(null)
    showToast('Termin gelöscht')
  }

  const handleToggleErledigt = (id: string) => {
    setAppointments(
      appointments.map((a) =>
        a.id === id ? { ...a, erledigt: !a.erledigt } : a
      )
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    })
  }

  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(`${a.datum}T${a.uhrzeit}`)
    const dateB = new Date(`${b.datum}T${b.uhrzeit}`)
    return dateA.getTime() - dateB.getTime()
  })

  const upcomingAppointments = sortedAppointments.filter(
    (a) => !a.erledigt
  )
  const completedAppointments = sortedAppointments.filter((a) => a.erledigt)

  const typColors: Record<string, string> = {
    'Rückruf': 'bg-blue-100 text-blue-700',
    'Termin': 'bg-violet-100 text-violet-700',
    'Besichtigung': 'bg-green-100 text-green-700',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Kalender</h1>
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Neu
            </span>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
          >
            <Plus size={20} />
            Neuen Termin anlegen
          </button>
        </div>

        {/* Upcoming Appointments */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Anstehende Termine
          </h2>
          {upcomingAppointments.length === 0 ? (
            <p className="text-gray-500">Keine anstehenden Termine</p>
          ) : (
            <div className="grid gap-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white rounded-lg shadow p-4 flex items-start gap-4"
                >
                  {/* Phone Icon Circle */}
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone size={24} className="text-green-600" />
                  </div>

                  {/* Main Content */}
                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(appointment.datum)} · {appointment.uhrzeit}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          typColors[appointment.typ]
                        }`}
                      >
                        {appointment.typ}
                      </span>
                    </div>

                    {appointment.notizen && (
                      <p className="text-sm text-gray-600 mb-2">
                        {appointment.notizen}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <a
                        href={`tel:${appointment.telefon.replace(/\s/g, '')}`}
                        className="text-green-600 hover:text-green-700 font-semibold text-sm"
                      >
                        Anrufen
                      </a>
                      <button
                        onClick={() => handleOpenModal(appointment)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Pencil size={16} />
                      </button>
                      {deleteConfirm === appointment.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleDelete(appointment.id)
                            }
                            className="text-red-600 hover:text-red-700 text-xs font-semibold"
                          >
                            Löschen
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-gray-500 hover:text-gray-700 text-xs"
                          >
                            Abbrechen
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(appointment.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleToggleErledigt(appointment.id)
                        }
                        className="text-gray-400 hover:text-green-600"
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Appointments */}
        {completedAppointments.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Erledigte Termine ({completedAppointments.length})
            </h2>
            <div className="space-y-2">
              {completedAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-gray-100 rounded-lg p-3 flex items-center justify-between opacity-60"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-600 line-through">
                      {appointment.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(appointment.datum)} · {appointment.uhrzeit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleErledigt(appointment.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check size={16} />
                    </button>
                    {deleteConfirm === appointment.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(appointment.id)}
                          className="text-red-600 hover:text-red-700 text-xs font-semibold"
                        >
                          Löschen
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-gray-500 hover:text-gray-700 text-xs"
                        >
                          Abbrechen
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(appointment.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingId ? 'Termin bearbeiten' : 'Neuen Termin anlegen'}
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="z.B. Klaus Müller"
                />
              </div>

              {/* Telefon */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.telefon || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, telefon: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="+49 30 123456"
                />
              </div>

              {/* Datum */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Datum *
                </label>
                <input
                  type="date"
                  value={formData.datum || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, datum: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Uhrzeit */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Uhrzeit *
                </label>
                <input
                  type="time"
                  value={formData.uhrzeit || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, uhrzeit: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Typ */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Typ
                </label>
                <select
                  value={formData.typ || 'Termin'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      typ: e.target.value as Appointment['typ'],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Rückruf">Rückruf</option>
                  <option value="Termin">Termin</option>
                  <option value="Besichtigung">Besichtigung</option>
                </select>
              </div>

              {/* Notizen */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Notizen
                </label>
                <textarea
                  value={formData.notizen || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, notizen: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Zusätzliche Informationen..."
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
