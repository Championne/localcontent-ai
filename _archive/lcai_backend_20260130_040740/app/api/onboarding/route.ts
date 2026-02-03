import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  BUSINESS_TYPES, 
  DEFAULT_KEYWORDS,
  getOnboardingProgress,
  createSampleContent 
} from '@/lib/onboarding'

// GET - Get onboarding status and options
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'progress'

    switch (action) {
      case 'progress':
        const progress = await getOnboardingProgress(supabase, user.id)
        return NextResponse.json(progress)

      case 'business-types':
        return NextResponse.json({ businessTypes: BUSINESS_TYPES })

      case 'keywords':
        const businessType = searchParams.get('type') || 'other'
        return NextResponse.json({ 
          keywords: DEFAULT_KEYWORDS[businessType] || DEFAULT_KEYWORDS.other 
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json({ error: 'Failed to get onboarding data' }, { status: 500 })
  }
}

// POST - Complete onboarding step
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { step, data } = body

    switch (step) {
      case 'business': {
        // Create business profile
        const {
          name,
          business_type,
          description,
          phone,
          email,
          website,
          address,
          city,
          state,
          zip_code,
          country,
          keywords,
          createSamples = true,
        } = data

        if (!name || !business_type) {
          return NextResponse.json({ 
            error: 'Business name and type are required' 
          }, { status: 400 })
        }

        // Use default keywords if not provided
        const businessKeywords = keywords?.length > 0 
          ? keywords 
          : DEFAULT_KEYWORDS[business_type] || DEFAULT_KEYWORDS.other

        // Create business
        const { data: business, error: businessError } = await supabase
          .from('businesses')
          .insert({
            user_id: user.id,
            name,
            business_type,
            description,
            phone,
            email,
            website,
            address,
            city,
            state,
            zip_code,
            country: country || 'US',
            keywords: businessKeywords,
            is_primary: true,
          })
          .select()
          .single()

        if (businessError) throw businessError

        // Create sample content if requested
        if (createSamples) {
          const location = city && state ? `${city}, ${state}` : city || state || 'your area'
          await createSampleContent(supabase, user.id, name, business_type, location)
        }

        // Mark onboarding as started in profile
        await supabase
          .from('profiles')
          .update({ onboarding_started: true })
          .eq('id', user.id)

        return NextResponse.json({ 
          success: true, 
          business,
          message: 'Business profile created successfully!'
        })
      }

      case 'complete': {
        // Mark onboarding as complete
        await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('id', user.id)

        return NextResponse.json({ 
          success: true,
          message: 'Onboarding complete! Welcome to LocalContent.ai'
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid step' }, { status: 400 })
    }

  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json({ error: 'Onboarding step failed' }, { status: 500 })
  }
}
