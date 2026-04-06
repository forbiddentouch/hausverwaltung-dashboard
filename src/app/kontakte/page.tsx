'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Plus, Edit2, Trash2, X, Users, Check, Phone, Mail, MapPin, StickyNote, Download, Upload, FileUp } from 'lucide-react'
import { supabase, getOrganizationId } from '@/lib/supabase'

interface Contact {
  id: string
  vorname: string
  nachname: string
  telefon: string
  email: string
  strasse: string
  hausnummer: string
  plz: string
  stadt: string
  notizen: string
  createdAt: string
}

const AVATAR_COLORS = [
  'from-blue-400 to-blue-600',
  'from-violet-400 to-violet-600',
  'from-emerald-400 to-emerald-600',
  'from-amber-400 to-amber-600',
  'from-pink-400 to-pink-600',
  'from-cyan-400 to-cyan-600',
  'from-orange-400 to-orange-600',
  'from-teal-400 to-teal-600',
]

const STORAGE_KEY = 'immogreta_kontakte'

function getInitials(vorname: string, nachname: string): string {
  return ((vorname[0] || '') + (nachname[0] || '')).toUpperCase()
}

function getAvatarColor(id: string): string {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function generateId(): string {
  return 'k_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function loadLocalContacts(): Contact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalContacts(contacts: Contact[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts))
  } catch {
    console.error('Fehler beim Speichern')
  }
}

// Map Supabase tenant row to Contact
function tenantToContact(t: Record<string, unknown>): Contact {
  const name = (t.name as string) || ''
  const parts = name.split(' ')
  return {
    id: t.id as string,
    vorname: parts[0] || '',
    nachname: parts.slice(1).join(' ') || '',
    telefon: (t.telefon as string) || (t.phone_number as string) || '',
    email: (t.email as string) || '',
    strasse: (t.strasse as string) || '',
    hausnummer: (t.hausnummer as string) || '',
    plz: (t.plz as string) || '',
    stadt: (t.stadt as string) || '',
    notizen: (t.notizen as string) || '',
    createdAt: (t.created_at as string) || new Date().toISOString(),
  }
}

const emptyForm = {
  vorname: '',
  nachname: '',
  telefon: '',
  email: '',
  strasse: '',
  hausnummer: '',
  plz: '',
  stadt: '',
  notizen: '',
}

interface ContactModalProps {
  isOpen: boolean
  mode: 'add' | 'edit'
  initial?: Contact
  onClose: () => void
  onSubmit: (data: typeof emptyForm) => void
}

