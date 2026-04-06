import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Call = {
  id: string
  caller_number: string | null
  status: 'in_progress' | 'completed' | 'missed'
  started_at: string
  ended_at: string | null
  duration_sec: number | null
  transcript: string | null
  summary: string | null
  tenant_id: string
  organization_id?: string
}

export type Ticket = {
  id: string
  call_id: string | null
  kategorie: string
  prioritaet: 'hoch' | 'mittel' | 'niedrig'
  status: 'offen' | 'in_bearbeitung' | 'erledigt'
  beschreibung: string | null
  quelle: string
  erstellt_am: string
  mieter_id: string | null
  organization_id?: string
}

export type Tenant = {
  id: string
  name: string
  phone_number: string | null
  email: string | null
  telefon: string | null
  strasse: string | null
  hausnummer: string | null
  plz: string | null
  stadt: string | null
  notizen: string | null
  organization_id?: string
}

export type Mitarbeiter = {
  id: string
  vorname: string
  nachname: string
  email: string | null
  telefon: string | null
  themen: string[]
  erreichbar: boolean
  created_at: string
  organization_id?: string
}

export type KalenderTermin = {
  id: string
  name: string
  telefon: string | null
  datum: string
  uhrzeit: string
  typ: string
  notizen: string | null
  erledigt: boolean
  created_at: string
  organization_id?: string
}

export type Aufgabe = {
  id: string
  icon: string
  name: string
  description: string | null
  enabled: boolean
  color: string
  sort_order: number
  created_at: string
  organization_id?: string
}

let cachedOrgId: string | null = null

export async function getOrganizationId(): Promise<string | null> {
  if (cachedOrgId) return cachedOrgId

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  cachedOrgId = data?.organization_id ?? null
  return cachedOrgId
}

export function clearOrgIdCache() {
  cachedOrgId = null
}
