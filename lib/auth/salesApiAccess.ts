import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export interface SalesApiAccess {
  authorized: boolean
  user: { id: string; email: string } | null
  salesMember: {
    id: string
    role: 'admin' | 'manager' | 'sales_rep'
    name?: string
  } | null
  errorResponse?: NextResponse
}

/**
 * Check if the current user has API access to the sales module
 * Returns the user and their sales team membership, or an error response
 */
export async function checkSalesApiAccess(): Promise<SalesApiAccess> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { 
      authorized: false, 
      user: null, 
      salesMember: null,
      errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // Check if user exists in sales_team table
  const { data: salesMember } = await supabase
    .from('sales_team')
    .select('id, role, status, name')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!salesMember) {
    return { 
      authorized: false, 
      user: { id: user.id, email: user.email || '' }, 
      salesMember: null,
      errorResponse: NextResponse.json({ error: 'Access denied - not a sales team member' }, { status: 403 })
    }
  }

  return {
    authorized: true,
    user: { id: user.id, email: user.email || '' },
    salesMember: {
      id: salesMember.id,
      role: salesMember.role as 'admin' | 'manager' | 'sales_rep',
      name: salesMember.name || undefined
    }
  }
}
