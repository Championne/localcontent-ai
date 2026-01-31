import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/business/logo - Upload logo
export async function POST(request: Request) {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const logo = formData.get('logo') as File
    const businessId = formData.get('businessId') as string

    if (!logo || !businessId) {
      return NextResponse.json({ error: 'Logo and businessId are required' }, { status: 400 })
    }

    // Verify business belongs to user
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id, logo_url')
      .eq('id', businessId)
      .eq('user_id', user.id)
      .single()

    if (bizError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Delete old logo if exists
    if (business.logo_url) {
      const oldPath = business.logo_url.split('/logos/')[1]
      if (oldPath) {
        await supabase.storage.from('logos').remove([oldPath])
      }
    }

    // Generate unique filename
    const ext = logo.name.split('.').pop() || 'png'
    const filename = `${user.id}/${businessId}_${Date.now()}.${ext}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(filename, logo, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload logo' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('logos')
      .getPublicUrl(filename)

    const logoUrl = urlData.publicUrl

    // Update business with logo URL
    const { error: updateError } = await supabase
      .from('businesses')
      .update({ logo_url: logoUrl })
      .eq('id', businessId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to save logo' }, { status: 500 })
    }

    return NextResponse.json({ logo_url: logoUrl })

  } catch (error) {
    console.error('Logo upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/business/logo - Remove logo
export async function DELETE(request: Request) {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { businessId } = await request.json()

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 })
    }

    // Get business with logo
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id, logo_url')
      .eq('id', businessId)
      .eq('user_id', user.id)
      .single()

    if (bizError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Delete from storage if exists
    if (business.logo_url) {
      const path = business.logo_url.split('/logos/')[1]
      if (path) {
        await supabase.storage.from('logos').remove([path])
      }
    }

    // Clear logo_url in database
    const { error: updateError } = await supabase
      .from('businesses')
      .update({ logo_url: null })
      .eq('id', businessId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to remove logo' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Logo delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
