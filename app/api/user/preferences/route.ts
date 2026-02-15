import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getUserPreferences, LEVEL_LABELS } from '@/lib/ai-learning/preference-engine'

/**
 * GET /api/user/preferences
 *
 * Returns the authenticated user's Spark preference profile.
 * Used by the frontend to display personalized Spark messages
 * and the "Spark is learning" sidebar indicator.
 */
export async function GET() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const prefs = await getUserPreferences(supabase, user.id)

    return NextResponse.json({
      ...prefs,
      learningLevelLabel: LEVEL_LABELS[prefs.learningLevel],
    })
  } catch (err) {
    console.error('Failed to fetch user preferences:', err)
    return NextResponse.json({ error: 'Failed to load preferences' }, { status: 500 })
  }
}
