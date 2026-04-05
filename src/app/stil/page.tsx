'use client'

import { Upload } from 'lucide-react'

const colors = [
  { name: 'Blau', value: '#2563eb', selected: true },
  { name: 'Grün', value: '#16a34a', selected: false },
  { name: 'Lila', value: '#9333ea', selected: false },
  { name: 'Orange', value: '#ea580c', selected: false },
  { name: 'Rot', value: '#dc2626', selected: false },
  { name: 'Grau', value: '#64748b', selected: false },
]

export default function StilPage() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Stil</h1>
        <p className="text-slate-600 text-sm mt-1">Passen Sie das Erscheinungsbild von ImmoGreta an</p>
      </div>

      {/* Firmenname */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-4">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Firmenname</label>
        <input
          type="text"
          defaultValue="ImmoGreta Hausverwaltung"
          className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
        />
      </div>

      {/* Primärfarbe */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-4">
        <label className="block text-sm font-semibold text-slate-700 mb-4">Primärfarbe</label>
        <div className="grid grid-cols-6 gap-3">
          {colors.map((color) => (
            <button
              key={color.value}
              className={`relative w-full aspect-square rounded-lg border-2 transition-all ${
                color.selected ? 'border-slate-800 ring-2 ring-blue-400 ring-offset-2' : 'border-slate-200 hover:border-slate-300'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
              {color.selected && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-6 h-6 rounded-full border-2 border-white" />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Logo hochladen */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-4">
        <label className="block text-sm font-semibold text-slate-700 mb-3">Logo hochladen</label>
        <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-slate-300 transition-colors cursor-pointer">
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">Logo hochladen</p>
          <p className="text-xs text-slate-500 mt-1">oder per Drag & Drop ablegen</p>
          <p className="text-xs text-slate-400 mt-2">PNG, JPG bis 5 MB</p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
          Abbrechen
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Ansicht speichern
        </button>
      </div>
    </div>
  )
}
