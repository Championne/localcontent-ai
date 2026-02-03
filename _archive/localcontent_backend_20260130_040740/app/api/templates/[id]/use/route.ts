import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateContent, type ContentGenerationRequest } from '@/lib/ai/content-generator'

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

    // Get template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('*')
      .eq('id', params.id)
      .or(`is_public.eq.true,created_by.eq.${user.id}`)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Get user's business info
    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const body = await request.json()
    const { variables = {}, saveToLibrary = false } = body

    // Build prompt from template
    let prompt = template.prompt_template
    for (const [key, value] of Object.entries(variables)) {
      prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value as string)
    }

    // Generate content using template
    const contentRequest: ContentGenerationRequest = {
      templateType: template.content_type,
      businessName: business?.name || variables.businessName || 'Your Business',
      businessType: business?.type || variables.businessType || 'Local Business',
      location: business?.city || variables.location || 'Your City',
      keywords: variables.keywords?.split(',').map((k: string) => k.trim()) || [],
      tone: variables.tone || 'friendly',
      topic: variables.topic || template.name,
      additionalContext: prompt,
    }

    const generatedContent = await generateContent(contentRequest)

    // Update template usage count
    await supabase
      .from('templates')
      .update({ usage_count: (template.usage_count || 0) + 1 })
      .eq('id', params.id)

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
          variables,
          hashtags: generatedContent.hashtags,
          callToAction: generatedContent.callToAction,
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
    return NextResponse.json({ error: 'Failed to use template' }, { status: 500 })
  }
}
