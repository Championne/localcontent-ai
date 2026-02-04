-- Outreach CRM Schema for GeoSpark
-- Run this in Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Outreach Leads Table
CREATE TABLE IF NOT EXISTS outreach_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Business info
  business_name TEXT NOT NULL,
  industry TEXT DEFAULT 'HVAC',
  website TEXT,
  
  -- Contact info
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_title TEXT,
  
  -- Location
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'USA',
  
  -- Google Business data
  google_rating DECIMAL(2,1),
  google_reviews_count INTEGER,
  google_maps_url TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'replied', 'interested', 'demo_scheduled', 'converted', 'not_interested', 'bounced', 'unsubscribed')),
  
  -- Campaign tracking
  campaign_id UUID,
  last_contacted_at TIMESTAMPTZ,
  last_replied_at TIMESTAMPTZ,
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  
  -- Link to sales CRM
  sales_lead_id UUID, -- Links to leads table when converted
  
  -- Source tracking
  source TEXT DEFAULT 'manual', -- manual, csv_import, apollo, outscraper, google_maps
  source_details JSONB,
  
  -- Notes
  notes TEXT,
  tags TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Owner (for multi-user support)
  created_by UUID REFERENCES auth.users(id)
);

-- Outreach Campaigns Table
CREATE TABLE IF NOT EXISTS outreach_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Campaign type
  type TEXT DEFAULT 'cold_email' CHECK (type IN ('cold_email', 'follow_up', 'nurture', 'reactivation')),
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  
  -- Target audience
  target_industry TEXT DEFAULT 'HVAC',
  target_location TEXT,
  
  -- Stats
  total_leads INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_replied INTEGER DEFAULT 0,
  leads_converted INTEGER DEFAULT 0,
  
  -- Settings
  settings JSONB DEFAULT '{}',
  
  -- External integration
  instantly_campaign_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  created_by UUID REFERENCES auth.users(id)
);

-- Campaign Emails (Sequence Steps)
CREATE TABLE IF NOT EXISTS outreach_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES outreach_campaigns(id) ON DELETE CASCADE,
  
  -- Sequence position
  step_number INTEGER NOT NULL DEFAULT 1,
  
  -- Email content
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  
  -- Timing
  delay_days INTEGER DEFAULT 0, -- Days after previous email
  send_time TEXT DEFAULT '09:00', -- Preferred send time
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Stats
  times_sent INTEGER DEFAULT 0,
  times_opened INTEGER DEFAULT 0,
  times_replied INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Outreach Activities (Activity Log)
CREATE TABLE IF NOT EXISTS outreach_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  lead_id UUID REFERENCES outreach_leads(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES outreach_campaigns(id) ON DELETE SET NULL,
  email_id UUID REFERENCES outreach_emails(id) ON DELETE SET NULL,
  
  -- Activity type
  type TEXT NOT NULL CHECK (type IN ('email_sent', 'email_opened', 'email_clicked', 'email_replied', 'email_bounced', 'status_changed', 'note_added', 'demo_scheduled', 'converted', 'call_made')),
  
  -- Activity details
  details JSONB,
  
  -- External tracking
  external_id TEXT, -- Instantly message ID, etc.
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_outreach_leads_status ON outreach_leads(status);
CREATE INDEX IF NOT EXISTS idx_outreach_leads_campaign ON outreach_leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_outreach_leads_email ON outreach_leads(contact_email);
CREATE INDEX IF NOT EXISTS idx_outreach_leads_created ON outreach_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_outreach_campaigns_status ON outreach_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_outreach_activities_lead ON outreach_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_outreach_activities_type ON outreach_activities(type);

-- Row Level Security
ALTER TABLE outreach_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_activities ENABLE ROW LEVEL SECURITY;

-- Policies (adjust based on your auth setup)
CREATE POLICY "Users can view their own leads" ON outreach_leads
  FOR SELECT USING (auth.uid() = created_by OR created_by IS NULL);

CREATE POLICY "Users can insert leads" ON outreach_leads
  FOR INSERT WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

CREATE POLICY "Users can update their own leads" ON outreach_leads
  FOR UPDATE USING (auth.uid() = created_by OR created_by IS NULL);

CREATE POLICY "Users can delete their own leads" ON outreach_leads
  FOR DELETE USING (auth.uid() = created_by OR created_by IS NULL);

-- Same for campaigns
CREATE POLICY "Users can view their own campaigns" ON outreach_campaigns
  FOR SELECT USING (auth.uid() = created_by OR created_by IS NULL);

CREATE POLICY "Users can insert campaigns" ON outreach_campaigns
  FOR INSERT WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

CREATE POLICY "Users can update their own campaigns" ON outreach_campaigns
  FOR UPDATE USING (auth.uid() = created_by OR created_by IS NULL);

CREATE POLICY "Users can delete their own campaigns" ON outreach_campaigns
  FOR DELETE USING (auth.uid() = created_by OR created_by IS NULL);

-- Emails inherit campaign access
CREATE POLICY "Users can manage campaign emails" ON outreach_emails
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM outreach_campaigns 
      WHERE id = outreach_emails.campaign_id 
      AND (created_by = auth.uid() OR created_by IS NULL)
    )
  );

-- Activities inherit lead access
CREATE POLICY "Users can view lead activities" ON outreach_activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM outreach_leads 
      WHERE id = outreach_activities.lead_id 
      AND (created_by = auth.uid() OR created_by IS NULL)
    )
  );

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger
CREATE TRIGGER update_outreach_leads_updated_at
  BEFORE UPDATE ON outreach_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outreach_campaigns_updated_at
  BEFORE UPDATE ON outreach_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outreach_emails_updated_at
  BEFORE UPDATE ON outreach_emails
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
