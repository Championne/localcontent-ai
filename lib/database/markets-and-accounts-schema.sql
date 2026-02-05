-- MARKETS AND EMAIL ACCOUNTS SCHEMA
-- Multi-language, multi-market support with account capacity tracking

-- ============================================
-- MARKETS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS markets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identity
  name TEXT NOT NULL,                    -- "USA (English)"
  code TEXT NOT NULL UNIQUE,             -- "us-en"
  
  -- Language & Location
  language TEXT NOT NULL,                -- "en", "nl", "es", "de", "fr"
  countries TEXT[] NOT NULL,             -- ["US"], ["NL", "BE"], etc.
  timezone TEXT NOT NULL,                -- "America/New_York"
  currency TEXT DEFAULT 'USD',           -- "USD", "EUR"
  
  -- Settings\
  is_active BOOLEAN DEFAULT TRUE,
  send_start_hour INTEGER DEFAULT 8,     -- Start sending at 8am local
  send_end_hour INTEGER DEFAULT 17,      -- Stop sending at 5pm local
  send_days TEXT[] DEFAULT ARRAY['mon','tue','wed','thu','fri'],
  
  -- Stats (updated periodically)
  total_leads INTEGER DEFAULT 0,
  total_agents INTEGER DEFAULT 0,
  total_accounts INTEGER DEFAULT 0,
  daily_capacity INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial markets
INSERT INTO markets (name, code, language, countries, timezone, currency) VALUES
  ('USA (English)', 'us-en', 'en', ARRAY['US'], 'America/New_York', 'USD'),
  ('United Kingdom', 'uk-en', 'en', ARRAY['GB'], 'Europe/London', 'GBP'),
  ('Canada (English)', 'ca-en', 'en', ARRAY['CA'], 'America/Toronto', 'CAD'),
  ('Netherlands', 'nl-nl', 'nl', ARRAY['NL'], 'Europe/Amsterdam', 'EUR'),
  ('Belgium (Dutch)', 'be-nl', 'nl', ARRAY['BE'], 'Europe/Brussels', 'EUR'),
  ('Germany', 'de-de', 'de', ARRAY['DE'], 'Europe/Berlin', 'EUR'),
  ('Austria', 'at-de', 'de', ARRAY['AT'], 'Europe/Vienna', 'EUR'),
  ('Switzerland (German)', 'ch-de', 'de', ARRAY['CH'], 'Europe/Zurich', 'CHF'),
  ('Switzerland (Italian)', 'ch-it', 'it', ARRAY['CH'], 'Europe/Zurich', 'CHF'),
  ('France', 'fr-fr', 'fr', ARRAY['FR'], 'Europe/Paris', 'EUR'),
  ('Belgium (French)', 'be-fr', 'fr', ARRAY['BE'], 'Europe/Brussels', 'EUR'),
  ('Spain', 'es-es', 'es', ARRAY['ES'], 'Europe/Madrid', 'EUR'),
  ('Mexico', 'mx-es', 'es', ARRAY['MX'], 'America/Mexico_City', 'MXN'),
  ('Italy', 'it-it', 'it', ARRAY['IT'], 'Europe/Rome', 'EUR'),
  ('Russia', 'ru-ru', 'ru', ARRAY['RU'], 'Europe/Moscow', 'RUB'),
  ('Australia', 'au-en', 'en', ARRAY['AU'], 'Australia/Sydney', 'AUD')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- SALES TEAM / AGENTS TABLE (Enhanced)
-- ============================================

-- Add columns to existing sales_team table
ALTER TABLE sales_team ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'agent' 
  CHECK (role IN ('admin', 'agent', 'partner'));
ALTER TABLE sales_team ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['en'];
ALTER TABLE sales_team ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
  CHECK (status IN ('active', 'inactive', 'pending'));
ALTER TABLE sales_team ADD COLUMN IF NOT EXISTS partner_company TEXT;
ALTER TABLE sales_team ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2);
ALTER TABLE sales_team ADD COLUMN IF NOT EXISTS notes TEXT;

-- Agent-Market assignment (many-to-many)
CREATE TABLE IF NOT EXISTS agent_markets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES sales_team(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, market_id)
);

