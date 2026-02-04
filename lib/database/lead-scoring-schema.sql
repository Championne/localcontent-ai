-- LEAD SCORING SYSTEM
-- Adds scoring capabilities to outreach_leads and creates priority queue

-- ============================================
-- ADD SCORING FIELDS TO OUTREACH_LEADS
-- ============================================

-- Core score
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS score_updated_at TIMESTAMPTZ;

-- Engagement tracking (for Instantly sync)
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS emails_sent INTEGER DEFAULT 0;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS emails_opened INTEGER DEFAULT 0;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS emails_clicked INTEGER DEFAULT 0;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS emails_replied INTEGER DEFAULT 0;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS last_email_sent_at TIMESTAMPTZ;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS last_email_opened_at TIMESTAMPTZ;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS last_email_replied_at TIMESTAMPTZ;

-- Status flags
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS bounced BOOLEAN DEFAULT FALSE;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS unsubscribed BOOLEAN DEFAULT FALSE;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ;

-- Instantly integration
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS instantly_campaign_id TEXT;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS instantly_lead_status TEXT;

-- Business quality signals (for enrichment)
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS google_rating DECIMAL(2,1);
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS google_reviews_count INTEGER;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS google_place_id TEXT;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS has_website BOOLEAN;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS website_has_ssl BOOLEAN;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS has_social_media BOOLEAN;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS years_in_business INTEGER;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS employee_count_estimate INTEGER;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS is_hiring BOOLEAN DEFAULT FALSE;

-- Call tracking
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS calls_made INTEGER DEFAULT 0;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS calls_connected INTEGER DEFAULT 0;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS last_call_at TIMESTAMPTZ;
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS last_call_outcome TEXT;

