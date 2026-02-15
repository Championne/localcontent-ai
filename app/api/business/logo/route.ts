import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/business/logo - Upload logo or profile photo
export async function POST(request: Request) {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const businessId = formData.get('businessId') as string
    const type = (formData.get('type') as string) || 'logo' // 'logo' or 'profile_photo'
    const file = formData.get(type) as File || formData.get('logo') as File

    if (!file || !businessId) {
      return NextResponse.json({ error: 'File and businessId are required' }, { status: 400 })
    }

    // Determine field name based on type
    const fieldName = type === 'profile_photo' ? 'profile_photo_url' : 'logo_url'

    // Verify business belongs to user
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id, logo_url, profile_photo_url')
      .eq('id', businessId)
      .eq('user_id', user.id)
      .single()

    if (bizError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Delete old file if exists
    const oldUrl = type === 'profile_photo' ? business.profile_photo_url : business.logo_url
    if (oldUrl) {
      const oldPath = oldUrl.split('/logos/')[1]
      if (oldPath) {
        await supabase.storage.from('logos').remove([oldPath])
      }
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'png'
    const prefix = type === 'profile_photo' ? 'photo' : 'logo'
    const filename = `${user.id}/${prefix}_${businessId}_${Date.now()}.${ext}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('logos')
      .getPublicUrl(filename)

    const fileUrl = urlData.publicUrl

    // Update business with URL
    const { error: updateError } = await supabase
      .from('businesses')
      .update({ [fieldName]: fileUrl })
      .eq('id', businessId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    return NextResponse.json({ url: fileUrl })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/business/logo - Remove logo or profile photo
export async function DELETE(request: Request) {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { businessId, type = 'logo' } = await request.json()

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 })
    }

    // Determine field name based on type
    const fieldName = type === 'profile_photo' ? 'profile_photo_url' : 'logo_url'

    // Get business with file URL
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id, logo_url, profile_photo_url')
      .eq('id', businessId)
      .eq('user_id', user.id)
      .single()

    if (bizError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Delete from storage if exists
    const fileUrl = type === 'profile_photo' ? business.profile_photo_url : business.logo_url
    if (fileUrl) {
      const path = fileUrl.split('/logos/')[1]
      if (path) {
        await supabase.storage.from('logos').remove([path])
      }
    }

    // Clear URL in database
    const { error: updateError } = await supabase
      .from('businesses')
      .update({ [fieldName]: null })
      .eq('id', businessId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to remove' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
