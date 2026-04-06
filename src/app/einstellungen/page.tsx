'use client'

import { useState, useEffect } from 'react'
import { Phone, Mail, Shield, Zap, Clock, Palette, Upload, X, Check, Database } from 'lucide-react'

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  connected: boolean
  permanent?: boolean
  details?: { label: string; value: string }[]
}

function Section({ title, description, children }: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        <p className="text-sm text-slate-400 mt-0.5">{description}</p>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-medium text-slate-700 ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  )
}

function StatusChip({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-slate-400'}`} />
      {active ? 'Aktiv' : 'Inaktiv'}
    </span>
  )
}

const BRAND_COLORS = [
  { name: 'Blau', value: '#2563eb' },
  { name: 'Grün', value: '#059669' },
  { name: 'Violett', value: '#7c3aed' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Rosa', value: '#db2777' },
  { name: 'Cyan', value: '#06b6d4' },
]

export default function EinstellungenPage() {
  const [selectedColor, setSelectedColor] = useState('#2563eb')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [logoUploadKey, setLogoUploadKey] = useState(0)

  useEffect(() => {
    // Load saved brand color and logo from localStorage
    const savedColor = localStorage.getItem('immogreta_brand_color')
    const savedLogo = localStorage.getItem('immogreta_logo')

    if (savedColor) setSelectedColor(savedColor)
    if (savedLogo) setLogoPreview(savedLogo)
  }, [])

  useEffect(() => {
    // Set CSS variable for brand color
    document.documentElement.style.setProperty('--brand-color', selectedColor)
  }, [selectedColor])

  function handleColorChange(color: string) {
    setSelectedColor(color)
    localStorage.setItem('immogreta_brand_color', color)
    // Update CSS variable immediately so sidebar reflects change without reload
    document.documentElement.style.setProperty('--brand', color)
    window.dispatchEvent(new Event('immogreta_brand_updated'))
    showFeedback('Markenfarbe gespeichert ✓')
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setLogoPreview(base64)
      localStorage.setItem('immogreta_logo', base64)
      showFeedback('Logo erfolgreich hochgeladen')
    }
    reader.readAsDataURL(file)
  }

  function handleRemoveLogo() {
    setLogoPreview(null)
    localStorage.removeItem('immogreta_logo')
    setLogoUploadKey(prev => prev + 1)
    showFeedback('Logo entfernt')
  }

  function showFeedback(msg: string) {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 2500)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Feedback Toast */}
      {feedback && (
        <div className="fixed top-4 right-4 flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg shadow-lg text-sm font-medium z-50">
          <Check className="w-4 h-4" />
          {feedback}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Einstellungen</h1>
        <p className="text-slate-500 text-sm mt-1">Konfiguration von ImmoGreta und dem System</p>
      </div>

      {/* Branding & Design Section */}
      <Section
        title="Markendesign"
        description="Passen Sie Farbe und Logo nach Ihren Wünschen an"
      >
        <div className="space-y-6">
          {/* Color Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-4">
              Markenfarbe
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {BRAND_COLORS.map(color => (
                <button
                  key={color.value}
                  onClick={() => handleColorChange(color.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
                    selectedColor === color.value
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full border border-slate-300"
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="text-sm font-medium text-slate-700">{color.name}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Diese Farbe wird in der Seitenleiste, Buttons und Highlights verwendet.
            </p>
          </div>

          {/* Logo Upload */}
          <div className="border-t border-slate-100 pt-6">
            <label className="block text-sm font-semibold text-slate-800 mb-4">
              Logo-Upload
            </label>
            <div className="flex items-start gap-4">
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="w-16 h-16 rounded-lg border border-slate-200 object-cover"
                  />
                  <button
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                  <Upload className="w-6 h-6 text-slate-400" />
                </div>
              )}
              <div className="flex-1">
                <label className="block">
                  <input
                    key={logoUploadKey}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <span className="inline-block px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
                    Logo wählen
                  </span>
                </label>
                <p className="text-xs text-slate-500 mt-2">
                  Empfohlene Größe: 100x100px oder größer. Formate: PNG, JPG, SVG
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Lisa Status */}
      <Section
        title="Lisa KI-Assistentin"
        description="Status und Erreichbarkeit der KI-Assistentin"
      >
        <div className="flex items-center gap-4 mb-6 p-4 bg-green-50 rounded-xl">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
              L
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-800">Lisa ist aktiv</p>
            <p className="text-sm text-slate-500">Nimmt Anrufe entgegen und erstellt automatisch Tickets</p>
          </div>
          <StatusChip active={true} />
        </div>

        <InfoRow label="Telefonnummer" value="+1 (662) 439-4944" mono />
        <InfoRow label="Verfügbarkeit" value="24/7 – Immer erreichbar" />
        <InfoRow label="Sprache" value="Deutsch" />
      </Section>

      {/* Webhook */}
      <Section
        title="Webhook & Integration"
        description="Verbindung zwischen Retell AI und diesem System"
      >
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium text-green-700">Webhook aktiv</span>
        </div>
        <InfoRow
          label="Webhook URL"
          value="hausverwaltung-platform.onrender.com/webhook/retell"
          mono
        />
        <InfoRow label="Hosting" value="Render.com" />
        <InfoRow label="Trigger" value="call_ended, call_analyzed" />
      </Section>

      {/* Integrationen */}
      <Section
        title="Integrationen"
        description="Verbundene Dienste und Datenquellen"
      >
        {[
          {
            id: 'datenbank',
            name: 'Datenbank',
            description: 'Sichere, zentral verwaltete Datenbank – fest integriert und immer aktiv',
            icon: <Database className="w-5 h-5 text-blue-500" />,
            connected: true,
            permanent: true,
            details: [
              { label: 'Anbieter', value: 'Supabase' },
              { label: 'Region', value: 'eu-west-1 (Frankfurt)' },
              { label: 'Tabellen', value: 'calls, tickets, tenants' },
            ],
          },
        ].map((integration) => (
          <div key={integration.id} className="mb-6 last:mb-0 p-4 bg-slate-50 rounded-xl">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {integration.icon}
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">{integration.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{integration.description}</p>
                </div>
              </div>
              <div>
                {integration.permanent ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Fest integriert
                  </span>
                ) : integration.connected ? (
                  <button className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    Trennen
                  </button>
                ) : (
                  <button className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    Verbinden
                  </button>
                )}
              </div>
            </div>
            {integration.details && (
              <div className="space-y-2 mt-3 pt-3 border-t border-slate-200">
                {integration.details.map((detail) => (
                  <div key={detail.label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{detail.label}</span>
                    <span className="text-xs font-medium text-slate-700">{detail.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </Section>

      {/* E-Mail */}
      <Section
        title="E-Mail Benachrichtigungen"
        description="Automatische Benachrichtigungen bei neuen Tickets"
      >
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-4 h-4 text-slate-300" />
          <span className="text-sm font-medium text-slate-400">Noch nicht konfiguriert</span>
        </div>
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
          <p className="text-sm text-amber-700 font-medium mb-1">E-Mail noch nicht eingerichtet</p>
          <p className="text-xs text-amber-600">
            Konfigurieren Sie E-Mail-Benachrichtigungen unter Integrationen, um bei neuen Anrufen und Tickets benachrichtigt zu werden.
          </p>
        </div>
      </Section>
    </div>
  )
}
