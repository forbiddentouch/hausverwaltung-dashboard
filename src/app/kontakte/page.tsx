'use client'

import { useState, useEffect } from 'react'
import { supabase, Tenant } from '@/lib/supabase'
import { Search, Plus, Edit2, Trash2, X, Users } from 'lucide-react'

interface Contact extends Tenant {
  email?: string
  address?: string
  notes?: string
}

interface ManualContact extends Contact {
  isManual: true
}

const AVATAR_COLORS = [
  'from-blue-400 to-blue-600',
  'from-violet-400 to-violet-600',
  'from-emerald-400 to-emerald-600',
  'from-amber-400 to-amber-600',
  'from-pink-400 to-pink-600',
  'from-cyan-400 to-cyan-600',
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length]
}

interface AddContactModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (contact: Omit<Contact, 'id'>) => void
  isLoading: boolean
}

function AddContactModal({ isOpen, onClose, onSubmit, isLoading }: AddContactModalProps) {
  const [formData, setFormData] = useState({
    vorname: '',
    nachname: '',
    telefonnummer: '',
    email: '',
    strasse: '',
    hausnummer: '',
    plz: '',
    stadt: '',
    notizen: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.vorname.trim() || !formData.nachname.trim()) {
      alert('Bitte füllen Sie Vorname und Nachname aus')
      return
    }

    const fullName = `${formData.vorname.trim()} ${formData.nachname.trim()}`
    const address = [formData.strasse, formData.hausnummer].filter(Boolean).join(' ')
    const location = [formData.plz, formData.stadt].filter(Boolean).join(' ')
    const fullAddress = [address, location].filter(Boolean).join(', ')

    onSubmit({
      name: fullName,
      phone_number: formData.telefonnummer || null,
      email: formData.email || undefined,
      address: fullAddress || undefined,
      notes: formData.notizen || undefined,
    } as any)

    setFormData({
      vorname: '',
      nachname: '',
      telefonnummer: '',
      email: '',
      strasse: '',
      hausnummer: '',
      plz: '',
      stadt: '',
      notizen: '',
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Neuen Kontakt anlegen</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 hover:bg-slate-100 rounded transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Row 1: Vorname + Nachname */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Vorname <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vorname"
                value={formData.vorname}
                onChange={handleChange}
                placeholder="z.B. Max"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nachname <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nachname"
                value={formData.nachname}
                onChange={handleChange}
                placeholder="z.B. Mustermann"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              />
            </div>
          </div>

          {/* Row 2: Telefon + E-Mail */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telefonnummer</label>
              <input
                type="tel"
                name="telefonnummer"
                value={formData.telefonnummer}
                onChange={handleChange}
                placeholder="z.B. +49 123 456789"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="z.B. max@example.com"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              />
            </div>
          </div>

          {/* Row 3: Straße + Hausnummer */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Straße</label>
              <input
                type="text"
                name="strasse"
                value={formData.strasse}
                onChange={handleChange}
                placeholder="z.B. Hauptstraße"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hausnummer</label>
              <input
                type="text"
                name="hausnummer"
                value={formData.hausnummer}
                onChange={handleChange}
                placeholder="z.B. 42"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              />
            </div>
          </div>

          {/* Row 4: PLZ + Stadt */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">PLZ</label>
              <input
                type="text"
                name="plz"
                value={formData.plz}
                onChange={handleChange}
                placeholder="z.B. 10115"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stadt</label>
              <input
                type="text"
                name="stadt"
                value={formData.stadt}
                onChange={handleChange}
                placeholder="z.B. Berlin"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              />
            </div>
          </div>

          {/* Notizen */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notizen</label>
            <textarea
              name="notizen"
              value={formData.notizen}
              onChange={handleChange}
              placeholder="z.B. Wohnungsnummer, Besonderheiten..."
              disabled={isLoading}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Wird erstellt...' : 'Kontakt anlegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function KontaktePage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Fetch contacts on mount
  useEffect(() => {
    fetchContacts()
  }, [])

  async function fetchContacts() {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching contacts:', error)
        return
      }

      setContacts((data ?? []) as Contact[])
    } catch (err) {
      console.error('Error:', err)
    }
  }

  async function addContact(contactData: Omit<Contact, 'id'>) {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('tenants')
        .insert([
          {
            name: contactData.name,
            phone_number: contactData.phone_number,
          },
        ])
        .select()

      if (error) {
        console.error('Error adding contact:', error)
        alert('Fehler beim Erstellen des Kontakts: ' + error.message)
        return
      }

      // Add email/address/notes to local state
      if (data && data.length > 0) {
        const newContact: Contact = {
          ...data[0],
          email: contactData.email,
          address: contactData.address,
          notes: contactData.notes,
        }
        setContacts(prev => [...prev, newContact].sort((a, b) => a.name.localeCompare(b.name)))
      }

      setIsModalOpen(false)
    } catch (err) {
      console.error('Error:', err)
      alert('Ein Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteContact(id: string) {
    try {
      const { error } = await supabase.from('tenants').delete().eq('id', id)

      if (error) {
        console.error('Error deleting contact:', error)
        alert('Fehler beim Löschen: ' + error.message)
        return
      }

      setContacts(prev => prev.filter(c => c.id !== id))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Error:', err)
      alert('Ein Fehler ist aufgetreten')
    }
  }

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.phone_number && contact.phone_number.includes(searchQuery))
  )

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Kontakte</h1>
        <p className="text-slate-500 text-sm mt-1">Verwalten Sie Ihre Mieter und Ansprechpartner</p>
      </div>

      {/* Top bar: Search + Add button */}
      <div className="flex gap-3 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Nach Name oder Telefon suchen..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Neuen Kontakt anlegen
        </button>
      </div>

      {/* Contact table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredContacts.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">
              {searchQuery ? 'Keine Kontakte gefunden' : 'Noch keine Kontakte vorhanden'}
            </p>
            <p className="text-slate-300 text-xs mt-1">
              {!searchQuery && 'Klicken Sie auf "Neuen Kontakt anlegen", um zu beginnen'}
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 grid grid-cols-12 gap-4">
              <p className="col-span-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Name</p>
              <p className="col-span-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Telefon</p>
              <p className="col-span-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Adresse</p>
              <p className="col-span-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Notizen</p>
              <p className="col-span-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Aktionen</p>
            </div>

            {/* Table rows */}
            <div className="divide-y divide-slate-50">
              {filteredContacts.map((contact, index) => (
                <div key={contact.id} className="px-6 py-4 grid grid-cols-12 gap-4 items-start hover:bg-slate-50 transition-colors">
                  {/* Name with avatar */}
                  <div className="col-span-3 flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(index)} flex items-center justify-center flex-shrink-0`}
                    >
                      <span className="text-white text-xs font-bold">{getInitials(contact.name)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{contact.name}</p>
                      {contact.email && (
                        <p className="text-xs text-slate-400 truncate">{contact.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Telefon */}
                  <div className="col-span-2 min-w-0">
                    {contact.phone_number ? (
                      <p className="text-sm text-slate-700 font-mono">{contact.phone_number}</p>
                    ) : (
                      <p className="text-xs text-slate-300 italic">—</p>
                    )}
                  </div>

                  {/* Adresse */}
                  <div className="col-span-2 min-w-0">
                    {contact.address ? (
                      <p className="text-sm text-slate-600 truncate">{contact.address}</p>
                    ) : (
                      <p className="text-xs text-slate-300 italic">—</p>
                    )}
                  </div>

                  {/* Notizen */}
                  <div className="col-span-3 min-w-0">
                    {contact.notes ? (
                      <p className="text-sm text-slate-600 truncate">{contact.notes}</p>
                    ) : (
                      <p className="text-xs text-slate-300 italic">—</p>
                    )}
                  </div>

                  {/* Aktionen */}
                  <div className="col-span-2 flex items-center gap-2">
                    {deleteConfirm === contact.id ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-600">Wirklich löschen?</span>
                        <button
                          onClick={() => deleteContact(contact.id)}
                          className="px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors font-medium"
                        >
                          Ja
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors font-medium"
                        >
                          Nein
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          className="p-1.5 hover:bg-slate-200 rounded transition-colors text-slate-400 hover:text-slate-600"
                          title="Bearbeiten"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(contact.id)}
                          className="p-1.5 hover:bg-red-50 rounded transition-colors text-slate-400 hover:text-red-600"
                          title="Löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addContact}
        isLoading={isLoading}
      />
    </div>
  )
}
