'use client'

import { useState } from 'react'
import Image from 'next/image'
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
  // Option 1: simple-icons SVG component
  Icon?: ComponentType<{ color?: string; size?: number }>
  iconColor?: string
  // Option 2: logo via Clearbit (domain-based)
  logoDomain?: string
  // Option 3: styled initial fallback
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
      { name: 'Google Calendar', description: 'Termine automatisch aus Anrufen erstellen', status: 'soon', Icon: SiGooglecalendar, iconColor: '#' + SiGooglecalendarHex },
      { name: 'Outlook Kalender', description: 'Microsoft 365 Kalender synchronisieren', status: 'soon', logoDomain: 'microsoft.com' },
      { name: 'Calendly', description: 'Rückruf-Termine direkt buchbar machen', status: 'soon', Icon: SiCalendly, iconColor: '#' + SiCalendlyHex },
    ],
  },
  {
    label: 'Kommunikation',
    integrations: [
      { name: 'Gmail', description: 'E-Mail-Benachrichtigungen & Zusammenfassungen', status: 'soon', Icon: SiGmail, iconColor: '#' + SiGmailHex },
      { name: 'Outlook Mail', description: 'Automatische Mails nach jedem Anruf', status: 'soon', logoDomain: 'microsoft.com' },
      { name: 'WhatsApp Business', description: 'Mieter per WhatsApp benachrichtigen', status: 'soon', Icon: SiWhatsapp, iconColor: '#' + SiWhatsappHex },
      { name: 'Slack', description: 'Anruf-Zusammenfassungen ins Team-Channel', status: 'soon', logoDomain: 'slack.com' },
      { name: 'Microsoft Teams', description: 'Benachrichtigungen direkt in Teams', status: 'soon', logoDomain: 'microsoft.com' },
    ],
  },
  {
    label: 'Buchhaltung & Finanzen',
    integrations: [
      { name: 'DATEV', description: 'Belege und Vorgänge automatisch übertragen', status: 'soon', Icon: SiDatev, iconColor: '#' + SiDatevHex },
      { name: 'Lexware', description: 'Buchungen und Mietzahlungen synchronisieren', status: 'soon', logoDomain: 'lexware.de' },
      { name: 'sevDesk', description: 'Rechnungen & Dokumente verwalten', status: 'soon', logoDomain: 'sevdesk.de' },
    ],
  },
  {
    label: 'Hausverwaltungs-Software',
    integrations: [
      { name: 'iX-Haus', description: 'Mieter, Objekte und Verträge synchronisieren', status: 'soon', logoDomain: 'crem-solutions.de', fallback: 'iX', fallbackBg: '#1E40AF' },
      { name: 'objego', description: 'Eigentümerportal anbinden', status: 'soon', logoDomain: 'objego.de', fallback: 'ob', fallbackBg: '#7C3AED' },
      { name: 'Aareon Wodis', description: 'Bestandsdaten und Tickets übertragen', status: 'soon', logoDomain: 'aareon.com', fallback: 'A', fallbackBg: '#0EA5E9' },
      { name: 'Domus Software', description: 'Stammdaten & Mieterverwaltung', status: 'soon', logoDomain: 'domus.ag', fallback: 'D', fallbackBg: '#059669' },
      { name: 'wohndata', description: 'Wohnungsdaten und Mieter importieren', status: 'soon', logoDomain: 'wohndata.de', fallback: 'w', fallbackBg: '#D97706' },
      { name: 'Yardi Voyager', description: 'Enterprise-Lösung anbinden', status: 'soon', logoDomain: 'yardi.com', fallback: 'Y', fallbackBg: '#DC2626' },
    ],
  },
  {
    label: 'Dokumente & Speicher',
    integrations: [
      { name: 'Google Drive', description: 'Gesprächsprotokolle automatisch ablegen', status: 'soon', Icon: SiGoogledrive, iconColor: '#' + SiGoogledriveHex },
      { name: 'Dropbox', description: 'Dokumente und Aufzeichnungen speichern', status: 'soon', Icon: SiDropbox, iconColor: '#' + SiDropboxHex },
      { name: 'OneDrive', description: 'Microsoft Cloud-Speicher anbinden', status: 'soon', logoDomain: 'microsoft.com' },
    ],
  },
  {
    label: 'Telefonie & KI',
    integrations: [
      { name: 'Telefon & KI-Assistentin', description: 'ImmoGreta nimmt Anrufe entgegen und erstellt Tickets', status: 'connected', fallback: '📞', fallbackBg: '#2563EB' },
      { name: 'Stimmenauswahl', description: 'Stimme der KI-Assistentin konfigurieren', status: 'soon', fallback: '🎙️', fallbackBg: '#7C3AED' },
    ],
  },
]

function IntegrationIcon({ integration }: { integration: Integration }) {
  if (integration.Icon) {
    return (
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-white border border-slate-200 shadow-sm">
        <integration.Icon color={integration.iconColor} size={24} />
      </div>
    )
  }
  if (integration.logoDomain) {
    return (
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-white border border-slate-200 shadow-sm overflow-hidden">
        <Image
          src={`https://logo.clearbit.com/${integration.logoDomain}`}
          alt={integration.name}
          width={32}
          height={32}
          className="object-contain"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement
            target.style.display = 'none'
            const parent = target.parentElement
            if (parent && integration.fallback) {
              parent.style.background = integration.fallbackBg || '#64748b'
              parent.innerHTML = `<span style="color:white;font-size:13px;font-weight:700">${integration.fallback}</span>`
            }
          }}
        />
      </div>
    )
  }
  return (
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold text-white select-none"
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

  const hasResults = CATEGORIES.some(cat =>
    cat.integrations.some(i =>
      i.name.toLowerCase().includes(query) || i.description.toLowerCase().includes(query)
    )
  )

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
        {!hasResults && (
          <div className="text-center py-16 text-slate-400 text-sm">
            Keine Integration gefunden für „{search}"
          </div>
        )}
      </div>
    </div>
  )
}
