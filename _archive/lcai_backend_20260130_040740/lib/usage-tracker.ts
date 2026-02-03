import { SupabaseClient } from '@supabase/supabase-js'
import { PLANS, type PlanKey } from './stripe'

export interface UsageStats {
  blogPosts: number
  socialPosts: number
  gmbUpdates: number
  emailContent: number
  totalContent: number
}

export interface UsageLimits {
  blogPosts: { used: number; limit: number; remaining: number }
  socialPosts: { used: number; limit: number; remaining: number }
  gmbUpdates: { used: number; limit: number; remaining: number }
  totalContent: { used: number; limit: number; remaining: number }
}

// Get user's current month usage
export async function getUserUsage(
  supabase: SupabaseClient,
  userId: string
): Promise<UsageStats> {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('content')
    .select('content_type')
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString())

  if (error) throw error

  const stats: UsageStats = {
    blogPosts: 0,
    socialPosts: 0,
    gmbUpdates: 0,
    emailContent: 0,
    totalContent: data?.length || 0,
  }

  for (const item of data || []) {
    switch (item.content_type) {
      case 'blog':
        stats.blogPosts++
        break
      case 'social':
        stats.socialPosts++
        break
      case 'gmb':
        stats.gmbUpdates++
        break
      case 'email':
        stats.emailContent++
        break
    }
  }

  return stats
}

// Get user's plan
export async function getUserPlan(
  supabase: SupabaseClient,
  userId: string
): Promise<PlanKey> {
  const { data } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', userId)
    .single()

  return (data?.plan as PlanKey) || 'starter'
}

// Get usage with limits
export async function getUsageWithLimits(
  supabase: SupabaseClient,
  userId: string
): Promise<UsageLimits> {
  const [usage, plan] = await Promise.all([
    getUserUsage(supabase, userId),
    getUserPlan(supabase, userId),
  ])

  const planLimits = PLANS[plan]?.limits || PLANS.starter.limits

  const calculateLimit = (used: number, limit: number) => ({
    used,
    limit: limit === -1 ? Infinity : limit,
    remaining: limit === -1 ? Infinity : Math.max(0, limit - used),
  })

  return {
    blogPosts: calculateLimit(usage.blogPosts, planLimits.blogPosts),
    socialPosts: calculateLimit(usage.socialPosts, planLimits.socialPosts),
    gmbUpdates: calculateLimit(usage.gmbUpdates, planLimits.gmbUpdates),
    totalContent: calculateLimit(
      usage.totalContent,
      planLimits.blogPosts + planLimits.socialPosts + planLimits.gmbUpdates
    ),
  }
}

// Check if user can create content
export async function canCreateContent(
  supabase: SupabaseClient,
  userId: string,
  contentType: 'blog' | 'social' | 'gmb' | 'email'
): Promise<{ allowed: boolean; reason?: string }> {
  const limits = await getUsageWithLimits(supabase, userId)

  const typeMap: Record<string, keyof UsageLimits> = {
    blog: 'blogPosts',
    social: 'socialPosts',
    gmb: 'gmbUpdates',
    email: 'blogPosts', // emails count against blog limit
  }

  const limitKey = typeMap[contentType]
  const limit = limits[limitKey]

  if (limit.remaining <= 0) {
    return {
      allowed: false,
      reason: `You've reached your monthly limit for ${contentType} content. Upgrade your plan for more.`,
    }
  }

  return { allowed: true }
}

// Track content creation (call after successful generation)
export async function trackContentCreation(
  supabase: SupabaseClient,
  userId: string,
  contentType: string
): Promise<void> {
  // Insert usage log for analytics
  await supabase.from('usage_logs').insert({
    user_id: userId,
    action: 'content_created',
    content_type: contentType,
    created_at: new Date().toISOString(),
  }).catch(() => {
    // Usage logs table may not exist yet, ignore error
  })
}

// Get usage history for analytics
export async function getUsageHistory(
  supabase: SupabaseClient,
  userId: string,
  days: number = 30
): Promise<{ date: string; count: number; type: string }[]> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('content')
    .select('content_type, created_at')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  if (error) throw error

  // Group by date and type
  const grouped: Record<string, Record<string, number>> = {}
  
  for (const item of data || []) {
    const date = new Date(item.created_at).toISOString().split('T')[0]
    if (!grouped[date]) grouped[date] = {}
    grouped[date][item.content_type] = (grouped[date][item.content_type] || 0) + 1
  }

  const history: { date: string; count: number; type: string }[] = []
  for (const [date, types] of Object.entries(grouped)) {
    for (const [type, count] of Object.entries(types)) {
      history.push({ date, count, type })
    }
  }

  return history
}
