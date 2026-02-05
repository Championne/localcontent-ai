// Sales Module Types
// GeoSpark/LocalContent.ai Sales Team Management

export type SalesRole = 'admin' | 'manager' | 'sales_rep'
export type SalesStatus = 'active' | 'inactive' | 'pending'

export type LeadStatus = 
  | 'new' 
  | 'contacted' 
  | 'qualified' 
  | 'demo_scheduled' 
  | 'demo_completed' 
  | 'proposal_sent' 
  | 'negotiation' 
  | 'won' 
  | 'lost'

export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent'

export type LeadSource = 
  | 'website' 
  | 'referral' 
  | 'cold_outreach' 
  | 'linkedin' 
  | 'facebook' 
  | 'google_ads'
  | 'manual'

export type DealStage = 
  | 'qualification' 
  | 'discovery' 
  | 'demo' 
  | 'proposal' 
  | 'negotiation' 
  | 'closed_won' 
  | 'closed_lost'

export type PlanType = 'starter' | 'growth' | 'pro' | 'premium' | 'enterprise'
export type BillingCycle = 'monthly' | 'annual'

export type ActivityType = 'call' | 'email' | 'meeting' | 'demo' | 'note' | 'task'
export type ActivityOutcome = 
  | 'connected' 
  | 'voicemail' 
  | 'no_answer' 
  | 'email_sent' 
  | 'email_opened'
  | 'meeting_scheduled' 
  | 'demo_completed' 
  | 'follow_up_needed'

export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'disputed'
export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed'

// Call types
export type CallDirection = 'inbound' | 'outbound'
export type CallStatus = 
  | 'initiated' 
  | 'ringing' 
  | 'in-progress' 
  | 'completed' 
  | 'busy' 
  | 'no-answer' 
  | 'failed' 
  | 'canceled'

export type CallOutcome = 
  | 'connected' 
  | 'voicemail' 
  | 'no_answer' 
  | 'busy' 
  | 'wrong_number' 
  | 'not_interested' 
  | 'callback_scheduled' 
  | 'qualified'
  | 'demo_booked'

export type DialerQueueStatus = 'pending' | 'calling' | 'completed' | 'skipped'

