import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateContent, generateContentStream, type ContentGenerationRequest } from '@/lib/ai/content-generator'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { stream = false, saveToLibrary = false, ...contentRequest } = body

    // Validate required fields
    if (!contentRequest.templateType || !contentRequest.businessName || !contentRequest.keywords?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Streaming response
    if (stream) {
      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of generateContentStream(contentRequest as ContentGenerationRequest)) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`))
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          } catch (error) {
            controller.error(error)
          }
        },
      })

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Non-streaming response
    const generatedContent = await generateContent(contentRequest as ContentGenerationRequest)

    // Save to library if requested
    if (saveToLibrary) {
      await supabase.from('content').insert({
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
          businessName: contentRequest.businessName,
          location: contentRequest.location,
        },
      })
    }

    return NextResponse.json({ success: true, content: generatedContent })

  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
  }
}
