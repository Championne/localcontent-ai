-- Fix: "Could not find the 'brand_accent_color' column" (and other branding columns)
-- Run this once in Supabase Dashboard → SQL Editor → New query → paste → Run

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS brand_primary_color TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS brand_secondary_color TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS brand_accent_color TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS default_cta_primary TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS default_cta_secondary TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS seo_keywords TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS default_tone TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS social_handles TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS service_areas TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS short_about TEXT;