-- ============================================
-- EMAIL ACCOUNTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS email_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identity
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,                     -- "Gert Jan"
  domain TEXT NOT NULL,                  -- "localgrowthpro.co"
  
  -- Ownership
  agent_id UUID REFERENCES sales_team(id),
  market_id UUID REFERENCES markets(id),
  
  -- Provider connection
  provider TEXT DEFAULT 'zoho',          -- "zoho", "google", "microsoft"
  instantly_connected BOOLEAN DEFAULT FALSE,
  instantly_account_id TEXT,
  
  -- Maturity & Limits
  status TEXT DEFAULT 'warmup' CHECK (status IN ('warmup', 'limited', 'ramping', 'active', 'paused', 'suspended')),
  warmup_started_at TIMESTAMPTZ,
  days_since_warmup INTEGER DEFAULT 0,  -- Set by trigger (cannot use GENERATED: NOW() is not immutable)
  
  -- Daily limits based on maturity
  base_daily_limit INTEGER DEFAULT 50,   -- Max when fully mature
  current_daily_limit INTEGER DEFAULT 0, -- Calculated based on maturity
  
  -- Today's stats (reset daily)
  sent_today INTEGER DEFAULT 0,
  opened_today INTEGER DEFAULT 0,
  replied_today INTEGER DEFAULT 0,
  bounced_today INTEGER DEFAULT 0,
  last_sent_at TIMESTAMPTZ,
  stats_reset_at DATE DEFAULT CURRENT_DATE,
  
  -- Health metrics
  warmup_score INTEGER,                  -- From Instantly (0-100)
  deliverability_score INTEGER,          -- Calculated
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  spam_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Flags
  is_active BOOLEAN DEFAULT TRUE,
  is_warmup_enabled BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_email_accounts_agent ON email_accounts(agent_id);
CREATE INDEX IF NOT EXISTS idx_email_accounts_market ON email_accounts(market_id);
CREATE INDEX IF NOT EXISTS idx_email_accounts_status ON email_accounts(status);

-- ============================================
-- EMAIL ACCOUNT DAILY STATS (Historical)
-- ============================================

CREATE TABLE IF NOT EXISTS email_account_daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  sent INTEGER DEFAULT 0,
  delivered INTEGER DEFAULT 0,
  opened INTEGER DEFAULT 0,
  clicked INTEGER DEFAULT 0,
  replied INTEGER DEFAULT 0,
  bounced INTEGER DEFAULT 0,
  unsubscribed INTEGER DEFAULT 0,
  spam_reported INTEGER DEFAULT 0,
  
  daily_limit INTEGER,                   -- What the limit was that day
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, date)
);

-- ============================================
-- FUNCTION: Calculate Account Daily Limit
-- ============================================

CREATE OR REPLACE FUNCTION calculate_account_daily_limit(account email_accounts)
RETURNS INTEGER AS $$
DECLARE
  days INTEGER;
  limit_value INTEGER;
BEGIN
  -- Get days since warmup started
  days := COALESCE(
    EXTRACT(DAY FROM (NOW() - account.warmup_started_at))::INTEGER,
    0
  );
  
  -- Calculate limit based on maturity phase
  IF days < 14 THEN
    -- Phase 1: WARMUP - No cold sending allowed
    limit_value := 0;
  ELSIF days < 21 THEN
    -- Phase 2: LIMITED - 15/day max
    limit_value := LEAST(15, account.base_daily_limit);
  ELSIF days < 35 THEN
    -- Phase 3: RAMPING - 30/day max
    limit_value := LEAST(30, account.base_daily_limit);
  ELSE
    -- Phase 4: ACTIVE - Full capacity
    limit_value := account.base_daily_limit;
  END IF;
  
  -- Reduce limit if health issues
  IF account.bounce_rate > 5 THEN
    limit_value := limit_value * 0.5; -- 50% reduction
  ELSIF account.bounce_rate > 3 THEN
    limit_value := limit_value * 0.75; -- 25% reduction
  END IF;
  
  RETURN limit_value::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Get Account Status
-- ============================================

CREATE OR REPLACE FUNCTION get_account_status(account email_accounts)
RETURNS TEXT AS $$
DECLARE
  days INTEGER;
