-- LocalContent.ai Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE
-- Stores user profile information
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profile automatically when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- BUSINESSES TABLE
-- Stores business information for content generation
-- =============================================
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry TEXT,
  description TEXT,
  location TEXT,
  website TEXT,
  phone TEXT,
  gmb_place_id TEXT,
  gmb_connected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_businesses_user_id ON businesses(user_id);

-- =============================================
-- SUBSCRIPTIONS TABLE
-- Stores subscription/plan information
-- =============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'free', -- 'free', 'starter', 'growth', 'pro'
  status TEXT DEFAULT 'active', -- 'active', 'canceled', 'past_due'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  content_limit INTEGER DEFAULT 5,
  content_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- Create default subscription when profile is created
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, content_limit)
  VALUES (NEW.id, 'free', 5);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_profile();

-- =============================================
-- CONTENT TABLE
-- Stores generated content
-- =============================================
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  template TEXT NOT NULL, -- 'blog-post', 'social-post', 'gmb-post', 'email'
  title TEXT,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft', -- 'draft', 'published', 'scheduled', 'archived'
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_user_id ON content(user_id);
CREATE INDEX idx_content_business_id ON content(business_id);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_template ON content(template);

-- =============================================
-- TEMPLATES TABLE
-- Stores custom templates
-- =============================================
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL means system template
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'blog', 'social', 'gmb', 'email'
  industry TEXT, -- NULL means all industries
  prompt_template TEXT NOT NULL,
  variables JSONB DEFAULT '[]', -- Array of variable definitions
  is_public BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_user_id ON templates(user_id);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_industry ON templates(industry);

-- =============================================
-- ANALYTICS TABLE
-- Stores analytics/metrics data
-- =============================================
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- 'gmb_views', 'search_impressions', 'content_published'
  metric_value NUMERIC,
  metric_date DATE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_user_id ON analytics(user_id);
CREATE INDEX idx_analytics_business_id ON analytics(business_id);
CREATE INDEX idx_analytics_metric_type ON analytics(metric_type);
CREATE INDEX idx_analytics_metric_date ON analytics(metric_date);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Businesses: Users can only access their own businesses
CREATE POLICY "Users can view own businesses" ON businesses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create businesses" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own businesses" ON businesses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own businesses" ON businesses
  FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions: Users can only view their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Content: Users can only access their own content
CREATE POLICY "Users can view own content" ON content
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create content" ON content
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content" ON content
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own content" ON content
  FOR DELETE USING (auth.uid() = user_id);

-- Templates: Users can view public templates or their own
CREATE POLICY "Users can view public templates" ON templates
  FOR SELECT USING (is_public = true OR user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can create templates" ON templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" ON templates
  FOR DELETE USING (auth.uid() = user_id);

-- Analytics: Users can only access their own analytics
CREATE POLICY "Users can view own analytics" ON analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create analytics" ON analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- SEED DATA: Default Templates
-- =============================================

INSERT INTO templates (name, description, category, prompt_template, variables, is_public) VALUES
(
  'SEO Blog Post',
  'SEO-optimized blog article for local businesses',
  'blog',
  'Write a comprehensive, SEO-optimized blog post about {{topic}} for {{businessName}}, a {{industry}} business. The article should be informative, engaging, and include relevant keywords. Include an introduction, 3-4 main sections, and a call-to-action.',
  '[{"name": "topic", "label": "Topic", "type": "text"}, {"name": "businessName", "label": "Business Name", "type": "text"}, {"name": "industry", "label": "Industry", "type": "select"}]',
  true
),
(
  'Google Business Post',
  'Short post for Google Business Profile',
  'gmb',
  'Create a short, engaging Google Business post for {{businessName}} about {{topic}}. Keep it under 300 words, include a clear call-to-action, and make it local-focused.',
  '[{"name": "topic", "label": "Topic", "type": "text"}, {"name": "businessName", "label": "Business Name", "type": "text"}]',
  true
),
(
  'Social Media Post',
  'Engaging post for Facebook/Instagram',
  'social',
  'Create an engaging social media post for {{businessName}} about {{topic}}. Make it friendly and conversational, include relevant emojis, and add 3-5 relevant hashtags.',
  '[{"name": "topic", "label": "Topic", "type": "text"}, {"name": "businessName", "label": "Business Name", "type": "text"}]',
  true
),
(
  'Email Newsletter',
  'Monthly customer newsletter',
  'email',
  'Write a professional but friendly email newsletter for {{businessName}} about {{topic}}. Include a greeting, main content, and call-to-action. Keep the tone warm and helpful.',
  '[{"name": "topic", "label": "Topic", "type": "text"}, {"name": "businessName", "label": "Business Name", "type": "text"}]',
  true
);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
