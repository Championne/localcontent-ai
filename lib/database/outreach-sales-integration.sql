-- Migration: Add sales CRM integration to outreach_leads
-- Run this AFTER the initial outreach-schema.sql

-- Add sales_lead_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'outreach_leads' AND column_name = 'sales_lead_id'
  ) THEN
    ALTER TABLE outreach_leads ADD COLUMN sales_lead_id UUID;
  END IF;
END $$;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_outreach_leads_sales_lead ON outreach_leads(sales_lead_id);

-- Update activity type constraint to include 'converted' and 'call_made'
-- First drop the existing constraint, then recreate
ALTER TABLE outreach_activities DROP CONSTRAINT IF EXISTS outreach_activities_type_check;
ALTER TABLE outreach_activities ADD CONSTRAINT outreach_activities_type_check 
  CHECK (type IN ('email_sent', 'email_opened', 'email_clicked', 'email_replied', 'email_bounced', 'status_changed', 'note_added', 'demo_scheduled', 'converted', 'call_made'));

-- Create view for easy querying of outreach + sales data
CREATE OR REPLACE VIEW outreach_with_sales AS
SELECT 
  o.*,
  l.id as linked_sales_id,
  l.status as sales_status,
  l.assigned_to as sales_assigned_to,
  l.priority as sales_priority
FROM outreach_leads o
LEFT JOIN leads l ON o.sales_lead_id = l.id OR o.contact_email = l.contact_email;

-- Grant access to the view
GRANT SELECT ON outreach_with_sales TO authenticated;
