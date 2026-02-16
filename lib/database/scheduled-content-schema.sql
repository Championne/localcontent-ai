-- SCHEDULED CONTENT TABLE
-- Tracks per-platform scheduled posts with status, error handling, and retry support.
-- Run after base tables exist (content, user_integrations).

CREATE TABLE IF NOT EXISTS scheduled_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content(id) ON DELETE SET NULL,

  -- What to publish
  platform TEXT NOT NULL CHECK (platform IN (
    'gmb', 'facebook', 'instagram', 'linkedin', 'twitter',
    'tiktok', 'youtube', 'threads', 'reddit', 'pinterest', 'bluesky'
  )),
  post_text TEXT NOT NULL,
  media_url TEXT,
  platform_options JSONB DEFAULT '{}',

  -- When
  scheduled_for TIMESTAMPTZ NOT NULL,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'published', 'failed', 'cancelled'
  )),
  error_message TEXT,
  retry_count INT DEFAULT 0,

  -- After publishing
  published_at TIMESTAMPTZ,
  platform_post_id TEXT,
  platform_post_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_content_user ON scheduled_content(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_status_time ON scheduled_content(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_business ON scheduled_content(business_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_content ON scheduled_content(content_id);

-- RLS
ALTER TABLE scheduled_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own scheduled content"
  ON scheduled_content FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON scheduled_content TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON scheduled_content TO service_role;
