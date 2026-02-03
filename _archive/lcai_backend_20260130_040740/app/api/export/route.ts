import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  generatePDFHTML,
  generateMarkdown,
  generatePlainText,
  generateWordHTML,
  generateBatchExport,
  type ContentForExport,
} from '@/lib/export/pdf-generator'

// GET - Export content in various formats
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get('id')
    const contentIds = searchParams.get('ids')?.split(',')
    const format = searchParams.get('format') || 'pdf'
    const includeBranding = searchParams.get('branding') !== 'false'

    // Validate format
    if (!['pdf', 'html', 'markdown', 'text', 'docx'].includes(format)) {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
    }

    // Get business info for context
    const { data: business } = await supabase
      .from('businesses')
      .select('name')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()

    // Single content export
    if (contentId) {
      const { data: content, error } = await supabase
        .from('content')
        .select('*')
        .eq('id', contentId)
        .eq('user_id', user.id)
        .single()

      if (error || !content) {
        return NextResponse.json({ error: 'Content not found' }, { status: 404 })
      }

      const exportContent: ContentForExport = {
        title: content.title,
        body: content.body,
        contentType: content.content_type,
        createdAt: content.created_at,
        businessName: business?.name,
        metadata: content.metadata,
      }

      return generateExportResponse(exportContent, format, includeBranding)
    }

    // Batch export
    if (contentIds && contentIds.length > 0) {
      const { data: contents, error } = await supabase
        .from('content')
        .select('*')
        .in('id', contentIds)
        .eq('user_id', user.id)

      if (error || !contents?.length) {
        return NextResponse.json({ error: 'No content found' }, { status: 404 })
      }

      const exportContents: ContentForExport[] = contents.map(c => ({
        title: c.title,
        body: c.body,
        contentType: c.content_type,
        createdAt: c.created_at,
        businessName: business?.name,
        metadata: c.metadata,
      }))

      // Batch only supports text and markdown
      if (format === 'text' || format === 'markdown') {
        const output = generateBatchExport(exportContents, format as 'text' | 'markdown')
        const filename = `content-export-${Date.now()}.${format === 'markdown' ? 'md' : 'txt'}`
        
        return new Response(output, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        })
      }

      return NextResponse.json({ 
        error: 'Batch export only supports text and markdown formats' 
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Content ID required' }, { status: 400 })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}

function generateExportResponse(
  content: ContentForExport,
  format: string,
  includeBranding: boolean
): Response {
  const safeTitle = content.title.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 50)
  const timestamp = Date.now()

  switch (format) {
    case 'pdf':
    case 'html': {
      const html = generatePDFHTML(content, { format: 'pdf', includeBranding })
      const filename = `${safeTitle}-${timestamp}.html`
      
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    case 'markdown': {
      const md = generateMarkdown(content)
      const filename = `${safeTitle}-${timestamp}.md`
      
      return new Response(md, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    case 'text': {
      const text = generatePlainText(content)
      const filename = `${safeTitle}-${timestamp}.txt`
      
      return new Response(text, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    case 'docx': {
      const html = generateWordHTML(content)
      const filename = `${safeTitle}-${timestamp}.doc`
      
      return new Response(html, {
        headers: {
          'Content-Type': 'application/msword',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    default:
      return new Response('Invalid format', { status: 400 })
  }
}
