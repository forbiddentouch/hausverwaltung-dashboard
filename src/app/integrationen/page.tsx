'use client'

import { useState } from 'react'
import { Search, CheckCircle2, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import {
  SiGooglecalendar, SiGooglecalendarHex,
  SiGmail, SiGmailHex,
  SiGoogledrive, SiGoogledriveHex,
  SiWhatsapp, SiWhatsappHex,
  SiDropbox, SiDropboxHex,
  SiCalendly, SiCalendlyHex,
  SiDatev, SiDatevHex,
} from '@icons-pack/react-simple-icons'
import type { ComponentType } from 'react'

type Status = 'connected' | 'soon'

type Integration = {
  name: string
  description: string
  status: Status
  Icon?: ComponentType<{ color?: string; size?: number }>
  iconColor?: string
  fallback?: string
  fallbackBg?: string
}

type Category = {
  label: string
  integrations: Integration[]
}

const CATEGORIES: Category[] = [
  {
    label: 'Kalender & Termine',
    integrations: [
      {
        name: 'Google Calendar',
        description: 'Termine automatisch aus Anrufen erstellen',
        status: 'soon',
        Icon: SiGooglecalendar,
        iconColor: '#' + SiGooglecalendarHex,
      },
      {
        name: 'Outlook Kalender',
        description: 'Microsoft 365 Kalender synchronisieren',
        status: 'soon',
        fallback: 'O',
        fallbackBg: '#0078D4',
      },
      {
        name: 'Calendly',
        description: 'Rückruf-Termine direkt buchbar machen',
        status: 'soon',
        Icon: SiCalendly,
        iconColor: '#' + SiCalendlyHex,
      },
    ],
  },
  {
    label: 'Kommunikation',
    integrations: [
      {
        name: 'Gmail',
        description: 'E-Mail-Benachrichtigungen & Zusammenfassungen',
        status: 'soon',
        Icon: SiGmail,
        iconColor: '#' + SiGmailHex,
      },
      {
        name: 'Outlook Mail',
        description: 'Automatische Mails nach jedem Anruf',
        status: 'soon',
        fallback: 'O',
        fallbackBg: '#0078D4',
      },
      {
        name: 'WhatsApp Business',
        description: 'Mieter per WhatsApp benachrichtigen',
        status: 'soon',
        Icon: SiWhatsapp,
        iconColor: '#' + SiWhatsappHex,
      },
      {
        name: 'Slack',
        description: 'Anruf-Zusammenfassungen ins Team-Channel',
        status: 'soon',
        fallback: '#',
        fallbackBg: '#4A154B',
      },
      {
        name: 'Microsoft Teams',
        description: 'Benachrichtigungen direkt in Teams',
        status: 'soon',
        fallback: 'T',
        fallbackBg: '#6264A7',
      },
    ],
  },
  {
    label: 'Buchhaltung & Finanzen',
    integrations: [
      {
        name: 'DATEV',
        description: 'Belege und Vorgänge automatisch übertragen',
        status: 'soon',
        Icon: SiDatev,
        iconColor: '#' + SiDatevHex,
      },
      {
        name: 'Lexware',
        description: 'Buchungen und Mietzahlungen synchronisieren',
        status: 'soon',
        fallback: 'L',
        fallbackBg: '#E30613',
      },
      {
        name: 'sevDesk',
        description: 'Rechnungen & Dokumente verwalten',
        status: 'soon',
        fallback: 'S',
        fallbackBg: '#2B9348',
      },
    ],
  },
  {
    label: 'Hausverwaltungs-Software',
    integrations: [
      { name: 'iX-Haus', description: 'Mieter, Objekte und Verträge synchronisieren', status: 'soon', fallback: 'iX', fallbackBg: '#1E40AF' },
      { name: 'objego', description: 'Eigentümerportal anbinden', status: 'soon', fallback: 'ob', fallbackBg: '#7C3AED' },
      { name: 'Aareon Wodis', description: 'Bestandsdaten und Tickets übertragen', status: 'soon', fallback: 'A', fallbackBg: '#0EA5E9' },
      { name: 'Domus Software', description: 'Stammdaten & Mieterverwaltung', status: 'soon', fallback: 'D', fallbackBg: '#059669' },
      { name: 'wohndata', description: 'Wohnungsdaten und Mieter importieren', status: 'soon', fallback: 'w', fallbackBg: '#D97706' },
      { name: 'Yardi Voyager', description: 'Enterprise-Lösung anbinden', status: 'soon', fallback: 'Y', fallbackBg: '#DC2626' },
    ],
  },
  {
    label: 'Dokumente & Speicher',
    integrations: [
      {
        name: 'Google Drive',
        description: 'Gesprächsprotokolle automatisch ablegen',
        status: 'soon',
        Icon: SiGoogledrive,
        iconColor: '#' + SiGoogledriveHex,
      },
      {
        name: 'Dropbox',
        description: 'Dokumente und Aufzeichnungen speichern',
        status: 'soon',
        Icon: SiDropbox,
        iconColor: '#' + SiDropboxHex,
      },
      {
        name: 'OneDrive',
        description: 'Microsoft Cloud-Speicher anbinden',
        status: 'soon',
        fallback: '☁',
        fallbackBg: '#0078D4',
      },
    ],
  },
  {
    label: 'Telefonie & KI',
    integrations: [
      {
        name: 'Telefon & KI-Assistentin',
        description: 'ImmoGreta nimmt Anrufe entgegen und erstellt Tickets',
        status: 'connected',
        fallback: '📞',
        fallbackBg: '#2563EB',
      },
      {
        name: 'Stimmenauswahl',
        description: 'Stimme der KI-Assistentin konfigurieren',
        status: 'soon',
        fallback: '🎙️',
        fallbackBg: '#7C3AED',
      },
    ],
  },
]

function IntegrationIcon({ integration }: { integration: Integration }) {
  if (integration.Icon) {
    return (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white border border-slate-200 shadow-sm">
        <integration.Icon color={integration.iconColor} size={22} />
      </div>
    )
  }
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold text-white select-none"
      style={{ background: integration.fallbackBg }}
    >
      {integration.fallback}
    </div>
  )
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const isConnected = integration.status === 'connected'
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <IntegrationIcon integration={integration} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{integration.name}</p>
          <p className="text-xs text-slate-500 mt-0.5 leading-snug">{integration.description}</p>
        </div>
      </div>
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium w-fit ${
        isConnected
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-slate-100 text-slate-500'
      }`}>
        {isConnected
          ? <><CheckCircle2 className="w-3 h-3" /> Verbunden</>
          : <><Clock className="w-3 h-3" /> Bald verfügbar</>
        }
      </span>
    </div>
  )
}

function CategorySection({ category, query }: { category: Category; query: string }) {
  const filtered = category.integrations.filter(
    i => i.name.toLowerCase().includes(query) || i.description.toLowerCase().includes(query)
  )
  const [open, setOpen] = useState(true)

  if (filtered.length === 0) return null

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between mb-4 group"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {category.label}
          </span>
          <span className="text-xs text-slate-300 font-medium">{filtered.length}</span>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          : <ChevronDown className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
        }
      </button>
      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(integration => (
            <IntegrationCard key={integration.name} integration={integration} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function IntegrationenPage() {
  const [search, setSearch] = useState('')
  const query = search.toLowerCase()

  return (
    <div className="max-w-4xl mx-auto px-1">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Integrationen</h1>
        <p className="text-slate-500 text-sm mt-1">Verbinden Sie ImmoGreta mit Ihren Tools und Systemen</p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Integration suchen..."
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
      </div>

      <div className="space-y-10">
        {CATEGORIES.map(cat => (
          <CategorySection key={cat.label} category={cat} query={query} />
        ))}
        {CATEGORIES.every(cat =>
          cat.integrations.every(i =>
            !i.name.toLowerCase().includes(query) && !i.description.toLowerCase().includes(query)
          )
        ) && (
          <div className="text-center py-16 text-slate-400 text-sm">
            Keine Integration gefunden für „{search}"
          </div>
        )}
      </div>
    </div>
  )
}
