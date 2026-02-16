import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { addSmartTextOverlay, extractHeadline } from '@/lib/image-processing/smart-text-overlay'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const maxDuration = 30

/**
 * POST /api/content/brand-image
 *
 * Applies branded text overlay (headline + business name + brand color)
 * to a user-uploaded or library-picked image, making it match the same
 * branding as AI-generated images.
 *
 * Body: { imageUrl, headline?, businessName, brandColor, position? }
 */
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { imageUrl, headline, businessName, brandColor, topic, position } = body

    if (!imageUrl || !businessName || !brandColor) {
      return NextResponse.json({ error: 'Missing required fields: imageUrl, businessName, brandColor' }, { status: 400 })
    }

    // Fetch the source image
    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch source image' }, { status: 400 })
    }
    const imageBuffer = Buffer.from(await imgRes.arrayBuffer())

    // Determine headline
    const finalHeadline = headline || extractHeadline(topic || businessName)

    // Apply text overlay
    const brandedBuffer = await addSmartTextOverlay(imageBuffer, {
      headline: finalHeadline,
      businessName,
      brandColor,
      position: position || 'bottom',
    })

    // Upload branded image to storage
    const admin = getSupabaseAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 })
    }

    const fileName = `branded/${user.id}/${Date.now()}_branded.png`
    const { error: uploadError } = await admin.storage
      .from('generated-images')
      .upload(fileName, brandedBuffer, { contentType: 'image/png', upsert: true })

    if (uploadError) {
      return NextResponse.json({ error: 'Failed to upload branded image' }, { status: 500 })
    }

    const { data: urlData } = admin.storage
      .from('generated-images')
      .getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      headline: finalHeadline,
    })
  } catch (err) {
    console.error('Brand image error:', err)
    return NextResponse.json({ error: 'Failed to brand image' }, { status: 500 })
  }
}
