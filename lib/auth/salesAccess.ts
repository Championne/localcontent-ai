import { createClient } from '@/lib/supabase/server'

export interface SalesAccess {
  isSalesUser: boolean
  role: 'admin' | 'manager' | 'sales_rep' | null
  memberId: string | null
}

/**
 * Check if the current user has access to the sales module
 * Returns sales team membership info
 */
export async function checkSalesAccess(): Promise<SalesAccess> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { isSalesUser: false, role: null, memberId: null }
  }

  // Check if user exists in sales_team table
  const { data: salesMember } = await supabase
    .from('sales_team')
    .select('id, role, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!salesMember) {
    return { isSalesUser: false, role: null, memberId: null }
  }

  return {
    isSalesUser: true,
    role: salesMember.role as SalesAccess['role'],
    memberId: salesMember.id
  }
}

/**
 * Check if user can manage team (admin only)
 */
export function canManageTeam(role: SalesAccess['role']): boolean {
  return role === 'admin'
}

/**
 * Check if user can approve commissions (admin or manager)
 */
export function canApproveCommissions(role: SalesAccess['role']): boolean {
  return role === 'admin' || role === 'manager'
}
