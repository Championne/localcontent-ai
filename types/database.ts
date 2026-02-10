// Database types for LocalContent.ai
// These match the Supabase schema

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Business {
  id: string
  user_id: string
  name: string
  industry: string | null
  description: string | null
  location: string | null
  website: string | null
  phone: string | null
  gmb_place_id: string | null
  gmb_connected: boolean
  logo_url: string | null
  profile_photo_url: string | null
  brand_primary_color: string | null
  brand_secondary_color: string | null
  brand_accent_color: string | null
  tagline: string | null
  default_cta_primary: string | null
  default_cta_secondary: string | null
  seo_keywords: string | null
  default_tone: string | null
  social_handles: string | null
  service_areas: string | null
  short_about: string | null
  preferred_image_styles: string[]
  avoid_image_styles: string[]
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan: 'free' | 'starter' | 'growth' | 'pro' | 'premium' // growth deprecated; Stripe: starter, pro, premium
  status: 'active' | 'canceled' | 'past_due'
  current_period_start: string | null
  current_period_end: string | null
  content_limit: number
  content_used: number
  created_at: string
  updated_at: string
}

export interface Content {
  id: string
  user_id: string
  business_id: string | null
  template: 'blog-post' | 'social-post' | 'gmb-post' | 'email'
  title: string | null
  content: string
  metadata: ContentMetadata
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  scheduled_for: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface ContentMetadata {
  businessName?: string
  industry?: string
  topic?: string
  tone?: string
  generatedAt?: string
  [key: string]: unknown
}

export interface Template {
  id: string
  user_id: string | null
  name: string
  description: string | null
  category: 'blog' | 'social' | 'gmb' | 'email'
  industry: string | null
  prompt_template: string
  variables: TemplateVariable[]
  is_public: boolean
  usage_count: number
  created_at: string
  updated_at: string
}

export interface TemplateVariable {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select'
  options?: string[]
  required?: boolean
}

export interface Analytics {
  id: string
  user_id: string
  business_id: string | null
  metric_type: 'gmb_views' | 'search_impressions' | 'content_published' | 'reviews'
  metric_value: number
  metric_date: string
  metadata: Record<string, unknown>
  created_at: string
}

// Integrations & Impact Analytics (user_integrations, baseline_snapshots, metric_history)
// All scoped per business: each business has its own GMB, social connections, baseline, metrics.
export type IntegrationPlatform =
  | 'google_business'
  | 'google_search_console'
  | 'google_analytics'
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'nextdoor'
  | 'yelp'
  | 'tiktok'
  | 'pinterest'
  | 'late_aggregator'

export interface UserIntegration {
  id: string
  user_id: string
  business_id: string
  platform: IntegrationPlatform
  access_token: string | null
  refresh_token: string | null
  token_expires_at: string | null
  account_id: string | null
  account_name: string | null
  location_id: string | null
  metadata: Record<string, unknown>
  connected_at: string
  last_sync_at: string | null
  last_error: string | null
  created_at: string
  updated_at: string
}

export interface BaselineSnapshot {
  id: string
  user_id: string
  business_id: string
  metric_type: string
  metric_value: number | null
  metric_source: string | null
  captured_at: string
  is_baseline: boolean
  created_at: string
}

export interface MetricHistory {
  id: string
  user_id: string
  business_id: string
  metric_type: string
  metric_value: number | null
  metric_source: string | null
  recorded_date: string
  created_at: string
}

// API Request/Response types
export interface GenerateContentRequest {
  template: string
  businessName: string
  industry: string
  topic: string
  tone?: string
}

export interface GenerateContentResponse {
  success: boolean
  content: string
  template: string
  metadata: ContentMetadata
  error?: string
}

// Dashboard types
export interface DashboardStats {
  contentCreated: number
  viewsThisMonth: number
  reviews: number
  plan: string
}

export interface QuickAction {
  id: string
  title: string
  description: string
  href: string
  icon?: string
}
