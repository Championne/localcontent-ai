import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkSalesApiAccess } from '@/lib/auth/salesApiAccess'

/**
 * GET /api/sales/team - List all sales team members (admin only)
 */
export async function GET() {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    // Only admins can view all team members
    if (access.salesMember?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('sales_team')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Get team error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/sales/team - Add a new sales team member (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    // Only admins can add team members
    if (access.salesMember?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { name, email, role } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'name and email are required' }, { status: 400 })
    }

    const supabase = createClient()

    // Look up user_id from email using a database function
    // First, check if user exists in sales_team by email
    const { data: existingByEmail } = await supabase
      .from('sales_team')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingByEmail) {
      return NextResponse.json({ error: 'User is already a team member' }, { status: 400 })
    }

    // Try to find user_id by looking in existing tables or use email as identifier
    // We'll use a database function to look up auth.users
    const { data: userData, error: userError } = await supabase
      .rpc('get_user_id_by_email', { user_email: email.toLowerCase() })

    let userId = userData
    
    // If RPC doesn't exist or fails, try alternative methods
    if (userError || !userId) {
      // Check subscriptions table
      const { data: subUser } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('user_id', email) // Some tables might store email
        .single()
      
      if (subUser?.user_id) {
        userId = subUser.user_id
      }
    }

    // If we still don't have a user_id, create the record with email as temporary identifier
    // The user will need to have signed up first
    if (!userId) {
      // Try one more approach - check if there's any user activity with this email
      // For now, we'll create the record and it will link when the user logs in
      // Generate a placeholder UUID that will be updated later
      return NextResponse.json({ 
        error: 'User not found. Please ensure the user has signed up to GeoSpark first.' 
      }, { status: 400 })
    }

    // Add to sales_team
    const { data, error } = await supabase
      .from('sales_team')
      .insert({
        user_id: userId,
        name,
        email: email.toLowerCase(),
        role: role || 'sales_rep',
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Add team member error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
