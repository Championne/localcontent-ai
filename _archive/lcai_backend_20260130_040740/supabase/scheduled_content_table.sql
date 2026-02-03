-- Scheduled Content Table for LocalContent.ai
-- Run this in Supabase SQL Editor

-- Create scheduled_content table
CREATE TABLE IF NOT EXISTS public.scheduled_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'published', 'failed')),
  metadata JSONB,
  error_message TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_content_user ON public.scheduled_content(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_status ON public.scheduled_content(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_due ON public.scheduled_content(scheduled_for) 
  WHERE status = 'pending';

-- Enable RLS
ALTER TABLE public.scheduled_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own scheduled content" ON public.scheduled_content
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled content" ON public.scheduled_content
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled content" ON public.scheduled_content
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled content" ON public.scheduled_content
  FOR DELETE USING (auth.uid() = user_id);

-- Create usage_logs table for analytics
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  content_type VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action ON public.usage_logs(action);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON public.usage_logs(created_at DESC);

-- Enable RLS for usage_logs
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage logs" ON public.usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage logs" ON public.usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
