import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { checkSalesApiAccess } from '@/lib/auth/salesApiAccess'

/**
 * GET /api/sales/team/available-users - Get users not yet in sales team (admin only)
 */
export async function GET() {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    // Only admins can view available users
    if (access.salesMember?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const supabase = createClient()

    // Get all users from auth.users
    // Note: This requires the service role or a database function
    // For now, we'll use a database function or direct query
    
    // First get existing sales team user_ids
    const { data: teamMembers } = await supabase
      .from('sales_team')
      .select('user_id')

    const existingUserIds = (teamMembers || []).map(m => m.user_id)

    // Query users not in sales team using a database function or RPC
    // Since we can't directly query auth.users from client, we'll use profiles or a custom approach
    
    // Option 1: If you have a profiles table
    // Option 2: Create an RPC function
    // Option 3: Use admin API (requires service role)
    
    // For simplicity, let's create a workaround by fetching from a view or using service role
    // We'll return users from any table that has user info (like subscriptions, content, etc.)
    
    const { data: contentUsers } = await supabase
      .from('content')
      .select('user_id')
      .not('user_id', 'is', null)
    
    const { data: subscriptionUsers } = await supabase
      .from('subscriptions')
      .select('user_id')
      .not('user_id', 'is', null)

    // Combine and dedupe
    const allUserIds = new Set<string>()
    contentUsers?.forEach(u => u.user_id && allUserIds.add(u.user_id))
    subscriptionUsers?.forEach(u => u.user_id && allUserIds.add(u.user_id))

    // Filter out existing team members
    const availableUserIds = Array.from(allUserIds).filter(id => !existingUserIds.includes(id))

    // For now, return user IDs - in production you'd want to join with a profiles table
    // or use Supabase Admin API to get emails
    const users = availableUserIds.map(id => ({
      id,
      email: `User ${id.slice(0, 8)}...`, // Placeholder - ideally get real email
      created_at: new Date().toISOString()
    }))

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Get available users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
