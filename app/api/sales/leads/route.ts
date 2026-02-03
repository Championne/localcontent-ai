import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { CreateLead } from '@/types/sales'
import { checkSalesApiAccess } from '@/lib/auth/salesApiAccess'

export async function GET(request: NextRequest) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!
    
    const supabase = createClient()

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase.from('leads').select(`*, assigned_to_member:sales_team!leads_assigned_to_fkey(id, name, email)`, { count: 'exact' })
      .order('created_at', { ascending: false }).limit(limit)
    
    // Handle comma-separated status values
    if (status) {
      const statusValues = status.split(',').map(s => s.trim())
      if (statusValues.length > 1) {
        query = query.in('status', statusValues)
      } else {
        query = query.eq('status', status)
      }
    }

    const { data, error, count } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data, count })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!
    
    const supabase = createClient()
    const body: CreateLead = await request.json()
    if (!body.company_name) return NextResponse.json({ error: 'Company name required' }, { status: 400 })

    const { data, error } = await supabase.from('leads').insert({
      company_name: body.company_name,
      contact_name: body.contact_name || null,
      contact_email: body.contact_email || null,
      contact_phone: body.contact_phone || null,
      website: body.website || null,
      industry: body.industry || null,
      business_type: body.business_type || null,
      location: body.location || null,
      source: body.source || 'manual',
      priority: body.priority || 'medium',
      notes: body.notes || null,
      assigned_to: body.assigned_to || null,
      status: 'new',
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
