import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/outreach/templates - List email templates
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const marketId = searchParams.get('market_id')
    const language = searchParams.get('language')
    const industryId = searchParams.get('industry_id')
    const type = searchParams.get('type')
    const sequenceId = searchParams.get('sequence_id')

    let query = supabase
      .from('email_templates')
      .select(`
        *,
        market:markets(id, name, code, language),
        industry:industries(id, name, icon)
      `)
      .eq('is_active', true)
      .order('name')

    if (marketId) {
      query = query.or(`market_id.eq.${marketId},market_id.is.null`)
    }
    if (language) {
      query = query.eq('language', language)
    }
    if (industryId) {
      query = query.or(`industry_id.eq.${industryId},industry_id.is.null`)
    }
    if (type) {
      query = query.eq('type', type)
    }
    if (sequenceId) {
      query = query.eq('sequence_id', sequenceId)
    }

    const { data: templates, error } = await query

    if (error) throw error

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Templates API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/outreach/templates - Create new template
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      name,
      description,
      market_id,
      industry_id,
      language,
      subject,
      body: templateBody,
      type,
      sequence_id,
      step_number,
      delay_days
    } = body

    if (!name || !subject || !templateBody) {
      return NextResponse.json({ 
        error: 'name, subject, and body are required' 
      }, { status: 400 })
    }

    const { data: template, error } = await supabase
      .from('email_templates')
      .insert({
        name,
        description,
        market_id,
        industry_id,
        language: language || 'en',
        subject,
        body: templateBody,
        type: type || 'cold_email',
        sequence_id,
        step_number,
        delay_days: delay_days || 0,
        created_by: user.id
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error('Create template error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
