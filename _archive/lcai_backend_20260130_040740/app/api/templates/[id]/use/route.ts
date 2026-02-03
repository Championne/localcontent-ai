import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateContent, generateContentStream } from '@/lib/ai/content-generator'

// POST - Use template to generate content
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('*')
      .eq('id', params.id)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Check access
    if (!template.is_public && template.created_by !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      variables = {}, 
      businessName, 
      location,
      keywords = [],
      tone = 'friendly',
      stream = false,
      saveToLibrary = false 
    } = body

    // Replace variables in prompt template
    let processedPrompt = template.prompt_template
    for (const [key, value] of Object.entries(variables)) {
      processedPrompt = processedPrompt.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
    }

    // Increment usage count
    await supabase
      .from('templates')
      .update({ usage_count: (template.usage_count || 0) + 1 })
      .eq('id', params.id)

    // Generate content using the template
    const contentRequest = {
      templateType: template.content_type as 'blog' | 'social' | 'gmb' | 'email',
      businessName: businessName || variables.businessName || 'Your Business',
      businessType: variables.businessType || 'local business',
      location: location || variables.location || '',
      keywords: keywords.length > 0 ? keywords : (variables.keywords || []),
      tone,
      topic: variables.topic || template.name,
      additionalContext: processedPrompt,
    }

    // Streaming response
    if (stream) {
      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of generateContentStream(contentRequest)) {
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
    const generatedContent = await generateContent(contentRequest)

    // Save to library if requested
    if (saveToLibrary) {
      await supabase.from('content').insert({
        user_id: user.id,
        title: generatedContent.title,
        body: generatedContent.body,
        content_type: template.content_type,
        status: 'draft',
        metadata: {
          template_id: template.id,
          template_name: template.name,
          keywords,
          hashtags: generatedContent.hashtags,
          callToAction: generatedContent.callToAction,
          seoDescription: generatedContent.seoDescription,
          businessName,
          location,
        },
      })
    }

    return NextResponse.json({ 
      success: true, 
      content: generatedContent,
      template: {
        id: template.id,
        name: template.name,
      }
    })

  } catch (error) {
    console.error('Use template error:', error)
    return NextResponse.json({ error: 'Failed to generate content from template' }, { status: 500 })
  }
}