export interface SalesTeamMember {
  id: string
  user_id: string | null
  name: string
  email: string
  phone: string | null
  role: SalesRole
  commission_rate_new: number
  commission_rate_renewal: number
  territory: string | null
  status: SalesStatus
  hire_date: string
  avatar_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CreateSalesTeamMember {
  name: string
  email: string
  phone?: string
  role?: SalesRole
  commission_rate_new?: number
  commission_rate_renewal?: number
  territory?: string
  notes?: string
}

export interface UpdateSalesTeamMember {
  name?: string
  email?: string
  phone?: string
  role?: SalesRole
  commission_rate_new?: number
  commission_rate_renewal?: number
  territory?: string
  status?: SalesStatus
  notes?: string
}

export interface Lead {
  id: string
  assigned_to: string | null
  company_name: string
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  website: string | null
  industry: string | null
  business_type: string | null
  location: string | null
  employee_count: string | null
  source: LeadSource
  source_detail: string | null
  status: LeadStatus
  priority: LeadPriority
  lost_reason: string | null
  notes: string | null
  tags: string[] | null
  last_contacted_at: string | null
  next_follow_up: string | null
  created_at: string
  updated_at: string
  assigned_to_member?: SalesTeamMember
}

export interface CreateLead {
  company_name: string
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  website?: string
  industry?: string
  business_type?: string
  location?: string
  employee_count?: string
  source?: LeadSource
  source_detail?: string
  priority?: LeadPriority
  notes?: string
  tags?: string[]
  assigned_to?: string
}

export interface UpdateLead {
  company_name?: string
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  website?: string
  industry?: string
  business_type?: string
  location?: string
  employee_count?: string
  source?: LeadSource
  source_detail?: string
  status?: LeadStatus
  priority?: LeadPriority
  lost_reason?: string
  notes?: string
  tags?: string[]
  assigned_to?: string
  next_follow_up?: string
  last_contacted_at?: string
  updated_at?: string
}

export interface Deal {
  id: string
  lead_id: string | null
  salesperson_id: string
  customer_id: string | null
  subscription_id: string | null
  deal_name: string
  plan: PlanType
  billing_cycle: BillingCycle
  mrr_value: number
  arr_value: number
  stage: DealStage
  probability: number
  is_new_business: boolean
  expected_close_date: string | null
  actual_close_date: string | null
  lost_reason: string | null
  notes: string | null
  created_at: string
  updated_at: string
  lead?: Lead
  salesperson?: SalesTeamMember
}

export interface CreateDeal {
  lead_id?: string
  salesperson_id: string
  deal_name: string
  plan: PlanType
  billing_cycle?: BillingCycle
  mrr_value: number
  is_new_business?: boolean
  expected_close_date?: string
  notes?: string
}

export interface UpdateDeal {
  deal_name?: string
  plan?: PlanType
  billing_cycle?: BillingCycle
  mrr_value?: number
  stage?: DealStage
  is_new_business?: boolean
  expected_close_date?: string
  lost_reason?: string
  notes?: string
}

export interface Activity {
  id: string
  salesperson_id: string
  lead_id: string | null
  deal_id: string | null
  type: ActivityType
  subject: string | null
  description: string | null
  duration_minutes: number | null
  outcome: ActivityOutcome | null
  scheduled_at: string | null
  completed_at: string | null
  is_completed: boolean
  metadata: Record<string, unknown>
  created_at: string
  salesperson?: SalesTeamMember
  lead?: Lead
  deal?: Deal
}

export interface CreateActivity {
  salesperson_id: string
  lead_id?: string
  deal_id?: string
  type: ActivityType
  subject?: string
  description?: string
  duration_minutes?: number
  outcome?: ActivityOutcome
  scheduled_at?: string
  metadata?: Record<string, unknown>
}

export interface Commission {
  id: string
  salesperson_id: string
  deal_id: string | null
  subscription_id: string | null
  stripe_subscription_id: string | null
  stripe_invoice_id: string | null
  period_start: string
  period_end: string
  revenue_amount: number
  commission_rate: number
  commission_amount: number
  is_new_business: boolean
  status: CommissionStatus
  approved_at: string | null
  approved_by: string | null
  notes: string | null
  created_at: string
  updated_at: string
  salesperson?: SalesTeamMember
  deal?: Deal
}

export const PLAN_PRICING: Record<PlanType, { monthly: number; annual: number }> = {
  starter: { monthly: 29, annual: 23 },
  growth: { monthly: 49, annual: 39 },
  pro: { monthly: 79, annual: 63 },
  premium: { monthly: 179, annual: 143 },
  enterprise: { monthly: 499, annual: 449 },
}

export const DEAL_STAGE_ORDER: DealStage[] = [
  'qualification',
  'discovery',
  'demo',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
]

// Call interfaces
export interface Call {
  id: string
  twilio_call_sid: string | null
  twilio_parent_call_sid: string | null
  salesperson_id: string | null
  lead_id: string | null
  deal_id: string | null
  direction: CallDirection
  from_number: string
  to_number: string
  status: CallStatus
  initiated_at: string
  answered_at: string | null
  ended_at: string | null
  duration_seconds: number
  recording_url: string | null
  recording_duration_seconds: number | null
  recording_sid: string | null
  outcome: CallOutcome | null
  outcome_notes: string | null
  follow_up_date: string | null
  follow_up_notes: string | null
  created_at: string
  updated_at: string
  // Joined relations
  salesperson?: SalesTeamMember
  lead?: Lead
  deal?: Deal
}

export interface CreateCall {
  lead_id: string
  to_number: string
  deal_id?: string
}

export interface UpdateCallOutcome {
  outcome: CallOutcome
  outcome_notes?: string
  follow_up_date?: string
  follow_up_notes?: string
}

export interface DialerQueueItem {
  id: string
  salesperson_id: string
  lead_id: string
  position: number
  status: DialerQueueStatus
  priority: number
  scheduled_for: string | null
  call_id: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  // Joined relations
  lead?: Lead
  call?: Call
}

export interface AddToDialerQueue {
  lead_ids: string[]
  priority?: number
  scheduled_for?: string
}

export const CALL_OUTCOME_LABELS: Record<CallOutcome, string> = {
  connected: 'Connected - Spoke with contact',
  voicemail: 'Left Voicemail',
  no_answer: 'No Answer',
  busy: 'Line Busy',
  wrong_number: 'Wrong Number',
  not_interested: 'Not Interested',
  callback_scheduled: 'Callback Scheduled',
  qualified: 'Qualified Lead',
  demo_booked: 'Demo Booked!',
}

// Feedback types
export type FeedbackType = 
  | 'feature_request'
  | 'objection'
  | 'competitor_mention'
  | 'pricing_feedback'
  | 'product_issue'
  | 'praise'
  | 'improvement_idea'
  | 'insight'

export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical'
export type FeedbackStatus = 'new' | 'reviewed' | 'in_progress' | 'implemented' | 'declined'
export type FeedbackCategory = 'product' | 'pricing' | 'onboarding' | 'support' | 'features' | 'ux' | 'other'

export interface Feedback {
  id: string
  submitted_by: string | null
  lead_id: string | null
  deal_id: string | null
  call_id: string | null
  type: FeedbackType
  priority: FeedbackPriority
  title: string
  description: string | null
  client_quote: string | null
  client_name: string | null
  client_company: string | null
  category: FeedbackCategory | null
  tags: string[] | null
  status: FeedbackStatus
  reviewed_by: string | null
  reviewed_at: string | null
  review_notes: string | null
  action_taken: string | null
  implemented_at: string | null
  upvotes: number
  created_at: string
  updated_at: string
  // Joined
  submitter?: SalesTeamMember
  lead?: Lead
  reviewer?: SalesTeamMember
}

export interface CreateFeedback {
  type: FeedbackType
  title: string
  description?: string
  priority?: FeedbackPriority
  category?: FeedbackCategory
  client_quote?: string
  client_name?: string
  client_company?: string
  lead_id?: string
  deal_id?: string
  call_id?: string
  tags?: string[]
}

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, { label: string; emoji: string; color: string }> = {
  feature_request: { label: 'Feature Request', emoji: '💡', color: 'bg-purple-100 text-purple-800' },
  objection: { label: 'Common Objection', emoji: '🤔', color: 'bg-orange-100 text-orange-800' },
  competitor_mention: { label: 'Competitor Mention', emoji: '🏷️', color: 'bg-blue-100 text-blue-800' },
  pricing_feedback: { label: 'Pricing Feedback', emoji: '💰', color: 'bg-yellow-100 text-yellow-800' },
  product_issue: { label: 'Product Issue', emoji: '🐛', color: 'bg-red-100 text-red-800' },
  praise: { label: 'Praise', emoji: '⭐', color: 'bg-green-100 text-green-800' },
  improvement_idea: { label: 'Improvement Idea', emoji: '🚀', color: 'bg-teal-100 text-teal-800' },
  insight: { label: 'Insight', emoji: '📝', color: 'bg-gray-100 text-gray-800' },
}

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  product: 'Product',
  pricing: 'Pricing',
  onboarding: 'Onboarding',
  support: 'Support',
  features: 'Features',
  ux: 'User Experience',
  other: 'Other',
}
