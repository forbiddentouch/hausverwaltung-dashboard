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
}

export type Tenant = {
  id: string
  name: string
  phone_number: string | null
}
