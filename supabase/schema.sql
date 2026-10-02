-- Run this ONCE in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ─────────────────────────────────────────────────────────────────────────────

-- Users table
CREATE TABLE IF NOT EXISTS public.nexus_users (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_code     text        UNIQUE,
  name          text        NOT NULL,
  email         text        UNIQUE NOT NULL,
  age           integer,
  profession    text,
  referral_code text,
  -- GPS / location
  lat           double precision,
  lng           double precision,
  accuracy_m    double precision,
  city          text,
  region        text,
  country       text,
  country_code  text,
  suburb        text,
  postal_code   text,
  geo_source    text,
  registered_at timestamptz DEFAULT now()
);

-- Referral codes table
CREATE TABLE IF NOT EXISTS public.nexus_referral_codes (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  code        text        UNIQUE NOT NULL,
  status      text        DEFAULT 'available',
  tags        text[]      DEFAULT '{}',
  redeemed_by text,
  redeemed_at timestamptz,
  created_at  timestamptz DEFAULT now()
);

-- Quota (single row, id = 1)
CREATE TABLE IF NOT EXISTS public.nexus_quota (
  id               integer PRIMARY KEY DEFAULT 1,
  total_quota      integer DEFAULT 1000,
  manual_remaining integer
);

-- Seed quota row
INSERT INTO public.nexus_quota (id, total_quota) VALUES (1, 1000)
ON CONFLICT (id) DO NOTHING;

-- Seed initial referral codes
INSERT INTO public.nexus_referral_codes (code, status, tags) VALUES
  ('ARCH-2026-ALPHA',   'available', ARRAY['VIP', 'CAD']),
  ('NEXUS-BIM-101',     'available', ARRAY['Revit']),
  ('NEXUS-CAD-202',     'available', ARRAY['AutoCAD']),
  ('NEXUS-AI-303',      'available', ARRAY['AI Prompt']),
  ('NEXUS-STUDIO-404',  'available', ARRAY['Studio']),
  ('NEXUS-GEO-505',     'available', ARRAY['Expansion']),
  ('REVIT-DYN-606',     'available', ARRAY['Dynamo']),
  ('PARAM-GEN-707',     'available', ARRAY['Parametric']),
  ('NEXUS-PIONEER-808', 'available', ARRAY['Pioneer']),
  ('GLOBAL-1000-FREE',  'available', ARRAY['General'])
ON CONFLICT (code) DO NOTHING;

-- ─── Row Level Security ────────────────────────────────────────────────────────
-- We manage our own auth, so anon role gets full access to these tables.

ALTER TABLE public.nexus_users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nexus_referral_codes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nexus_quota           ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_nexus_users"  ON public.nexus_users;
DROP POLICY IF EXISTS "allow_all_nexus_codes"  ON public.nexus_referral_codes;
DROP POLICY IF EXISTS "allow_all_nexus_quota"  ON public.nexus_quota;

CREATE POLICY "allow_all_nexus_users"  ON public.nexus_users          FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_nexus_codes"  ON public.nexus_referral_codes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_nexus_quota"  ON public.nexus_quota          FOR ALL TO anon USING (true) WITH CHECK (true);
