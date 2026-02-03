import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateContent, type ContentGenerationRequest } from '@/lib/ai/content-generator'
import { z } from 'zod'

const requestSchema = z.object({
  templateType: z.enum(['blog', 'social', 'gmb', 'email']),
  businessName: z.string().min(1),
  businessType: z.string().min(1),
  location: z.string().min(1),
  keywords: z.array(z.string()).min(1),
  tone: z.enum(['professional', 'friendly', 'casual', 'authoritative']).optional(),
  topic: z.string().optional(),
  additionalContext: z.string().optional(),
  saveToLibrary: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = requestSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { saveToLibrary, ...contentRequest } = validationResult.data

    // Generate content
    const generatedContent = await generateContent(contentRequest as ContentGenerationRequest)

    // Optionally save to library
    if (saveToLibrary) {
      const { error: saveError } = await supabase
        .from('content')
        .insert({
          user_id: user.id,
          title: generatedContent.title,
          body: generatedContent.body,
          content_type: contentRequest.templateType,
          status: 'draft',
          metadata: {
            keywords: contentRequest.keywords,
            hashtags: generatedContent.hashtags,
            callToAction: generatedContent.callToAction,
            seoDescription: generatedContent.seoDescription,
          },
        })

      if (saveError) {
        console.error('Error saving content:', saveError)
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      content: generatedContent,
    })

  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}
