import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/outreach/export - Export leads for Instantly.ai or other tools
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      campaign_id, 
      status_filter, 
      format = 'instantly',
      lead_ids 
    } = body

    // Build query
    let query = supabase
      .from('outreach_leads')
      .select('*')

    if (lead_ids && Array.isArray(lead_ids) && lead_ids.length > 0) {
      query = query.in('id', lead_ids)
    } else {
      if (campaign_id) {
        query = query.eq('campaign_id', campaign_id)
      }
      if (status_filter && status_filter !== 'all') {
        query = query.eq('status', status_filter)
      } else {
        // By default, only export leads that haven't been contacted
        query = query.in('status', ['new'])
      }
    }

    const { data: leads, error } = await query

    if (error) {
      console.error('Error fetching leads for export:', error)
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({ error: 'No leads to export' }, { status: 400 })
    }

    // Format based on target platform
    let exportData
    let filename

    switch (format) {
      case 'instantly':
        // Instantly.ai CSV format
        exportData = leads.map(lead => ({
          email: lead.contact_email || '',
          first_name: lead.contact_name?.split(' ')[0] || '',
          last_name: lead.contact_name?.split(' ').slice(1).join(' ') || '',
          company_name: lead.business_name,
          phone: lead.contact_phone || '',
          website: lead.website || '',
          // Custom variables for email personalization
          city: lead.city || '',
          industry: lead.industry || '',
          google_rating: lead.google_rating || '',
          google_reviews: lead.google_reviews_count || ''
        }))
        filename = `instantly_export_${new Date().toISOString().split('T')[0]}.csv`
        break

      case 'smartlead':
        // Smartlead format (similar to Instantly)
        exportData = leads.map(lead => ({
          email: lead.contact_email || '',
          first_name: lead.contact_name?.split(' ')[0] || '',
          last_name: lead.contact_name?.split(' ').slice(1).join(' ') || '',
          company: lead.business_name,
          phone: lead.contact_phone || '',
          custom1: lead.city || '',
          custom2: lead.industry || '',
          custom3: lead.google_rating || ''
        }))
        filename = `smartlead_export_${new Date().toISOString().split('T')[0]}.csv`
        break

      case 'lemlist':
        // Lemlist format
        exportData = leads.map(lead => ({
          email: lead.contact_email || '',
          firstName: lead.contact_name?.split(' ')[0] || '',
          lastName: lead.contact_name?.split(' ').slice(1).join(' ') || '',
          companyName: lead.business_name,
          phone: lead.contact_phone || '',
          city: lead.city || '',
          picture: '', // Lemlist can use LinkedIn pictures
        }))
        filename = `lemlist_export_${new Date().toISOString().split('T')[0]}.csv`
        break

      default:
        // Generic format
        exportData = leads.map(lead => ({
          business_name: lead.business_name,
          contact_name: lead.contact_name || '',
          email: lead.contact_email || '',
          phone: lead.contact_phone || '',
          website: lead.website || '',
          city: lead.city || '',
          state: lead.state || '',
          industry: lead.industry || '',
          google_rating: lead.google_rating || '',
          google_reviews: lead.google_reviews_count || '',
          notes: lead.notes || ''
        }))
        filename = `leads_export_${new Date().toISOString().split('T')[0]}.csv`
    }

    // Convert to CSV
    if (exportData.length === 0) {
      return NextResponse.json({ error: 'No data to export' }, { status: 400 })
    }

    const headers = Object.keys(exportData[0])
    const csvRows = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => {
          const value = String((row as Record<string, unknown>)[header] || '')
          // Escape quotes and wrap in quotes if contains comma or quote
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ]
    const csv = csvRows.join('\n')

    // Update leads status to 'contacted' if requested
    if (body.mark_as_contacted) {
      const leadIds = leads.map(l => l.id)
      await supabase
        .from('outreach_leads')
        .update({ status: 'contacted', last_contacted_at: new Date().toISOString() })
        .in('id', leadIds)

      // Log activity
      const activities = leadIds.map(id => ({
        lead_id: id,
        campaign_id: campaign_id || null,
        type: 'email_sent',
        details: { exported_to: format }
      }))
      await supabase.from('outreach_activities').insert(activities)
    }

    return NextResponse.json({
      csv,
      filename,
      count: exportData.length,
      format
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
