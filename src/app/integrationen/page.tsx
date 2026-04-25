'use client'

import { useState } from 'react'
import { Search, CheckCircle2, Clock, Zap } from 'lucide-react'

type Status = 'connected' | 'available' | 'soon'

type Integration = {
  name: string
  description: string
  status: Status
  logo: string
  bg: string
  color: string
}

type Category = {
  label: string
  integrations: Integration[]
}

const CATEGORIES: Category[] = [
  {
    label: 'Kalender & Termine',
    integrations: [
      { name: 'Google Calendar', description: 'Termine automatisch aus Anrufen erstellen', status: 'soon', logo: '📅', bg: '#4285F4', color: '#fff' },
      { name: 'Outlook Kalender', description: 'Microsoft 365 Kalender synchronisieren', status: 'soon', logo: '📆', bg: '#0078D4', color: '#fff' },
      { name: 'Calendly', description: 'Rückruf-Termine direkt buchbar machen', status: 'soon', logo: '🗓️', bg: '#006BFF', color: '#fff' },
    ],
  },
  {
    label: 'Kommunikation',
    integrations: [
      { name: 'Gmail', description: 'E-Mail-Benachrichtigungen & Zusammenfassungen', status: 'soon', logo: 'G', bg: '#EA4335', color: '#fff' },
      { name: 'Outlook Mail', description: 'Automatische Mails nach jedem Anruf', status: 'soon', logo: 'O', bg: '#0078D4', color: '#fff' },
      { name: 'WhatsApp Business', description: 'Mieter per WhatsApp benachrichtigen', status: 'soon', logo: '💬', bg: '#25D366', color: '#fff' },
      { name: 'Slack', description: 'Anruf-Zusammenfassungen ins Team-Channel', status: 'soon', logo: '#', bg: '#4A154B', color: '#fff' },
      { name: 'Microsoft Teams', description: 'Benachrichtigungen direkt in Teams', status: 'soon', logo: 'T', bg: '#6264A7', color: '#fff' },
    ],
  },
  {
    label: 'Buchhaltung & Finanzen',
    integrations: [
      { name: 'DATEV', description: 'Belege und Vorgänge automatisch übertragen', status: 'soon', logo: 'D', bg: '#003B7A', color: '#fff' },
      { name: 'Lexware', description: 'Buchungen und Mietzahlungen synchronisieren', status: 'soon', logo: 'L', bg: '#E30613', color: '#fff' },
      { name: 'sevDesk', description: 'Rechnungen & Dokumente verwalten', status: 'soon', logo: 'S', bg: '#2B9348', color: '#fff' },
    ],
  },
  {
    label: 'Hausverwaltungs-Software',
    integrations: [
      { name: 'iX-Haus', description: 'Mieter, Objekte und Verträge synchronisieren', status: 'soon', logo: 'iX', bg: '#1E40AF', color: '#fff' },
      { name: 'objego', description: 'Eigentümerportal anbinden', status: 'soon', logo: 'ob', bg: '#7C3AED', color: '#fff' },
      { name: 'Aareon Wodis', description: 'Bestandsdaten und Tickets übertragen', status: 'soon', logo: 'A', bg: '#0EA5E9', color: '#fff' },
      { name: 'Domus Software', description: 'Stammdaten & Mieterverwaltung', status: 'soon', logo: 'D', bg: '#059669', color: '#fff' },
      { name: 'wohndata', description: 'Wohnungsdaten und Mieter importieren', status: 'soon', logo: 'w', bg: '#D97706', color: '#fff' },
      { name: 'Yardi Voyager', description: 'Enterprise-Lösung anbinden', status: 'soon', logo: 'Y', bg: '#DC2626', color: '#fff' },
    ],
  },
  {
    label: 'Dokumente & Speicher',
    integrations: [
      { name: 'Google Drive', description: 'Gesprächsprotokolle automatisch ablegen', status: 'soon', logo: '▲', bg: '#34A853', color: '#fff' },
      { name: 'Dropbox', description: 'Dokumente und Aufzeichnungen speichern', status: 'soon', logo: '⬡', bg: '#0061FF', color: '#fff' },
      { name: 'OneDrive', description: 'Microsoft Cloud-Speicher anbinden', status: 'soon', logo: '☁', bg: '#0078D4', color: '#fff' },
    ],
  },
  {
    label: 'Telefonie & KI',
    integrations: [
      { name: 'Telefon & KI-Assistentin', description: 'ImmoGreta nimmt Anrufe entgegen und erstellt Tickets', status: 'connected', logo: '📞', bg: '#2563EB', color: '#fff' },
      { name: 'Stimmenauswahl', description: 'Stimme der KI-Assistentin konfigurieren', status: 'soon', logo: '🎙️', bg: '#7C3AED', color: '#fff' },
    ],
  },
]

const STATUS_CONFIG = {
  connected: { label: 'Verbunden', icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  available: { label: 'Verbinden', icon: Zap, className: 'bg-blue-600 text-white' },
  soon: { label: 'Bald verfügbar', icon: Clock, className: 'bg-slate-100 text-slate-500' },
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const statusCfg = STATUS_CONFIG[integration.status]
  const Icon = statusCfg.icon

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-base font-bold select-none"
          style={{ background: integration.bg, color: integration.color }}
        >
          {integration.logo}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{integration.name}</p>
          <p className="text-xs text-slate-500 mt-0.5 leading-snug">{integration.description}</p>
        </div>
      </div>
      <div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusCfg.className}`}>
          <Icon className="w-3 h-3" />
          {statusCfg.label}
        </span>
      </div>
    </div>
  )
}

export default function IntegrationenPage() {
  const [search, setSearch] = useState('')

  const query = search.toLowerCase()
  const filtered = CATEGORIES.map(cat => ({
    ...cat,
    integrations: cat.integrations.filter(
      i => i.name.toLowerCase().includes(query) || i.description.toLowerCase().includes(query)
    ),
  })).filter(cat => cat.integrations.length > 0)

  return (
    <div className="max-w-4xl mx-auto px-1">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Integrationen</h1>
        <p className="text-slate-500 text-sm mt-1">Verbinden Sie ImmoGreta mit Ihren Tools und Systemen</p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Integration suchen..."
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
      </div>

      {/* Categories */}
      <div className="space-y-10">
        {filtered.map(cat => (
          <div key={cat.label}>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              {cat.label}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cat.integrations.map(integration => (
                <IntegrationCard key={integration.name} integration={integration} />
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400 text-sm">
            Keine Integration gefunden für „{search}"
          </div>
        )}
      </div>
    </div>
  )
}
