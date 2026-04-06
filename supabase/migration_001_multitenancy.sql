-- ============================================================
-- ImmoGreta – Multi-Tenancy Migration
-- Führe dieses Script im Supabase SQL Editor aus:
-- https://supabase.com/dashboard → SQL Editor → New Query
-- ============================================================

-- 1. ORGANIZATIONS TABLE
-- Jede Hausverwaltung bekommt eine eigene Organisation
CREATE TABLE IF NOT EXISTS public.organizations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text UNIQUE,                    -- z.B. "mueller-hausverwaltung"
  phone       text,                           -- Ihre ImmoGreta-Telefonnummer
  email       text,
  address     text,
  logo_url    text,
  plan        text DEFAULT 'starter',         -- starter / professional / enterprise
  created_at  timestamptz DEFAULT now()
);

-- 2. USER → ORGANIZATION mapping
-- Ein User kann Mitglied einer Organisation sein (später mehrere)
CREATE TABLE IF NOT EXISTS public.organization_members (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role            text DEFAULT 'admin',       -- admin / member / viewer
  created_at      timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- 3. Add organization_id to all existing tables
ALTER TABLE public.calls
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id),
  ADD COLUMN IF NOT EXISTS email           text,
  ADD COLUMN IF NOT EXISTS telefon         text,
  ADD COLUMN IF NOT EXISTS strasse         text,
  ADD COLUMN IF NOT EXISTS hausnummer      text,
  ADD COLUMN IF NOT EXISTS plz             text,
  ADD COLUMN IF NOT EXISTS stadt           text,
  ADD COLUMN IF NOT EXISTS notizen         text;

-- 4. New tables (replacing localStorage)

-- Mitarbeiter pro Organisation
CREATE TABLE IF NOT EXISTS public.mitarbeiter (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  vorname         text NOT NULL,
  nachname        text NOT NULL,
  email           text,
  telefon         text,
  themen          text[],
  erreichbar      boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

-- Kalender-Termine pro Organisation
CREATE TABLE IF NOT EXISTS public.kalender (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  name            text NOT NULL,
  telefon         text,
  datum           date NOT NULL,
  uhrzeit         time NOT NULL,
  typ             text DEFAULT 'Rückruf',     -- Rückruf / Termin / Besichtigung
  notizen         text,
  erledigt        boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

-- Aufgaben pro Organisation
CREATE TABLE IF NOT EXISTS public.aufgaben (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  icon            text DEFAULT '📋',
  name            text NOT NULL,
  description     text,
  enabled         boolean DEFAULT true,
  color           text DEFAULT 'gray',
  sort_order      int DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

-- 5. INDEXES (wichtig für Performance bei 2000+ Einheiten)
CREATE INDEX IF NOT EXISTS idx_calls_org ON public.calls(organization_id);
CREATE INDEX IF NOT EXISTS idx_calls_org_started ON public.calls(organization_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_org ON public.tickets(organization_id);
CREATE INDEX IF NOT EXISTS idx_tenants_org ON public.tenants(organization_id);
CREATE INDEX IF NOT EXISTS idx_mitarbeiter_org ON public.mitarbeiter(organization_id);
CREATE INDEX IF NOT EXISTS idx_kalender_org ON public.kalender(organization_id, datum);
CREATE INDEX IF NOT EXISTS idx_aufgaben_org ON public.aufgaben(organization_id);

-- 6. ROW LEVEL SECURITY – Jede Organisation sieht nur ihre Daten

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mitarbeiter ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kalender ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aufgaben ENABLE ROW LEVEL SECURITY;

-- Helper function: get organization_id for current user
CREATE OR REPLACE FUNCTION public.my_organization_id()
RETURNS uuid AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RLS Policies
CREATE POLICY "Users see their own organization"
  ON public.organizations FOR ALL
  USING (id = my_organization_id());

CREATE POLICY "Users see their membership"
  ON public.organization_members FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users see their org's calls"
  ON public.calls FOR ALL
  USING (organization_id = my_organization_id());

CREATE POLICY "Users see their org's tickets"
  ON public.tickets FOR ALL
  USING (organization_id = my_organization_id());

CREATE POLICY "Users see their org's tenants"
  ON public.tenants FOR ALL
  USING (organization_id = my_organization_id());

CREATE POLICY "Users see their org's mitarbeiter"
  ON public.mitarbeiter FOR ALL
  USING (organization_id = my_organization_id());

CREATE POLICY "Users see their org's kalender"
  ON public.kalender FOR ALL
  USING (organization_id = my_organization_id());

CREATE POLICY "Users see their org's aufgaben"
  ON public.aufgaben FOR ALL
  USING (organization_id = my_organization_id());

-- 7. TRANSCRIPT EMAIL FUNCTION
-- Diese Funktion kannst du mit einem Supabase Webhook/Edge Function triggern
-- wenn ein Anruf endet (status → 'completed')
-- Beispiel-Trigger-Konfiguration: Supabase → Database → Webhooks → calls table → UPDATE

-- ============================================================
-- FERTIG! Jetzt:
-- 1. Dieses SQL in Supabase SQL Editor ausführen
-- 2. In Supabase: Authentication → Email → Confirm email: optional deaktivieren
--    (damit Testaccounts sofort funktionieren)
-- 3. Ersten Account registrieren → Organization erstellen
-- ============================================================
