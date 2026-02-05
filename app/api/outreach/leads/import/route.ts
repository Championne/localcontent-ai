import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface CSVLead {
  business_name?: string
  company_name?: string
  name?: string
  contact_name?: string
  first_name?: string
  last_name?: string
  email?: string
  contact_email?: string
  phone?: string
  contact_phone?: string
  title?: string
  contact_title?: string
  website?: string
  city?: string
  state?: string
  country?: string
  industry?: string
  google_rating?: string
  google_reviews?: string
  google_maps_url?: string
  notes?: string
  tags?: string
}

interface NormalizedLead {
  business_name: string
  contact_name: string
  contact_email: string | null
  contact_phone: string | null
  contact_title: string | null
  website: string | null
  city: string | null
  state: string | null
  country: string
  industry: string
  google_rating: number | null
  google_reviews_count: number | null
  google_maps_url: string | null
  notes: string | null
  tags: string[] | null
  source?: string
  source_details?: Record<string, string>
  campaign_id?: string | null
  created_by?: string
}

// Normalize CSV column names to our schema
function normalizeLeadData(row: CSVLead): NormalizedLead {
  return {
    business_name: row.business_name || row.company_name || row.name || 'Unknown',
    contact_name: row.contact_name || (row.first_name && row.last_name ? `${row.first_name} ${row.last_name}` : row.first_name || ''),
    contact_email: row.contact_email || row.email || null,
    contact_phone: row.contact_phone || row.phone || null,
    contact_title: row.contact_title || row.title || null,
    website: row.website || null,
    city: row.city || null,
    state: row.state || null,
    country: row.country || 'USA',
    industry: row.industry || 'HVAC',
    google_rating: row.google_rating ? parseFloat(row.google_rating) : null,
    google_reviews_count: row.google_reviews ? parseInt(row.google_reviews) : null,
    google_maps_url: row.google_maps_url || null,
    notes: row.notes || null,
    tags: row.tags ? row.tags.split(',').map(t => t.trim()) : null,
  }
}

// POST /api/outreach/leads/import - Import leads from CSV
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { leads, source = 'csv_import', campaign_id, skip_duplicates = true } = body

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: 'No leads provided' }, { status: 400 })
    }

    // Normalize all leads
    const normalizedLeads: NormalizedLead[] = leads.map(lead => ({
      ...normalizeLeadData(lead),
      source,
      source_details: { imported_at: new Date().toISOString() },
      campaign_id: campaign_id || null,
      created_by: user.id
    }))

    let imported = 0
    let skipped = 0
    let failed = 0
    const errors: string[] = []

    // Check for duplicates if enabled
    if (skip_duplicates) {
      const emails = normalizedLeads
        .map(l => l.contact_email)
        .filter(Boolean)

      const { data: existingLeads } = await supabase
        .from('outreach_leads')
        .select('contact_email')
        .in('contact_email', emails)

      const existingEmails = new Set(
        (existingLeads || []).map(l => l.contact_email?.toLowerCase())
      )

      for (const lead of normalizedLeads) {
        if (lead.contact_email && existingEmails.has(lead.contact_email.toLowerCase())) {
          skipped++
          continue
        }

        const { error } = await supabase
          .from('outreach_leads')
          .insert(lead)

        if (error) {
          failed++
          errors.push(`${lead.business_name}: ${error.message}`)
        } else {
          imported++
        }
      }
    } else {
      // Bulk insert without duplicate checking
      const { data, error } = await supabase
        .from('outreach_leads')
        .insert(normalizedLeads)
        .select()

      if (error) {
        console.error('Bulk import error:', error)
        return NextResponse.json({ 
          error: 'Import failed', 
          details: error.message 
        }, { status: 500 })
      }

      imported = data?.length || 0
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      failed,
      total: leads.length,
      errors: errors.slice(0, 10) // Return first 10 errors only
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