-- Industry
ALTER TABLE outreach_leads ADD COLUMN IF NOT EXISTS industry_id UUID REFERENCES industries(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_outreach_leads_score ON outreach_leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_outreach_leads_industry ON outreach_leads(industry_id);
CREATE INDEX IF NOT EXISTS idx_outreach_leads_instantly ON outreach_leads(instantly_campaign_id);
CREATE INDEX IF NOT EXISTS idx_outreach_leads_status_score ON outreach_leads(status, score DESC);

-- ============================================
-- SCORE CALCULATION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION calculate_lead_score(lead_row outreach_leads)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  days_since_contact INTEGER;
  emails_no_reply INTEGER;
BEGIN
  -- === ENGAGEMENT SIGNALS ===
  
  -- Email engagement
  score := score + (COALESCE(lead_row.emails_opened, 0) * 5);
  
  -- Bonus for multiple opens (re-reading = interest)
  IF COALESCE(lead_row.emails_opened, 0) > 2 THEN
    score := score + 10;
  END IF;
  
  -- Clicks are high intent
  score := score + (COALESCE(lead_row.emails_clicked, 0) * 15);
  
  -- Replies are gold
  score := score + (COALESCE(lead_row.emails_replied, 0) * 50);
  
  -- Call engagement
  score := score + (COALESCE(lead_row.calls_connected, 0) * 40);
  
  -- === BUSINESS QUALITY SIGNALS ===
  
  -- Google rating (lower = needs more help)
  IF lead_row.google_rating IS NOT NULL THEN
    IF lead_row.google_rating < 3.5 THEN
      score := score + 25;  -- They really need help
    ELSIF lead_row.google_rating < 4.5 THEN
      score := score + 10;
    ELSE
      score := score + 5;
    END IF;
  END IF;
  
  -- Review count (fewer = needs help)
  IF lead_row.google_reviews_count IS NOT NULL THEN
    IF lead_row.google_reviews_count < 10 THEN
      score := score + 20;
    ELSIF lead_row.google_reviews_count < 50 THEN
      score := score + 10;
    END IF;
  END IF;
  
  -- No website = big opportunity
  IF lead_row.has_website = FALSE THEN
    score := score + 15;
  END IF;
  
  -- No social media = content opportunity
  IF lead_row.has_social_media = FALSE THEN
    score := score + 20;
  END IF;
  
  -- Hiring = growing business with budget
  IF lead_row.is_hiring = TRUE THEN
    score := score + 15;
  END IF;
  
  -- Newer business = needs visibility
  IF lead_row.years_in_business IS NOT NULL AND lead_row.years_in_business < 2 THEN
    score := score + 10;
  END IF;
  
  -- === DECAY SIGNALS ===
  
  -- Time since last contact
  IF lead_row.last_email_sent_at IS NOT NULL THEN
    days_since_contact := EXTRACT(DAY FROM (NOW() - lead_row.last_email_sent_at));
    IF days_since_contact > 30 THEN
      score := score - 20;
    ELSIF days_since_contact > 7 THEN
      score := score - 5;
    END IF;
  END IF;
  
  -- Emails sent without reply
  emails_no_reply := COALESCE(lead_row.emails_sent, 0) - COALESCE(lead_row.emails_replied, 0);
  IF emails_no_reply >= 5 THEN
    score := score - 25;
  ELSIF emails_no_reply >= 3 THEN
    score := score - 10;
  END IF;
  
  -- === NEGATIVE SIGNALS ===
  
  IF lead_row.bounced = TRUE THEN
    score := score - 50;
  END IF;
  
  IF lead_row.unsubscribed = TRUE THEN
    score := -100;  -- Dead lead
  END IF;
  
  -- Status-based adjustments
  IF lead_row.status = 'replied' THEN
    score := score + 30;  -- Hot!
  ELSIF lead_row.status = 'interested' THEN
    score := score + 50;
  ELSIF lead_row.status = 'demo_scheduled' THEN
    score := score + 100;
  ELSIF lead_row.status = 'not_interested' THEN
    score := -100;
  END IF;
  
  -- Floor at -100
  RETURN GREATEST(score, -100);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER TO AUTO-UPDATE SCORES
-- ============================================

CREATE OR REPLACE FUNCTION update_lead_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.score := calculate_lead_score(NEW);
  NEW.score_updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_lead_score ON outreach_leads;
CREATE TRIGGER trigger_update_lead_score
  BEFORE INSERT OR UPDATE ON outreach_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_score();

-- ============================================
-- INCREMENT SCORE FUNCTION (for webhooks)
-- ============================================

CREATE OR REPLACE FUNCTION increment_score(lead_id UUID, points INTEGER)
RETURNS INTEGER AS $$
DECLARE
  new_score INTEGER;
BEGIN
  UPDATE outreach_leads
  SET score = GREATEST(score + points, -100),
      score_updated_at = NOW()
  WHERE id = lead_id
  RETURNING score INTO new_score;
  
  RETURN new_score;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PRIORITY QUEUE VIEW
-- ============================================

CREATE OR REPLACE VIEW outreach_priority_queue AS
SELECT 
  ol.*,
  i.name as industry_name,
  i.icon as industry_icon,
  CASE 
    WHEN ol.score >= 75 THEN 'hot'
    WHEN ol.score >= 50 THEN 'warm'
    WHEN ol.score >= 25 THEN 'warming'
    ELSE 'cold'
  END as temperature,
  CASE 
    WHEN ol.score >= 75 THEN '🔥'
    WHEN ol.score >= 50 THEN '🟠'
    WHEN ol.score >= 25 THEN '🟡'
    ELSE '🔵'
  END as temperature_emoji,
  CASE
    WHEN ol.last_email_replied_at IS NOT NULL THEN 'call_now'
    WHEN ol.score >= 75 THEN 'call_today'
    WHEN ol.score >= 50 AND ol.emails_sent < 3 THEN 'send_email'
    WHEN ol.score >= 50 THEN 'call_soon'
    WHEN ol.emails_sent = 0 THEN 'start_sequence'
    ELSE 'continue_sequence'
  END as recommended_action
FROM outreach_leads ol
LEFT JOIN industries i ON ol.industry_id = i.id
WHERE ol.status NOT IN ('converted', 'not_interested', 'unsubscribed')
  AND ol.bounced = FALSE
  AND ol.unsubscribed = FALSE
ORDER BY ol.score DESC, ol.last_email_replied_at DESC NULLS LAST;

-- Grant access
GRANT SELECT ON outreach_priority_queue TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_lead_score(outreach_leads) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_score(UUID, INTEGER) TO authenticated;

-- ============================================
-- BATCH RECALCULATE ALL SCORES
-- ============================================

CREATE OR REPLACE FUNCTION recalculate_all_scores()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE outreach_leads
  SET score = calculate_lead_score(outreach_leads.*),
      score_updated_at = NOW();
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;
