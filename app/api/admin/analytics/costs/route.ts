import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: images } = await supabase
    .from('generated_images')
    .select('model_used, generation_cost, background_removal_method, created_at')
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth.toISOString())

  const rows = images ?? []

  const totalCost = rows.reduce((sum, img) => sum + (Number(img.generation_cost) || 0), 0)
  const costPerImage = rows.length > 0 ? totalCost / rows.length : 0

  const sdxlImages = rows.filter(img => img.model_used === 'sdxl')
  const dalle3Images = rows.filter(img => img.model_used === 'dalle3')

  const sdxlCost = sdxlImages.reduce((sum, img) => sum + (Number(img.generation_cost) || 0), 0)
  const dalle3Cost = dalle3Images.reduce((sum, img) => sum + (Number(img.generation_cost) || 0), 0)

  const paidRemoval = rows.filter(img => img.background_removal_method === 'paid').length
  const backgroundRemovalCost = paidRemoval * 0.20

  // Estimated time saved: ~6 min manual editing vs ~0.5 min automated per image
  const timeSavedHours = Math.round(rows.length * 5.5 / 60)

  return NextResponse.json({
    totalImages: rows.length,
    totalCost: +totalCost.toFixed(4),
    costPerImage: +costPerImage.toFixed(4),
    sdxlCost: +sdxlCost.toFixed(4),
    dalle3Cost: +dalle3Cost.toFixed(4),
    backgroundRemovalCost: +backgroundRemovalCost.toFixed(2),
    modelUsageRatio: {
      sdxl: rows.length > 0 ? Math.round(sdxlImages.length / rows.length * 100) : 0,
      dalle3: rows.length > 0 ? Math.round(dalle3Images.length / rows.length * 100) : 0,
    },
    timeSavedHours,
  })
}
