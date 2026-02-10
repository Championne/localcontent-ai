-- INTEGRATIONS AND ANALYTICS SCHEMA
-- User-connected platforms (GMB, Meta, etc.) and baseline/metric history for Impact Analytics.
-- Integrations are per BUSINESS: each business has its own GMB, social accounts, etc.
-- Run after base tables exist. Uses auth.users and public.businesses (Supabase).

-- ============================================
-- USER INTEGRATIONS (OAuth tokens per platform, per business)
-- ============================================

CREATE TABLE IF NOT EXISTS user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  -- Platform: google_business, facebook, instagram, linkedin, etc.
  platform TEXT NOT NULL CHECK (platform IN (
    'google_business', 'google_search_console', 'google_analytics',
    'facebook', 'instagram', 'linkedin', 'nextdoor', 'yelp', 'tiktok', 'pinterest',
    'late_aggregator'
  )),

  -- OAuth tokens (store encrypted in production)
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,

  -- Platform-specific identifiers
  account_id TEXT,           -- e.g. GMB account ID, Meta page ID, or Late "profile/set" ID
  account_name TEXT,         -- Human-readable (e.g. "My Business")
  location_id TEXT,          -- GMB location ID
  metadata JSONB DEFAULT '{}', -- Extra: scopes, Late account IDs per network, etc.

  -- State
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, business_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_user_integrations_user ON user_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_integrations_business ON user_integrations(business_id);
CREATE INDEX IF NOT EXISTS idx_user_integrations_platform ON user_integrations(platform);

-- ============================================
-- BASELINE SNAPSHOTS (one row per metric per business at first connect)
-- ============================================

CREATE TABLE IF NOT EXISTS baseline_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  metric_type TEXT NOT NULL,   -- gmb_views, search_impressions, reviews, avg_rating, social_followers, etc.
  metric_value NUMERIC,
  metric_source TEXT,         -- google_business, search_console, facebook, etc.
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  is_baseline BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(business_id, metric_type)
);

CREATE INDEX IF NOT EXISTS idx_baseline_snapshots_user ON baseline_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_baseline_snapshots_business ON baseline_snapshots(business_id);

-- ============================================
-- METRIC HISTORY (time series per business for trend charts)
-- ============================================

CREATE TABLE IF NOT EXISTS metric_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  metric_type TEXT NOT NULL,
  metric_value NUMERIC,
  metric_source TEXT,
  recorded_date DATE NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(business_id, metric_type, recorded_date)
);

CREATE INDEX IF NOT EXISTS idx_metric_history_user_date ON metric_history(user_id, metric_type, recorded_date);
CREATE INDEX IF NOT EXISTS idx_metric_history_business_date ON metric_history(business_id, metric_type, recorded_date);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE baseline_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_history ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own rows
CREATE POLICY "Users manage own integrations"
  ON user_integrations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own baseline"
  ON baseline_snapshots FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own metric history"
  ON metric_history FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- GRANTS (Supabase: anon/authenticated/service_role)
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON user_integrations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON baseline_snapshots TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON metric_history TO authenticated;
