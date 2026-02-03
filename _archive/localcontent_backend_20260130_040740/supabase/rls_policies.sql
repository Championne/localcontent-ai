-- Row Level Security Policies for LocalContent.ai
-- Run this in Supabase SQL Editor

-- ============================================
-- PROFILES TABLE
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- BUSINESSES TABLE
-- ============================================
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Users can view their own businesses
CREATE POLICY "Users can view own businesses" ON public.businesses
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own businesses
CREATE POLICY "Users can insert own businesses" ON public.businesses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own businesses
CREATE POLICY "Users can update own businesses" ON public.businesses
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own businesses
CREATE POLICY "Users can delete own businesses" ON public.businesses
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role can insert/update subscriptions (via webhooks)
-- No INSERT/UPDATE policies for regular users

-- ============================================
-- CONTENT TABLE
-- ============================================
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Users can view their own content
CREATE POLICY "Users can view own content" ON public.content
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own content
CREATE POLICY "Users can insert own content" ON public.content
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own content
CREATE POLICY "Users can update own content" ON public.content
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own content
CREATE POLICY "Users can delete own content" ON public.content
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TEMPLATES TABLE
-- ============================================
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Anyone can view public templates
CREATE POLICY "Anyone can view public templates" ON public.templates
  FOR SELECT USING (is_public = true);

-- Users can view their own templates
CREATE POLICY "Users can view own templates" ON public.templates
  FOR SELECT USING (auth.uid() = created_by);

-- Users can insert their own templates
CREATE POLICY "Users can insert own templates" ON public.templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can update their own templates
CREATE POLICY "Users can update own templates" ON public.templates
  FOR UPDATE USING (auth.uid() = created_by);

-- Users can delete their own templates
CREATE POLICY "Users can delete own templates" ON public.templates
  FOR DELETE USING (auth.uid() = created_by);

-- ============================================
-- INTEGRATIONS TABLE
-- ============================================
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Users can view their own integrations
CREATE POLICY "Users can view own integrations" ON public.integrations
  FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own integrations
CREATE POLICY "Users can insert own integrations" ON public.integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations" ON public.integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations" ON public.integrations
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- BASELINE METRICS TABLE (for Impact Analytics)
-- ============================================
ALTER TABLE public.baseline_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own baseline metrics" ON public.baseline_snapshots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own baseline metrics" ON public.baseline_snapshots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- METRIC HISTORY TABLE
-- ============================================
ALTER TABLE public.metric_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own metric history" ON public.metric_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metric history" ON public.metric_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get user's current plan
CREATE OR REPLACE FUNCTION public.get_user_plan(user_uuid UUID)
RETURNS TEXT AS $$
  SELECT COALESCE(plan, 'free')
  FROM public.subscriptions
  WHERE user_id = user_uuid
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user can create more content (usage limits)
CREATE OR REPLACE FUNCTION public.can_create_content(user_uuid UUID, content_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan TEXT;
  content_count INTEGER;
  plan_limit INTEGER;
BEGIN
  -- Get user's plan
  SELECT COALESCE(plan, 'free') INTO user_plan
  FROM public.subscriptions
  WHERE user_id = user_uuid;

  -- Count content created this month
  SELECT COUNT(*) INTO content_count
  FROM public.content
  WHERE user_id = user_uuid
    AND content_type = content_type
    AND created_at >= date_trunc('month', CURRENT_DATE);

  -- Get limit based on plan
  CASE user_plan
    WHEN 'starter' THEN
      CASE content_type
        WHEN 'blog' THEN plan_limit := 25;
        WHEN 'social' THEN plan_limit := 75;
        WHEN 'gmb' THEN plan_limit := 15;
        ELSE plan_limit := 10;
      END CASE;
    WHEN 'growth' THEN
      CASE content_type
        WHEN 'blog' THEN plan_limit := 50;
        WHEN 'social' THEN plan_limit := 150;
        WHEN 'gmb' THEN plan_limit := 25;
        ELSE plan_limit := 25;
      END CASE;
    WHEN 'pro' THEN
      plan_limit := -1; -- unlimited
    ELSE
      plan_limit := 5; -- free tier
  END CASE;

  -- Check limit
  IF plan_limit = -1 THEN
    RETURN TRUE;
  ELSE
    RETURN content_count < plan_limit;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_content_user_id ON public.content(user_id);
CREATE INDEX IF NOT EXISTS idx_content_created_at ON public.content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_type ON public.content(content_type);
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON public.businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_integrations_user_platform ON public.integrations(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_metric_history_user_date ON public.metric_history(user_id, recorded_date DESC);
