import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  generateReviewResponse, 
  generateResponseOptions,
  analyzeReview,
  type ReviewData 
} from '@/lib/ai/review-responder'

// POST - Generate AI response to a review
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      reviewerName,
      starRating,
      reviewText,
      businessName,
      businessType,
      generateOptions = false,
      optionCount = 3,
      analyze = false,
    } = body

    if (!reviewText || !starRating) {
      return NextResponse.json({ 
        error: 'reviewText and starRating are required' 
      }, { status: 400 })
    }

    // Get business info if not provided
    let business = { name: businessName, type: businessType }
    if (!businessName || !businessType) {
      const { data: businessData } = await supabase
        .from('businesses')
        .select('name, business_type')
        .eq('user_id', user.id)
        .single()
      
      if (businessData) {
        business = { 
          name: businessData.name || 'Our Business', 
          type: businessData.business_type || 'local business' 
        }
      }
    }

    const reviewData: ReviewData = {
      reviewerName: reviewerName || 'Customer',
      starRating,
      reviewText,
      businessName: business.name,
      businessType: business.type,
    }

    const result: any = {}

    // Generate response(s)
    if (generateOptions) {
      result.options = await generateResponseOptions(reviewData, optionCount)
    } else {
      result.response = await generateReviewResponse(reviewData)
    }

    // Analyze review if requested
    if (analyze) {
      result.analysis = await analyzeReview(reviewText)
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Review response generation error:', error)
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}
