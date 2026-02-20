-- PROSPECT PIPELINE TABLES
-- Extends the outreach system with enrichment, scoring, insights, and email generation
-- Used by the autonomous sales pipeline (Python VPS)

-- ============================================
-- EXTEND OUTREACH_LEADS FOR PIPELINE
-- ============================================

ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS owner_email TEXT;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS owner_phone TEXT;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS zip TEXT;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS category TEXT;

ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS yelp_url TEXT;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS tiktok_url TEXT;

ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS geospark_score INTEGER DEFAULT 0;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS score_tier TEXT;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS score_breakdown JSONB DEFAULT '{}';

ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS prospect_source TEXT DEFAULT 'outscraper'
  CHECK (prospect_source IN ('outscraper', 'fresh_source', 'engagement', 'manual', 'csv_import'));
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS prospect_source_detail TEXT;

ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS enrichment_status TEXT DEFAULT 'pending'
  CHECK (enrichment_status IN ('pending', 'in_progress', 'completed', 'failed', 'skipped'));
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS last_enriched_at TIMESTAMPTZ;

ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS email_confidence TEXT;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS email_source TEXT;

ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS pipeline_status TEXT DEFAULT 'scraped'
  CHECK (pipeline_status IN ('scraped', 'enriched', 'scored', 'insights_generated', 'emails_generated', 'uploaded_to_instantly', 'sending', 'completed'));

CREATE INDEX IF NOT EXISTS idx_outreach_leads_geospark_score ON outreach_leads(geospark_score DESC);
CREATE INDEX IF NOT EXISTS idx_outreach_leads_score_tier ON outreach_leads(score_tier);
CREATE INDEX IF NOT EXISTS idx_outreach_leads_pipeline_status ON outreach_leads(pipeline_status);
CREATE INDEX IF NOT EXISTS idx_outreach_leads_enrichment ON outreach_leads(enrichment_status);
CREATE INDEX IF NOT EXISTS idx_outreach_leads_prospect_source ON outreach_leads(prospect_source);

-- ============================================
-- PROSPECT SOCIAL PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS prospect_social_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES outreach_leads(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'tiktok', 'yelp', 'google_business')),
  username TEXT,
  profile_url TEXT,

  followers INTEGER,
  following INTEGER,
  posts_count INTEGER,

  engagement_rate DECIMAL(6,3),
  posts_last_30_days INTEGER,
  last_post_date TIMESTAMPTZ,
  posting_frequency DECIMAL(6,2),

  bio TEXT,
  is_business_account BOOLEAN,
  is_private BOOLEAN DEFAULT FALSE,

  content_breakdown JSONB DEFAULT '{}',
  tools_detected JSONB DEFAULT '[]',
  raw_data JSONB DEFAULT '{}',

  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_profiles_lead ON prospect_social_profiles(lead_id);
CREATE INDEX IF NOT EXISTS idx_social_profiles_platform ON prospect_social_profiles(platform);
CREATE UNIQUE INDEX IF NOT EXISTS idx_social_profiles_unique ON prospect_social_profiles(lead_id, platform);

-- ============================================
-- PROSPECT POSTS (individual social posts)
-- ============================================
CREATE TABLE IF NOT EXISTS prospect_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  social_profile_id UUID NOT NULL REFERENCES prospect_social_profiles(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES outreach_leads(id) ON DELETE CASCADE,

  post_url TEXT,
  post_date TIMESTAMPTZ,
  caption TEXT,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  views INTEGER,
  engagement_rate DECIMAL(6,3),
  post_type TEXT CHECK (post_type IN ('photo', 'video', 'carousel', 'reel', 'story', 'text', 'other')),

  content_classification JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prospect_posts_profile ON prospect_posts(social_profile_id);
CREATE INDEX IF NOT EXISTS idx_prospect_posts_lead ON prospect_posts(lead_id);
CREATE INDEX IF NOT EXISTS idx_prospect_posts_date ON prospect_posts(post_date DESC);

-- ============================================
-- PROSPECT REVIEWS
-- ============================================
CREATE TABLE IF NOT EXISTS prospect_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES outreach_leads(id) ON DELETE CASCADE,
  platform TEXT DEFAULT 'google' CHECK (platform IN ('google', 'yelp', 'facebook')),

  author_name TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  review_date TIMESTAMPTZ,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  keywords JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prospect_reviews_lead ON prospect_reviews(lead_id);
CREATE INDEX IF NOT EXISTS idx_prospect_reviews_platform ON prospect_reviews(platform);

-- ============================================
-- PROSPECT COMPETITORS
-- ============================================
CREATE TABLE IF NOT EXISTS prospect_competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES outreach_leads(id) ON DELETE CASCADE,

  competitor_name TEXT NOT NULL,
  competitor_instagram TEXT,
  competitor_website TEXT,
  competitor_data JSONB DEFAULT '{}',

  follower_gap INTEGER,
  posting_gap DECIMAL(6,2),
  engagement_gap DECIMAL(6,3),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prospect_competitors_lead ON prospect_competitors(lead_id);

-- ============================================
-- PROSPECT MARKETING INSIGHTS (AI-generated)
-- ============================================
CREATE TABLE IF NOT EXISTS prospect_marketing_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES outreach_leads(id) ON DELETE CASCADE,

  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'posting_pattern', 'engagement_analysis', 'competitor_gap',
    'review_social_gap', 'content_quality', 'platform_gap',
    'tool_usage', 'growth_opportunity', 'audience_mismatch', 'other'
  )),
  insight_title TEXT NOT NULL,
  insight_description TEXT NOT NULL,
  priority_score INTEGER CHECK (priority_score BETWEEN 1 AND 10),
  supporting_data JSONB DEFAULT '{}',

  used_in_email BOOLEAN DEFAULT FALSE,
  email_position INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_insights_lead ON prospect_marketing_insights(lead_id);
