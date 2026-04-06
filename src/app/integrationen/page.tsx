'use client'

import { useState } from 'react'
import {
  Phone, Mail, Building2, AlertCircle, Mic,
} from 'lucide-react'

const HAUSVERWALTUNGS_SYSTEME = [
  'Haufe PowerHaus',
  'Aareon Wodis',
  'Aareon Wodis Sigma',
  'Domus Software',
  'SAP Real Estate Management',
  'Vitako',
  'FACT',
  'iX-Haus',
  'objego',
  'wohndata',
  'Yardi Voyager',
  'ORCA',
  'immowelt Business',
  'Haufe WISO',
  'ista',
  'Techem',
  'Anderes System',
]

export default function IntegrationenPage() {
  const [selectedSystem, setSelectedSystem] = useState('')
  const [email, setEmail] = useState('')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Integrationen</h1>
        <p className="text-slate-500 text-sm mt-1">
          Koppeln Sie Ihre Systeme mit ImmoGreta
        </p>
      </div>

      {/* Info Banner */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900 mb-1">
            Integrationen in Entwicklung
          </p>
          <p className="text-xs text-blue-700">
            Die Anbindung externer Systeme ist aktuell in Planung. Teilen Sie uns mit, welches System Sie nutzen,
            und wir informieren Sie, sobald die Integration verfügbar ist.
          </p>
        </div>
      </div>

      {/* Telefonie & KI */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Telefonie & KI
        </h2>

        <div className="space-y-3">
          {/* Telefon */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-50 border border-blue-200">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-900">Telefon & KI-Assistentin</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Ihre KI-Assistentin nimmt Anrufe entgegen und erstellt automatisch Tickets
                </p>
                <div className="mt-3">
                  <span className="inline-block px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">
                    Wird von ImmoGreta konfiguriert
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stimme */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-violet-50 border border-violet-200">
                <Mic className="w-5 h-5 text-violet-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-900">Stimmenauswahl</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Wählen Sie die Stimme Ihrer KI-Assistentin
                </p>
                <div className="mt-3">
                  <span className="inline-block px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium rounded-lg">
                    Bald verfügbar
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hausverwaltungs-Systeme */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Hausverwaltungs-Systeme
        </h2>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-sky-50 border border-sky-200">
              <Building2 className="w-5 h-5 text-sky-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900">Hausverwaltungssoftware anbinden</h3>
              <p className="text-xs text-slate-500 mt-1">
                Synchronisieren Sie Mieter, Objekte und Verträge aus Ihrer bestehenden Software
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Welches System nutzen Sie?
              </label>
              <select
                value={selectedSystem}
                onChange={(e) => setSelectedSystem(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">System auswählen...</option>
                {HAUSVERWALTUNGS_SYSTEME.map((system) => (
                  <option key={system} value={system}>
                    {system}
                  </option>
                ))}
              </select>
            </div>

            {selectedSystem && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs font-medium text-amber-800 mb-1">
                  Integration für "{selectedSystem}" in Planung
                </p>
                <p className="text-xs text-amber-700">
                  Wir arbeiten daran, diese Integration verfügbar zu machen. Sie werden benachrichtigt, sobald sie bereit ist.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Benachrichtigungen */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Benachrichtigungen
        </h2>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-orange-50 border border-orange-200">
              <Mail className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900">E-Mail-Benachrichtigungen</h3>
              <p className="text-xs text-slate-500 mt-1">
                Automatische E-Mails bei neuen Anrufen, Tickets oder Rückrufen
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                E-Mail-Adresse für Benachrichtigungen
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ihre@email.de"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs font-medium text-amber-800 mb-1">
                E-Mail-Benachrichtigungen in Planung
              </p>
              <p className="text-xs text-amber-700">
                Diese Funktion wird in Kürze verfügbar sein. Ihre Eingaben werden gespeichert.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