BEGIN
  IF account.is_active = FALSE THEN
    RETURN 'paused';
  END IF;
  
  IF account.bounce_rate > 10 OR account.spam_rate > 5 THEN
    RETURN 'suspended';
  END IF;
  
  days := COALESCE(
    EXTRACT(DAY FROM (NOW() - account.warmup_started_at))::INTEGER,
    0
  );
  
  IF days < 14 THEN
    RETURN 'warmup';
  ELSIF days < 21 THEN
    RETURN 'limited';
  ELSIF days < 35 THEN
    RETURN 'ramping';
  ELSE
    RETURN 'active';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Update Account Limits Daily
-- ============================================

CREATE OR REPLACE FUNCTION update_account_limits()
RETURNS TRIGGER AS $$
BEGIN
  -- Reset daily stats if new day
  IF NEW.stats_reset_at < CURRENT_DATE THEN
    NEW.sent_today := 0;
    NEW.opened_today := 0;
    NEW.replied_today := 0;
    NEW.bounced_today := 0;
    NEW.stats_reset_at := CURRENT_DATE;
  END IF;
  
  -- Recompute days since warmup (used for maturity phase)
  NEW.days_since_warmup := COALESCE(EXTRACT(DAY FROM (NOW() - NEW.warmup_started_at))::INTEGER, 0);
  
  -- Update status and limits
  NEW.status := get_account_status(NEW);
  NEW.current_daily_limit := calculate_account_daily_limit(NEW);
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_account_limits ON email_accounts;
CREATE TRIGGER trigger_update_account_limits
  BEFORE INSERT OR UPDATE ON email_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_account_limits();

-- ============================================
-- EMAIL TEMPLATES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identity
  name TEXT NOT NULL,
  description TEXT,
  
  -- Targeting
  market_id UUID REFERENCES markets(id),  -- NULL = all markets
  industry_id UUID REFERENCES industries(id), -- NULL = all industries
  language TEXT NOT NULL DEFAULT 'en',
  
  -- Content
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  
  -- Type
  type TEXT DEFAULT 'cold_email' CHECK (type IN (
    'cold_email', 'follow_up', 'breakup', 'reply', 'meeting_request', 'proposal'
  )),
  
  -- Sequence position (if part of sequence)
  sequence_id UUID,
  step_number INTEGER,
  delay_days INTEGER DEFAULT 0,
  
  -- Stats
  times_used INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_replied INTEGER DEFAULT 0,
  open_rate DECIMAL(5,2),
  reply_rate DECIMAL(5,2),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_market ON email_templates(market_id);
CREATE INDEX IF NOT EXISTS idx_templates_language ON email_templates(language);
CREATE INDEX IF NOT EXISTS idx_templates_industry ON email_templates(industry_id);

-- ============================================
-- UPDATE OUTREACH LEADS TABLE
-- ============================================

-- Add market reference to outreach_leads
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS market_id UUID REFERENCES markets(id);
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS country TEXT;

-- Create index
CREATE INDEX IF NOT EXISTS idx_outreach_leads_market ON outreach_leads(market_id);
CREATE INDEX IF NOT EXISTS idx_outreach_leads_country ON outreach_leads(country);

-- ============================================
-- VIEWS
-- ============================================

-- Account capacity view
CREATE OR REPLACE VIEW email_account_capacity AS
SELECT 
  ea.id,
  ea.email,
  ea.domain,
  ea.agent_id,
  st.name as agent_name,
  ea.market_id,
  m.name as market_name,
  m.code as market_code,
  ea.status,
  ea.days_since_warmup,
  ea.current_daily_limit,
  ea.sent_today,
  (ea.current_daily_limit - ea.sent_today) as remaining_today,
  ea.warmup_score,
  ea.bounce_rate,
  ea.is_active,
  CASE 
    WHEN ea.status = 'warmup' THEN '🔴'
    WHEN ea.status = 'limited' THEN '🟡'
    WHEN ea.status = 'ramping' THEN '🟠'
    WHEN ea.status = 'active' THEN '🟢'
    WHEN ea.status = 'paused' THEN '⏸️'
    ELSE '❌'
  END as status_emoji
FROM email_accounts ea
LEFT JOIN sales_team st ON ea.agent_id = st.id
LEFT JOIN markets m ON ea.market_id = m.id
WHERE ea.is_active = TRUE
ORDER BY ea.status, ea.current_daily_limit DESC;