function ContactModal({ isOpen, mode, initial, onClose, onSubmit }: ContactModalProps) {
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initial) {
        setFormData({
          vorname: initial.vorname,
          nachname: initial.nachname,
          telefon: initial.telefon,
          email: initial.email,
          strasse: initial.strasse,
          hausnummer: initial.hausnummer,
          plz: initial.plz,
          stadt: initial.stadt,
          notizen: initial.notizen,
        })
      } else {
        setFormData(emptyForm)
      }
    }
  }, [isOpen, mode, initial])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.vorname.trim() || !formData.nachname.trim()) return
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            {mode === 'add' ? 'Neuen Kontakt anlegen' : 'Kontakt bearbeiten'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Vorname <span className="text-red-400">*</span>
              </label>
              <input type="text" name="vorname" value={formData.vorname} onChange={handleChange}
                placeholder="z.B. Max"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Nachname <span className="text-red-400">*</span>
              </label>
              <input type="text" name="nachname" value={formData.nachname} onChange={handleChange}
                placeholder="z.B. Mustermann"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Telefon</label>
              <input type="tel" name="telefon" value={formData.telefon} onChange={handleChange}
                placeholder="+49 123 456789"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">E-Mail</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="max@example.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Straße</label>
              <input type="text" name="strasse" value={formData.strasse} onChange={handleChange}
                placeholder="Hauptstraße"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Hausnr.</label>
              <input type="text" name="hausnummer" value={formData.hausnummer} onChange={handleChange}
                placeholder="42"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">PLZ</label>
              <input type="text" name="plz" value={formData.plz} onChange={handleChange}
                placeholder="10115"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Stadt</label>
              <input type="text" name="stadt" value={formData.stadt} onChange={handleChange}
                placeholder="Berlin"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notizen</label>
            <textarea name="notizen" value={formData.notizen} onChange={handleChange}
              placeholder="Wohnungsnummer, Besonderheiten..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Abbrechen
            </button>
            <button type="submit"
              disabled={!formData.vorname.trim() || !formData.nachname.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {mode === 'add' ? 'Kontakt anlegen' : 'Änderungen speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface DetailPanelProps {
  contact: Contact | null
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

function DetailPanel({ contact, onClose, onEdit, onDelete }: DetailPanelProps) {
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  useEffect(() => { setDeleteConfirm(false) }, [contact])

  if (!contact) return null

  const fullAddress = [
    [contact.strasse, contact.hausnummer].filter(Boolean).join(' '),
    [contact.plz, contact.stadt].filter(Boolean).join(' '),
  ].filter(Boolean).join(', ')

  return (
    <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white border-l border-slate-200 shadow-xl z-40 flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800">Kontaktdetails</h3>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div className="flex flex-col items-center py-4">
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getAvatarColor(contact.id)} flex items-center justify-center mb-3`}>
            <span className="text-white text-2xl font-bold">{getInitials(contact.vorname, contact.nachname)}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800">{contact.vorname} {contact.nachname}</h2>
          <p className="text-xs text-slate-400 mt-1">
            Erstellt am {new Date(contact.createdAt).toLocaleDateString('de-DE')}
          </p>
        </div>

        <div className="space-y-3">
          {contact.telefon && (
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <Phone className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Telefon</p>
                <a href={`tel:${contact.telefon}`} className="text-sm font-medium text-slate-800 hover:text-blue-600">
                  {contact.telefon}
                </a>
              </div>
            </div>
          )}
          {contact.email && (
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <Mail className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-0.5">E-Mail</p>
                <a href={`mailto:${contact.email}`} className="text-sm font-medium text-slate-800 hover:text-violet-600 break-all">
                  {contact.email}
                </a>
              </div>
            </div>
          )}
          {fullAddress && (
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Adresse</p>
                <p className="text-sm font-medium text-slate-800">{fullAddress}</p>
              </div>
            </div>
          )}
          {contact.notizen && (
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <StickyNote className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Notizen</p>
                <p className="text-sm text-slate-700 leading-relaxed">{contact.notizen}</p>
              </div>
            </div>
          )}
          {!contact.telefon && !contact.email && !fullAddress && !contact.notizen && (
            <p className="text-sm text-slate-400 text-center py-4">Keine weiteren Details vorhanden</p>
          )}
        </div>
      </div>

      <div className="p-5 border-t border-slate-100 space-y-2">
        <button onClick={onEdit}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          <Edit2 className="w-4 h-4" />
          Bearbeiten
        </button>
        {deleteConfirm ? (
          <div className="flex gap-2">
            <button onClick={() => setDeleteConfirm(false)}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Abbrechen
            </button>
            <button onClick={onDelete}
              className="flex-1 px-4 py-2 bg-red-500 rounded-lg text-sm font-medium text-white hover:bg-red-600 transition-colors">
              Wirklich löschen
            </button>
          </div>
        ) : (
          <button onClick={() => setDeleteConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" />
            Löschen
          </button>
        )}
      </div>
    </div>
  )
}

export default function KontaktePage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined)
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)
  const [useDB, setUseDB] = useState(false)
  const [orgId, setOrgId] = useState<string | null>(null)

  const loadFromSupabase = useCallback(async () => {
    try {
      const oid = await getOrganizationId()
      if (!oid) {
        setContacts(loadLocalContacts())
        return
      }
      setOrgId(oid)
      setUseDB(true)
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('organization_id', oid)
        .order('name')
      if (error) throw error
      setContacts((data || []).map(tenantToContact))
    } catch {
      setContacts(loadLocalContacts())
    }
  }, [])

  useEffect(() => {
    loadFromSupabase()
  }, [loadFromSupabase])

  function showFeedback(msg: string) {
    setSavedFeedback(msg)
    setTimeout(() => setSavedFeedback(null), 2500)
  }

  async function handleAddContact(data: typeof emptyForm) {
    if (useDB && orgId) {
      const { data: inserted, error } = await supabase.from('tenants').insert({
        organization_id: orgId,
        name: `${data.vorname} ${data.nachname}`.trim(),
        telefon: data.telefon || null,
        email: data.email || null,
        strasse: data.strasse || null,
        hausnummer: data.hausnummer || null,
        plz: data.plz || null,
        stadt: data.stadt || null,
        notizen: data.notizen || null,
      }).select().single()
      if (!error && inserted) {
        setContacts(prev => [...prev, tenantToContact(inserted)].sort((a, b) =>
          (a.nachname + a.vorname).localeCompare(b.nachname + b.vorname)))
      }
    } else {
      const newContact: Contact = { id: generateId(), ...data, createdAt: new Date().toISOString() }
      const updated = [...contacts, newContact].sort((a, b) =>
        (a.nachname + a.vorname).localeCompare(b.nachname + b.vorname))
      setContacts(updated)
      saveLocalContacts(updated)
    }
    setModalOpen(false)
    showFeedback('Kontakt angelegt')
  }

  async function handleEditContact(data: typeof emptyForm) {
    if (!editingContact) return
    if (useDB && orgId) {
      const { error } = await supabase.from('tenants').update({
        name: `${data.vorname} ${data.nachname}`.trim(),
        telefon: data.telefon || null,
        email: data.email || null,
        strasse: data.strasse || null,
        hausnummer: data.hausnummer || null,
        plz: data.plz || null,
        stadt: data.stadt || null,
        notizen: data.notizen || null,
      }).eq('id', editingContact.id)
      if (!error) {
        setContacts(prev => prev.map(c => c.id === editingContact.id
          ? { ...c, ...data }
          : c).sort((a, b) => (a.nachname + a.vorname).localeCompare(b.nachname + b.vorname)))
        const updatedContact = { ...editingContact, ...data }
        setSelectedContact(updatedContact)
      }
    } else {
      const updated = contacts.map(c => c.id === editingContact.id ? { ...c, ...data } : c)
        .sort((a, b) => (a.nachname + a.vorname).localeCompare(b.nachname + b.vorname))
      setContacts(updated)
      saveLocalContacts(updated)
      const updatedContact = updated.find(c => c.id === editingContact.id)
      if (updatedContact) setSelectedContact(updatedContact)
    }
    setModalOpen(false)
    showFeedback('Änderungen gespeichert')
  }

  async function handleDeleteContact() {
    if (!selectedContact) return
    if (useDB && orgId) {
      await supabase.from('tenants').delete().eq('id', selectedContact.id)
    }
    const updated = contacts.filter(c => c.id !== selectedContact.id)
    setContacts(updated)
    if (!useDB) saveLocalContacts(updated)
    setSelectedContact(null)
    showFeedback('Kontakt gelöscht')
  }

  function openEdit() {
    if (!selectedContact) return
    setEditingContact(selectedContact)
    setModalMode('edit')
    setModalOpen(true)
  }

  function openAdd() {
    setEditingContact(undefined)
    setModalMode('add')
    setModalOpen(true)
  }

  function handleCSVExport() {
    const headers = ['Vorname', 'Nachname', 'Telefon', 'E-Mail', 'Straße', 'Hausnummer', 'PLZ', 'Stadt', 'Notizen']
    const rows = contacts.map(c => [
      c.vorname, c.nachname, c.telefon, c.email, c.strasse, c.hausnummer, c.plz, c.stadt, c.notizen,
    ])
    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `kontakte_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showFeedback('Kontakte exportiert')
  }

  function processCSVFile(file: File) {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      showFeedback('Bitte nur CSV-Dateien hochladen')
      return
    }

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string
        const lines = csv.split('\n').filter(line => line.trim())

        if (lines.length < 2) {
          showFeedback('CSV ist leer oder ungültig')
          return
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase())
        const vorNameIndex = headers.findIndex(h => h.includes('vorname'))
        const nachNameIndex = headers.findIndex(h => h.includes('nachname'))
        const telefonIndex = headers.findIndex(h => h.includes('telefon'))
        const emailIndex = headers.findIndex(h => h.includes('e-mail') || h.includes('email'))
        const strasseIndex = headers.findIndex(h => h.includes('straße') || h.includes('strasse'))
        const hausnummerIndex = headers.findIndex(h => h.includes('hausnummer'))
        const plzIndex = headers.findIndex(h => h.includes('plz'))
        const stadtIndex = headers.findIndex(h => h.includes('stadt'))
        const notizenIndex = headers.findIndex(h => h.includes('notizen'))

        const newContacts: Contact[] = []
        let errorCount = 0

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
          if (!values[vorNameIndex]?.trim() || !values[nachNameIndex]?.trim()) {
            errorCount++
            continue
          }
          newContacts.push({
            id: generateId(),
            vorname: values[vorNameIndex] || '',
            nachname: values[nachNameIndex] || '',
            telefon: values[telefonIndex] || '',
            email: values[emailIndex] || '',
            strasse: values[strasseIndex] || '',
            hausnummer: values[hausnummerIndex] || '',
            plz: values[plzIndex] || '',
            stadt: values[stadtIndex] || '',
            notizen: values[notizenIndex] || '',
            createdAt: new Date().toISOString(),
          })
        }

        if (newContacts.length > 0) {
          if (useDB && orgId) {
            const rows = newContacts.map(c => ({
              organization_id: orgId,
              name: `${c.vorname} ${c.nachname}`.trim(),
              telefon: c.telefon || null,
              email: c.email || null,
              strasse: c.strasse || null,
              hausnummer: c.hausnummer || null,
              plz: c.plz || null,
              stadt: c.stadt || null,
              notizen: c.notizen || null,
            }))
            await supabase.from('tenants').insert(rows)
            await loadFromSupabase()
          } else {
            const updated = [...contacts, ...newContacts].sort((a, b) =>
              (a.nachname + a.vorname).localeCompare(b.nachname + b.vorname))
            setContacts(updated)
            saveLocalContacts(updated)
          }
          showFeedback(`${newContacts.length} Kontakte importiert` + (errorCount > 0 ? ` (${errorCount} übersprungen)` : ''))
        } else {
          showFeedback('Keine gültigen Kontakte zum Importieren gefunden')
        }
      } catch (error) {
        console.error('CSV Import Error:', error)
        showFeedback('Fehler beim Importieren der CSV-Datei')
      }
    }
    reader.readAsText(file)
  }

  function handleCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    processCSVFile(file)
    e.target.value = ''
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounter.current = 0
    const file = e.dataTransfer.files?.[0]
    if (file) processCSVFile(file)
  }

  const filteredContacts = contacts.filter(c => {
    const q = searchQuery.toLowerCase()
    return c.vorname.toLowerCase().includes(q) || c.nachname.toLowerCase().includes(q) ||
      c.telefon.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) ||
      c.stadt.toLowerCase().includes(q)
  })

  return (
    <div
      className={`max-w-6xl mx-auto transition-all ${selectedContact ? 'lg:mr-96' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-blue-600/20 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl p-10 text-center border-2 border-dashed border-blue-500">
            <FileUp className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <p className="text-lg font-semibold text-slate-800">CSV-Datei hier ablegen</p>
            <p className="text-sm text-slate-500 mt-1">Kontakte werden automatisch importiert</p>
          </div>
        </div>
      )}

      {savedFeedback && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg shadow-lg text-sm font-medium">
          <Check className="w-4 h-4" />
          {savedFeedback}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Kontakte</h1>
        <p className="text-slate-500 text-sm mt-1">Verwalten Sie Ihre Mieter und Ansprechpartner</p>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 relative min-w-0 w-full sm:min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Nach Name, Telefon oder E-Mail suchen..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Neuen Kontakt anlegen
        </button>
        <div className="flex gap-2">
          <button onClick={handleCSVExport}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            CSV exportieren
          </button>
          <label className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            CSV importieren
            <input type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredContacts.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-slate-400 font-medium">
              {searchQuery ? 'Keine Kontakte gefunden' : 'Noch keine Kontakte vorhanden'}
            </p>
            {!searchQuery && (
              <button onClick={openAdd}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Ersten Kontakt anlegen
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table header */}
            <div className="hidden lg:grid px-6 py-3 bg-slate-50 border-b border-slate-100 grid-cols-12 gap-4">
              <p className="col-span-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Name</p>
              <p className="col-span-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Telefon</p>
              <p className="col-span-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">E-Mail</p>
              <p className="col-span-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Stadt</p>
              <p className="col-span-1"></p>
            </div>
            <div className="divide-y divide-slate-50">
              {filteredContacts.map(contact => (
                <div key={contact.id}
                  onClick={() => setSelectedContact(selectedContact?.id === contact.id ? null : contact)}
                  className={`px-4 py-3 lg:px-6 lg:py-4 flex items-center gap-3 lg:grid lg:grid-cols-12 lg:gap-4 cursor-pointer transition-colors ${
                    selectedContact?.id === contact.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-slate-50'
                  }`}>
                  <div className="lg:col-span-4 flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(contact.id)} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-xs font-bold">{getInitials(contact.vorname, contact.nachname)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{contact.nachname}, {contact.vorname}</p>
                      <p className="text-xs text-slate-400 truncate lg:hidden">{contact.telefon || contact.email || ''}</p>
                      {contact.notizen && <p className="text-xs text-slate-400 truncate hidden lg:block">{contact.notizen}</p>}
                    </div>
                  </div>
                  <div className="hidden lg:block lg:col-span-2 min-w-0">
                    {contact.telefon ? <p className="text-sm text-slate-700 font-mono truncate">{contact.telefon}</p> : <p className="text-xs text-slate-300">—</p>}
                  </div>
                  <div className="hidden lg:block lg:col-span-3 min-w-0">
                    {contact.email ? <p className="text-sm text-slate-600 truncate">{contact.email}</p> : <p className="text-xs text-slate-300">—</p>}
                  </div>
                  <div className="hidden lg:block lg:col-span-2 min-w-0">
                    {contact.stadt ? <p className="text-sm text-slate-600 truncate">{contact.stadt}</p> : <p className="text-xs text-slate-300">—</p>}
                  </div>
                  <div className="lg:col-span-1 flex justify-end flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => { setSelectedContact(contact); setEditingContact(contact); setModalMode('edit'); setModalOpen(true) }}
                      className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-slate-600" title="Bearbeiten">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {contacts.length > 0 && (
        <p className="text-xs text-slate-400 mt-3 px-1">{filteredContacts.length} von {contacts.length} Kontakten</p>
      )}

      <DetailPanel contact={selectedContact} onClose={() => setSelectedContact(null)} onEdit={openEdit} onDelete={handleDeleteContact} />
      <ContactModal isOpen={modalOpen} mode={modalMode} initial={editingContact} onClose={() => setModalOpen(false)}
        onSubmit={modalMode === 'add' ? handleAddContact : handleEditContact} />
    </div>
  )
}
