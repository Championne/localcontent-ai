-- UNIFIED SALES SYSTEM SCHEMA
-- Merges cold email outreach with call-based sales CRM
-- Adds industry segmentation and multi-channel tracking

-- ============================================
-- INDUSTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS industries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- emoji or icon name
  color TEXT, -- hex color for UI
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  
  -- Industry-specific settings
  typical_deal_value DECIMAL(10,2),
  typical_sales_cycle_days INTEGER,
  
  -- Stats (updated periodically)
  total_leads INTEGER DEFAULT 0,
  total_converted INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed common industries
INSERT INTO industries (name, slug, icon, color, sort_order) VALUES
  ('HVAC', 'hvac', '❄️', '#3B82F6', 1),
  ('Plumbing', 'plumbing', '🔧', '#10B981', 2),
  ('Electrical', 'electrical', '⚡', '#F59E0B', 3),
  ('Roofing', 'roofing', '🏠', '#6366F1', 4),
  ('Landscaping', 'landscaping', '🌿', '#22C55E', 5),
  ('Pest Control', 'pest-control', '🐜', '#EF4444', 6),
  ('Cleaning Services', 'cleaning', '🧹', '#8B5CF6', 7),
  ('Auto Repair', 'auto-repair', '🚗', '#EC4899', 8),
  ('Dental', 'dental', '🦷', '#06B6D4', 9),
  ('Real Estate', 'real-estate', '🏡', '#F97316', 10),
  ('Legal Services', 'legal', '⚖️', '#64748B', 11),
  ('Restaurants', 'restaurants', '🍽️', '#DC2626', 12),
  ('Fitness', 'fitness', '💪', '#7C3AED', 13),
  ('Salon & Spa', 'salon-spa', '💇', '#DB2777', 14),
  ('Other', 'other', '📦', '#6B7280', 99)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- ENHANCED LEADS TABLE (Unified)
-- ============================================
-- Add industry_id to existing leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS industry_id UUID REFERENCES industries(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS outreach_lead_id UUID; -- Link to original outreach lead

-- Add channel tracking columns
ALTER TABLE leads ADD COLUMN IF NOT EXISTS channel_source TEXT DEFAULT 'manual' 
  CHECK (channel_source IN ('manual', 'cold_email', 'cold_call', 'inbound_call', 'website', 'referral', 'linkedin', 'facebook', 'google_ads'));

-- Email tracking on leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS emails_sent INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS emails_opened INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS emails_replied INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_email_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_email_opened_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_email_replied_at TIMESTAMPTZ;

-- Call tracking on leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS calls_made INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS calls_connected INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS voicemails_left INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_call_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_call_outcome TEXT;

-- Journey tracking
ALTER TABLE leads ADD COLUMN IF NOT EXISTS first_touch_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS first_touch_channel TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS qualified_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS demo_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS days_to_convert INTEGER;

-- Google Business data
ALTER TABLE leads ADD COLUMN IF NOT EXISTS google_rating DECIMAL(2,1);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS google_reviews_count INTEGER;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- Create index for industry filtering
CREATE INDEX IF NOT EXISTS idx_leads_industry ON leads(industry_id);
CREATE INDEX IF NOT EXISTS idx_leads_channel_source ON leads(channel_source);

-- ============================================
-- TOUCHPOINTS TABLE (All interactions)
-- ============================================
CREATE TABLE IF NOT EXISTS lead_touchpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  
  -- Who did this
  salesperson_id UUID REFERENCES sales_team(id),
  
  -- What channel
  channel TEXT NOT NULL CHECK (channel IN ('email', 'call', 'sms', 'linkedin', 'meeting', 'demo', 'other')),
  
  -- Type of touchpoint
  type TEXT NOT NULL CHECK (type IN (
    -- Email types
    'email_sent', 'email_opened', 'email_clicked', 'email_replied', 'email_bounced',
    -- Call types
    'call_outbound', 'call_inbound', 'call_connected', 'call_voicemail', 'call_no_answer', 'call_busy',
    -- Meeting types
    'meeting_scheduled', 'meeting_completed', 'meeting_cancelled', 'meeting_no_show',
    -- Demo types
    'demo_scheduled', 'demo_completed', 'demo_cancelled',
    -- Other
    'note_added', 'status_changed', 'assigned', 'sms_sent', 'linkedin_message'
  )),
  
  -- Details
  subject TEXT, -- email subject or call purpose
  content TEXT, -- email body, call notes, etc.
  duration_seconds INTEGER, -- for calls
  outcome TEXT, -- call outcome, meeting result, etc.
  
  -- External references
  external_id TEXT, -- Instantly email ID, Twilio call SID, etc.
  campaign_id UUID, -- Link to outreach campaign if applicable
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_touchpoints_lead ON lead_touchpoints(lead_id);
CREATE INDEX IF NOT EXISTS idx_touchpoints_channel ON lead_touchpoints(channel);
CREATE INDEX IF NOT EXISTS idx_touchpoints_created ON lead_touchpoints(created_at DESC);

-- ============================================
-- SEQUENCES TABLE (Multi-channel sequences)
-- ============================================
CREATE TABLE IF NOT EXISTS sales_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  name TEXT NOT NULL,
  description TEXT,
  industry_id UUID REFERENCES industries(id), -- Can be industry-specific
  
  -- Sequence type
  type TEXT DEFAULT 'mixed' CHECK (type IN ('email_only', 'call_only', 'mixed')),
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  
  -- Stats
  enrolled_count INTEGER DEFAULT 0,
  completed_count INTEGER DEFAULT 0,
  converted_count INTEGER DEFAULT 0,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SEQUENCE STEPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sequence_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sequence_id UUID NOT NULL REFERENCES sales_sequences(id) ON DELETE CASCADE,
  
  step_number INTEGER NOT NULL,
  
  -- Step type
  channel TEXT NOT NULL CHECK (channel IN ('email', 'call', 'linkedin', 'sms', 'task')),
  
  -- Timing
  delay_days INTEGER DEFAULT 0, -- Days after previous step
  delay_hours INTEGER DEFAULT 0, -- Additional hours
  preferred_time TEXT DEFAULT '09:00', -- Preferred time of day
  preferred_days TEXT[] DEFAULT ARRAY['mon','tue','wed','thu','fri'], -- Preferred days
  
  -- Content (for emails)
  subject TEXT,
  body TEXT,
  
  -- Instructions (for calls/tasks)
  instructions TEXT,
  
  -- Conditions
  skip_if_replied BOOLEAN DEFAULT TRUE,
  skip_if_called BOOLEAN DEFAULT FALSE,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sequence_steps_sequence ON sequence_steps(sequence_id, step_number);

-- ============================================
-- LEAD SEQUENCE ENROLLMENT
-- ============================================
CREATE TABLE IF NOT EXISTS lead_sequence_enrollment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  sequence_id UUID NOT NULL REFERENCES sales_sequences(id) ON DELETE CASCADE,
  
  -- Progress
  current_step INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'converted', 'unsubscribed', 'bounced')),
  
  -- Timing
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  next_step_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Stats
  emails_sent INTEGER DEFAULT 0,
  calls_made INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(lead_id, sequence_id)
);

