'use client'

import { useState } from 'react'
import {
  Link2, Phone, Mail, Globe, Check,
  Building2, ArrowRight, Loader2, Mic,
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
  bg: string
  border: string
  connected: boolean
  category: 'telefon' | 'hausverwaltung' | 'benachrichtigung'
  configFields?: { key: string; label: string; placeholder: string; type?: string }[]
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'telefon',
    name: 'Telefon & KI-Stimme',
    description: 'Konfigurieren Sie Ihre KI-Assistentin für die automatische Anrufannahme',
    icon: Phone,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    connected: false,
    category: 'telefon',
    configFields: [
      { key: 'api_key', label: 'Zugangsschlüssel', placeholder: 'Wird von ImmoGreta bereitgestellt', type: 'password' },
      { key: 'agent_id', label: 'Assistenten-ID', placeholder: 'Wird von ImmoGreta bereitgestellt' },
    ],
  },
  {
    id: 'stimme',
    name: 'Stimmenauswahl',
    description: 'Wählen Sie die Stimme Ihrer KI-Assistentin',
    icon: Mic,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    connected: false,
    category: 'telefon',
  },
  {
    id: 'haufe',
    name: 'Haufe PowerHaus',
    description: 'Synchronisieren Sie Mieter und Objekte aus Haufe PowerHaus',
    icon: Building2,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    connected: false,
    category: 'hausverwaltung',
    configFields: [
      { key: 'server', label: 'Server-Adresse', placeholder: 'Von Ihrem IT-Anbieter' },
      { key: 'username', label: 'Benutzername', placeholder: 'Ihr Benutzername' },
      { key: 'password', label: 'Passwort', placeholder: '••••••••', type: 'password' },
    ],
  },
  {
    id: 'aareon',
    name: 'Aareon Wodis',
    description: 'Koppeln Sie Ihr Aareon Wodis-System für Mieterdaten-Sync',
    icon: Building2,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    connected: false,
    category: 'hausverwaltung',
    configFields: [
      { key: 'server', label: 'Server-Adresse', placeholder: 'Von Ihrem IT-Anbieter' },
      { key: 'username', label: 'Benutzername', placeholder: 'Ihr Benutzername' },
      { key: 'password', label: 'Passwort', placeholder: '••••••••', type: 'password' },
    ],
  },
  {
    id: 'eigenes_system',
    name: 'Eigenes System',
    description: 'Verbinden Sie Ihr bestehendes Hausverwaltungs-System',
    icon: Globe,
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    connected: false,
    category: 'hausverwaltung',
    configFields: [
      { key: 'base_url', label: 'Server-Adresse', placeholder: 'Adresse Ihres Systems' },
      { key: 'api_key', label: 'Zugangsschlüssel', placeholder: 'Von Ihrem IT-Anbieter', type: 'password' },
    ],
  },
  {
    id: 'email',
    name: 'E-Mail-Benachrichtigungen',
    description: 'Automatische E-Mails bei neuen Anrufen, Tickets oder Rückrufen',
    icon: Mail,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    connected: false,
    category: 'benachrichtigung',
    configFields: [
      { key: 'host', label: 'E-Mail-Server', placeholder: 'z.B. smtp.gmail.com' },
      { key: 'port', label: 'Port', placeholder: '587' },
      { key: 'user', label: 'E-Mail-Adresse', placeholder: 'email@firma.de' },
      { key: 'pass', label: 'Passwort', placeholder: '••••••••', type: 'password' },
    ],
  },
]

const CATEGORIES: Record<string, string> = {
  telefon: 'Telefonie & KI',
  hausverwaltung: 'Hausverwaltungs-Systeme',
  benachrichtigung: 'Benachrichtigungen',
}

export default function IntegrationenPage() {
  const [integrations, setIntegrations] = useState(INTEGRATIONS)
  const [configuring, setConfiguring] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const openConfig = (id: string) => {
    setConfiguring(id)
    setFormData({})
  }

  const handleSave = async (id: string) => {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIntegrations(prev =>
      prev.map(i => i.id === id ? { ...i, connected: true } : i)
    )
    setSaving(false)
    setConfiguring(null)
    showToast('Integration verbunden')
  }

  const handleDisconnect = (id: string) => {
    setIntegrations(prev =>
      prev.map(i => i.id === id ? { ...i, connected: false } : i)
    )
    showToast('Integration getrennt')
  }

  const categories = [...new Set(integrations.map(i => i.category))]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Integrationen</h1>
        <p className="text-slate-500 text-sm mt-1">
          Koppeln Sie Ihre Systeme mit ImmoGreta
        </p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
          <Check className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">
            {integrations.filter(i => i.connected).length} verbunden
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
          <Link2 className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-600">
            {integrations.filter(i => !i.connected).length} verfügbar
          </span>
        </div>
      </div>

      <div className="space-y-8">
        {categories.map(cat => (
          <div key={cat}>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              {CATEGORIES[cat] || cat}
            </h2>
            <div className="space-y-3">
              {integrations.filter(i => i.category === cat).map(integration => {
                const Icon = integration.icon
                const isConfiguring = configuring === integration.id

                return (
                  <div
                    key={integration.id}
                    className={`bg-white border rounded-xl overflow-hidden transition-all ${
                      integration.connected ? 'border-emerald-200' : 'border-slate-200'
                    }`}
                  >
                    <div className="p-4 lg:p-5 flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${integration.bg} border ${integration.border}`}>
                        <Icon className={`w-5 h-5 ${integration.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-900">{integration.name}</h3>
                          {integration.connected && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-medium text-emerald-700">
                              <Check className="w-3 h-3" /> Verbunden
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{integration.description}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {integration.connected ? (
                          <button
                            onClick={() => handleDisconnect(integration.id)}
                            className="px-3 py-1.5 border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Trennen
                          </button>
                        ) : integration.configFields ? (
                          <button
                            onClick={() => openConfig(integration.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Verbinden <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 bg-slate-100 text-slate-500 text-xs font-medium rounded-lg">
                            Bald verfügbar
                          </span>
                        )}
                      </div>
                    </div>

                    {isConfiguring && integration.configFields && (
                      <div className="px-4 lg:px-5 pb-4 lg:pb-5 pt-0 border-t border-slate-100">
                        <div className="mt-4 space-y-3">
                          {integration.configFields.map(field => (
                            <div key={field.key}>
                              <label className="block text-xs font-medium text-slate-600 mb-1">{field.label}</label>
                              <input
                                type={field.type || 'text'}
                                value={formData[field.key] || ''}
                                onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                placeholder={field.placeholder}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          ))}
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => setConfiguring(null)}
                              className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              Abbrechen
                            </button>
                            <button
                              onClick={() => handleSave(integration.id)}
                              disabled={saving}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                              {saving ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Verbinden...
                                </>
                              ) : (
                                'Speichern & Verbinden'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm px-5 py-3 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