-- Market capacity view
CREATE OR REPLACE VIEW market_capacity AS
SELECT 
  m.id,
  m.name,
  m.code,
  m.language,
  m.countries,
  m.timezone,
  COUNT(DISTINCT ea.id) as total_accounts,
  COUNT(DISTINCT ea.id) FILTER (WHERE ea.status = 'active') as active_accounts,
  COUNT(DISTINCT ea.id) FILTER (WHERE ea.status IN ('warmup', 'limited', 'ramping')) as warming_accounts,
  SUM(ea.current_daily_limit) as total_daily_capacity,
  SUM(ea.sent_today) as total_sent_today,
  SUM(ea.current_daily_limit - ea.sent_today) as total_remaining_today,
  COUNT(DISTINCT am.agent_id) as total_agents,
  COUNT(DISTINCT ol.id) as total_leads
FROM markets m
LEFT JOIN email_accounts ea ON ea.market_id = m.id AND ea.is_active = TRUE
LEFT JOIN agent_markets am ON am.market_id = m.id
LEFT JOIN outreach_leads ol ON ol.market_id = m.id
WHERE m.is_active = TRUE
GROUP BY m.id, m.name, m.code, m.language, m.countries, m.timezone
ORDER BY m.name;

-- Grant access
GRANT SELECT ON email_account_capacity TO authenticated;
GRANT SELECT ON market_capacity TO authenticated;

-- ============================================
-- FUNCTION: Get Available Capacity
-- ============================================

CREATE OR REPLACE FUNCTION get_available_capacity(
  p_market_id UUID DEFAULT NULL,
  p_agent_id UUID DEFAULT NULL
)
RETURNS TABLE (
  total_accounts INTEGER,
  active_accounts INTEGER,
  total_capacity INTEGER,
  used_today INTEGER,
  remaining_today INTEGER,
  accounts JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_accounts,
    COUNT(*) FILTER (WHERE status IN ('limited', 'ramping', 'active'))::INTEGER as active_accounts,
    COALESCE(SUM(current_daily_limit), 0)::INTEGER as total_capacity,
    COALESCE(SUM(sent_today), 0)::INTEGER as used_today,
    COALESCE(SUM(current_daily_limit - sent_today), 0)::INTEGER as remaining_today,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', id,
          'email', email,
          'status', status,
          'limit', current_daily_limit,
          'sent', sent_today,
          'remaining', current_daily_limit - sent_today
        )
      ) FILTER (WHERE is_active = TRUE),
      '[]'::jsonb
    ) as accounts
  FROM email_accounts
  WHERE is_active = TRUE
    AND (p_market_id IS NULL OR market_id = p_market_id)
    AND (p_agent_id IS NULL OR agent_id = p_agent_id);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Distribute Leads Across Accounts
-- ============================================

CREATE OR REPLACE FUNCTION distribute_leads_to_accounts(
  p_lead_count INTEGER,
  p_market_id UUID DEFAULT NULL,
  p_agent_id UUID DEFAULT NULL
)
RETURNS TABLE (
  account_id UUID,
  account_email TEXT,
  leads_to_assign INTEGER
) AS $$
DECLARE
  total_remaining INTEGER;
  leads_left INTEGER;
  account_record RECORD;
BEGIN
  leads_left := p_lead_count;
  
  -- Get accounts sorted by remaining capacity
  FOR account_record IN 
    SELECT 
      ea.id,
      ea.email,
      (ea.current_daily_limit - ea.sent_today) as remaining
    FROM email_accounts ea
    WHERE ea.is_active = TRUE
      AND ea.status IN ('limited', 'ramping', 'active')
      AND (p_market_id IS NULL OR ea.market_id = p_market_id)
      AND (p_agent_id IS NULL OR ea.agent_id = p_agent_id)
      AND (ea.current_daily_limit - ea.sent_today) > 0
    ORDER BY (ea.current_daily_limit - ea.sent_today) DESC
  LOOP
    IF leads_left <= 0 THEN
      EXIT;
    END IF;
    
    account_id := account_record.id;
    account_email := account_record.email;
    leads_to_assign := LEAST(leads_left, account_record.remaining);
    leads_left := leads_left - leads_to_assign;
    
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
