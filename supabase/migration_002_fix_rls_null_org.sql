-- ============================================================
-- ImmoGreta – Fix RLS: Calls & Tickets ohne organization_id anzeigen
-- Führe dieses Script im Supabase SQL Editor aus.
-- ============================================================

-- Problem: Retell AI schreibt Calls/Tickets OHNE organization_id.
-- RLS-Policy filtert diese raus → User sieht keine Anrufe.

-- Fix: Erlaube auch Calls/Tickets wo organization_id NULL ist,
-- ODER wo organization_id = User's Organization.

-- Drop alte Policies
DROP POLICY IF EXISTS "Users see their org's calls" ON public.calls;
DROP POLICY IF EXISTS "Users see their org's tickets" ON public.tickets;

-- Neue Policies: org_id match ODER org_id ist NULL
CREATE POLICY "Users see their org's calls"
  ON public.calls FOR ALL
  USING (
    organization_id = my_organization_id()
    OR organization_id IS NULL
  );

CREATE POLICY "Users see their org's tickets"
  ON public.tickets FOR ALL
  USING (
    organization_id = my_organization_id()
    OR organization_id IS NULL
  );

-- Optional: Bestehende Calls deiner Org zuweisen (einmalig ausführen)
-- Ersetze 'DEINE_ORG_ID' mit deiner tatsächlichen organization_id:
-- UPDATE public.calls SET organization_id = 'DEINE_ORG_ID' WHERE organization_id IS NULL;
-- UPDATE public.tickets SET organization_id = 'DEINE_ORG_ID' WHERE organization_id IS NULL;
