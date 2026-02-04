import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/outreach/leads/[id]/convert - Convert outreach lead to sales lead
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { assigned_to, priority = 'medium', notes } = body

    // Get the outreach lead
    const { data: outreachLead, error: fetchError } = await supabase
      .from('outreach_leads')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !outreachLead) {
      return NextResponse.json({ error: 'Outreach lead not found' }, { status: 404 })
    }

    // Check if already converted (has linked sales lead)
    if (outreachLead.sales_lead_id) {
      return NextResponse.json({ 
        error: 'Lead already converted',
        sales_lead_id: outreachLead.sales_lead_id 
      }, { status: 400 })
    }

    // Check if a sales lead with same email already exists
    if (outreachLead.contact_email) {
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('contact_email', outreachLead.contact_email)
        .single()

      if (existingLead) {
        // Link to existing sales lead
        await supabase
          .from('outreach_leads')
          .update({ 
            sales_lead_id: existingLead.id,
            status: 'converted'
          })
          .eq('id', id)

        return NextResponse.json({ 
          sales_lead_id: existingLead.id,
          message: 'Linked to existing sales lead',
          was_existing: true
        })
      }
    }

    // Create new sales lead
    const { data: salesLead, error: createError } = await supabase
      .from('leads')
      .insert({
        company_name: outreachLead.business_name,
        contact_name: outreachLead.contact_name,
        contact_email: outreachLead.contact_email,
        contact_phone: outreachLead.contact_phone,
        website: outreachLead.website,
        industry: outreachLead.industry,
        location: outreachLead.city && outreachLead.state 
          ? `${outreachLead.city}, ${outreachLead.state}` 
          : outreachLead.city || outreachLead.state,
        source: 'cold_outreach',
        source_detail: `Outreach campaign - ${outreachLead.emails_sent || 0} emails sent`,
        status: 'qualified', // They showed interest, so qualified
        priority,
        notes: notes || outreachLead.notes,
        tags: outreachLead.tags,
        assigned_to
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating sales lead:', createError)
      return NextResponse.json({ error: 'Failed to create sales lead' }, { status: 500 })
    }

    // Update outreach lead with link and status
    await supabase
      .from('outreach_leads')
      .update({ 
        sales_lead_id: salesLead.id,
        status: 'converted'
      })
      .eq('id', id)

    // Log activity on outreach lead
    await supabase.from('outreach_activities').insert({
      lead_id: id,
      type: 'converted',
      details: {
        sales_lead_id: salesLead.id,
        converted_by: user.id
      }
    })

    return NextResponse.json({ 
      sales_lead_id: salesLead.id,
      sales_lead: salesLead,
      message: 'Successfully converted to sales lead',
      was_existing: false
    })
  } catch (error) {
    console.error('Convert lead error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