-- ============================================
-- VIEWS FOR DASHBOARD
-- ============================================

-- Industry performance view
CREATE OR REPLACE VIEW industry_performance AS
SELECT 
  i.id,
  i.name,
  i.slug,
  i.icon,
  i.color,
  COUNT(l.id) as total_leads,
  COUNT(CASE WHEN l.status = 'new' THEN 1 END) as new_leads,
  COUNT(CASE WHEN l.status IN ('qualified', 'demo_scheduled', 'demo_completed', 'proposal_sent', 'negotiation') THEN 1 END) as active_leads,
  COUNT(CASE WHEN l.status = 'won' THEN 1 END) as won_leads,
  COUNT(CASE WHEN l.status = 'lost' THEN 1 END) as lost_leads,
  ROUND(COUNT(CASE WHEN l.status = 'won' THEN 1 END)::DECIMAL / NULLIF(COUNT(l.id), 0) * 100, 1) as conversion_rate,
  SUM(l.emails_sent) as total_emails_sent,
  SUM(l.calls_made) as total_calls_made,
  AVG(l.days_to_convert) as avg_days_to_convert
FROM industries i
LEFT JOIN leads l ON l.industry_id = i.id
WHERE i.is_active = TRUE
GROUP BY i.id, i.name, i.slug, i.icon, i.color
ORDER BY i.sort_order;

-- Channel performance view
CREATE OR REPLACE VIEW channel_performance AS
SELECT 
  channel_source,
  COUNT(*) as total_leads,
  COUNT(CASE WHEN status = 'won' THEN 1 END) as converted,
  ROUND(COUNT(CASE WHEN status = 'won' THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0) * 100, 1) as conversion_rate,
  AVG(days_to_convert) as avg_days_to_convert
FROM leads
WHERE channel_source IS NOT NULL
GROUP BY channel_source
ORDER BY total_leads DESC;

-- Lead journey view
CREATE OR REPLACE VIEW lead_journey AS
SELECT 
  l.id,
  l.company_name,
  l.contact_name,
  l.contact_email,
  l.status,
  l.industry_id,
  i.name as industry_name,
  i.icon as industry_icon,
  l.channel_source,
  l.first_touch_at,
  l.first_touch_channel,
  l.emails_sent,
  l.emails_opened,
  l.emails_replied,
  l.calls_made,
  l.calls_connected,
  l.last_email_at,
  l.last_call_at,
  GREATEST(l.last_email_at, l.last_call_at) as last_touch_at,
  l.qualified_at,
  l.demo_at,
  l.converted_at,
  l.days_to_convert,
  l.created_at
FROM leads l
LEFT JOIN industries i ON l.industry_id = i.id;

-- Grant access
GRANT SELECT ON industry_performance TO authenticated;
GRANT SELECT ON channel_performance TO authenticated;
GRANT SELECT ON lead_journey TO authenticated;