CREATE INDEX IF NOT EXISTS idx_marketing_insights_type ON prospect_marketing_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_marketing_insights_priority ON prospect_marketing_insights(priority_score DESC);

-- ============================================
-- PROSPECT EMAIL SEQUENCES (AI-generated personalized emails)
-- ============================================
CREATE TABLE IF NOT EXISTS prospect_email_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES outreach_leads(id) ON DELETE CASCADE,

  email_number INTEGER NOT NULL CHECK (email_number BETWEEN 1 AND 4),
  send_delay_days INTEGER NOT NULL DEFAULT 0,
  subject_line TEXT NOT NULL,
  email_body TEXT NOT NULL,

  personalization_pct DECIMAL(5,2),
  data_points_used JSONB DEFAULT '[]',
  data_points_count INTEGER DEFAULT 0,
  word_count INTEGER,

  insight_type_used TEXT,
  subject_pattern_used TEXT,
  cta_style_used TEXT,

  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  opened BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMPTZ,
  replied BOOLEAN DEFAULT FALSE,
  replied_at TIMESTAMPTZ,
  reply_sentiment TEXT CHECK (reply_sentiment IN ('positive', 'neutral', 'negative')),

  ab_variant TEXT DEFAULT 'a' CHECK (ab_variant IN ('a', 'b')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_sequences_lead ON prospect_email_sequences(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_sequences_email_num ON prospect_email_sequences(email_number);
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_sequences_unique ON prospect_email_sequences(lead_id, email_number, ab_variant);

-- ============================================
-- PIPELINE LEARNINGS
-- ============================================
CREATE TABLE IF NOT EXISTS pipeline_learnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  learning_type TEXT NOT NULL CHECK (learning_type IN (
    'subject_pattern', 'cta_style', 'insight_priority',
    'word_count', 'personalization', 'source_allocation',
    'scoring_threshold', 'timing', 'general'
  )),
  parameter_name TEXT NOT NULL,
  current_value JSONB NOT NULL,
  previous_value JSONB,
  confidence DECIMAL(5,2) CHECK (confidence BETWEEN 0 AND 100),
  sample_size INTEGER DEFAULT 0,
  status TEXT DEFAULT 'observed' CHECK (status IN ('observed', 'recommended', 'applied', 'reverted')),
  evidence JSONB DEFAULT '{}',

  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learnings_type ON pipeline_learnings(learning_type);
CREATE INDEX IF NOT EXISTS idx_learnings_status ON pipeline_learnings(status);

-- ============================================
-- PIPELINE RUNS (execution log)
-- ============================================
CREATE TABLE IF NOT EXISTS pipeline_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  run_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'partial')),

  prospects_scraped INTEGER DEFAULT 0,
  prospects_enriched INTEGER DEFAULT 0,
  prospects_scored INTEGER DEFAULT 0,
  insights_generated INTEGER DEFAULT 0,
  emails_generated INTEGER DEFAULT 0,
  uploaded_to_instantly INTEGER DEFAULT 0,

  errors JSONB DEFAULT '[]',
  duration_seconds INTEGER,

  config_snapshot JSONB DEFAULT '{}',

  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_pipeline_runs_date ON pipeline_runs(run_date DESC);

-- ============================================
-- RLS POLICIES (service role bypasses RLS, but add for safety)
-- ============================================
ALTER TABLE prospect_social_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_marketing_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_learnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;

-- Service role access (pipeline uses service role key)
CREATE POLICY "Service role full access" ON prospect_social_profiles FOR ALL USING (true);
CREATE POLICY "Service role full access" ON prospect_posts FOR ALL USING (true);
CREATE POLICY "Service role full access" ON prospect_reviews FOR ALL USING (true);
CREATE POLICY "Service role full access" ON prospect_competitors FOR ALL USING (true);
CREATE POLICY "Service role full access" ON prospect_marketing_insights FOR ALL USING (true);
CREATE POLICY "Service role full access" ON prospect_email_sequences FOR ALL USING (true);
CREATE POLICY "Service role full access" ON pipeline_learnings FOR ALL USING (true);
CREATE POLICY "Service role full access" ON pipeline_runs FOR ALL USING (true);

-- Authenticated users can read pipeline data (for dashboard)
CREATE POLICY "Authenticated read access" ON prospect_social_profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read access" ON prospect_posts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read access" ON prospect_reviews FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read access" ON prospect_competitors FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read access" ON prospect_marketing_insights FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read access" ON prospect_email_sequences FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read access" ON pipeline_learnings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated read access" ON pipeline_runs FOR SELECT USING (auth.role() = 'authenticated');
