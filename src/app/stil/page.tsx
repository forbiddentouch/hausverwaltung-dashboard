'use client'

import { useState, useRef } from 'react'
import { Upload, Check, X, Building2 } from 'lucide-react'
import Image from 'next/image'

const colorOptions = [
  { name: 'Blau', value: '#2563eb' },
  { name: 'Grün', value: '#16a34a' },
  { name: 'Lila', value: '#9333ea' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Rot', value: '#dc2626' },
  { name: 'Grau', value: '#64748b' },
]

export default function StilPage() {
  const [firmenname, setFirmenname] = useState('ImmoGreta Hausverwaltung')
  const [selectedColor, setSelectedColor] = useState('#2563eb')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Datei zu groß. Maximal 5 MB erlaubt.')
      return
    }
    setLogoFile(file)
    const url = URL.createObjectURL(file)
    setLogoUrl(url)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleSave() {
    // In a real app: persist to DB/API. Here: show success feedback.
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function removeLogo() {
    setLogoUrl(null)
    setLogoFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Stil</h1>
        <p className="text-slate-500 text-sm mt-1">Passen Sie das Erscheinungsbild von ImmoGreta an</p>
      </div>

      {/* Live Preview */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Vorschau</p>
        <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: selectedColor + '20' }}>
              <Building2 className="w-5 h-5" style={{ color: selectedColor }} />
            </div>
          )}
          <div>
            <p className="font-bold text-slate-900 text-sm">{firmenname || 'ImmoGreta Hausverwaltung'}</p>
            <p className="text-xs text-slate-400">Hausverwaltung</p>
          </div>
        </div>
      </div>

      {/* Firmenname */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-4">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Firmenname</label>
        <input
          type="text"
          value={firmenname}
          onChange={e => setFirmenname(e.target.value)}
          placeholder="z.B. ImmoGreta Hausverwaltung"
          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
        />
      </div>

      {/* Primärfarbe */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-4">
        <label className="block text-sm font-semibold text-slate-700 mb-1">Primärfarbe</label>
        <p className="text-xs text-slate-400 mb-4">Wird für Buttons, aktive Links und Akzente verwendet</p>
        <div className="flex gap-3">
          {colorOptions.map(color => {
            const active = selectedColor === color.value
            return (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                title={color.name}
                className="relative w-10 h-10 rounded-full border-2 transition-all focus:outline-none"
                style={{
                  backgroundColor: color.value,
                  borderColor: active ? '#1e293b' : 'transparent',
                  boxShadow: active ? `0 0 0 3px ${color.value}40` : 'none',
                  transform: active ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                {active && (
                  <Check className="w-4 h-4 text-white absolute inset-0 m-auto" strokeWidth={3} />
                )}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Ausgewählt: <span className="font-mono font-medium" style={{ color: selectedColor }}>{selectedColor}</span>
          {' · '}{colorOptions.find(c => c.value === selectedColor)?.name}
        </p>
      </div>

      {/* Logo hochladen */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-1">Logo</label>
        <p className="text-xs text-slate-400 mb-4">PNG oder JPG, max. 5 MB. Wird in der Sidebar angezeigt.</p>

        {logoUrl ? (
          <div className="flex items-center gap-4">
            <img src={logoUrl} alt="Logo" className="w-20 h-20 rounded-xl object-cover border border-slate-200" />
            <div>
              <p className="text-sm font-medium text-slate-700">{logoFile?.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{logoFile ? (logoFile.size / 1024).toFixed(0) + ' KB' : ''}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Ersetzen
                </button>
                <button
                  onClick={removeLogo}
                  className="text-xs px-3 py-1.5 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Entfernen
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragging
                ? 'border-blue-400 bg-blue-50'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Upload className={`w-8 h-8 mx-auto mb-2 ${dragging ? 'text-blue-500' : 'text-slate-300'}`} />
            <p className="text-sm font-medium text-slate-600">Klicken oder Datei hierher ziehen</p>
            <p className="text-xs text-slate-400 mt-1">PNG, JPG bis 5 MB</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="text-sm text-green-600 flex items-center gap-1 font-medium">
            <Check className="w-4 h-4" /> Gespeichert
          </span>
        )}
        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: selectedColor }}
        >
          Ansicht speichern
        </button>
      </div>
    </div>
  )
}
