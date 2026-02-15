import { NextResponse } from 'next/server'
import { selectOptimalFramework, FRAMEWORK_DESCRIPTIONS, AWARENESS_LEVEL_DESCRIPTIONS } from '@/lib/content/framework-selector'
import { detectBrandPersonality } from '@/lib/branding/personality-detection'
import { FRAMEWORK_IMAGE_MOODS } from '@/lib/openai/images'

/**
 * Lightweight endpoint that analyzes a topic and returns the predicted marketing framework,
 * awareness level, and brand personality — no LLM calls, just the decision-tree selector.
 * Used by the Step 2 live intelligence preview as the user types.
 */
export async function POST(request: Request) {
  try {
    const { topic, industry, contentType, campaignGoal, brandPrimaryColor, brandSecondaryColor } = await request.json()

    if (!topic || !industry) {
      return NextResponse.json({ error: 'topic and industry required' }, { status: 400 })
    }

    const rec = selectOptimalFramework({
      topic,
      industry,
      contentType: contentType || 'social-pack',
      campaignGoal: campaignGoal || undefined,
    })

    const fwDesc = FRAMEWORK_DESCRIPTIONS[rec.framework]
    const awDesc = AWARENESS_LEVEL_DESCRIPTIONS[rec.awarenessLevel]
    const mood = FRAMEWORK_IMAGE_MOODS[rec.framework] || null
    const personality = brandPrimaryColor
      ? detectBrandPersonality(brandPrimaryColor, brandSecondaryColor)
      : null

    return NextResponse.json({
      framework: rec.framework,
      frameworkName: fwDesc?.name || rec.framework.toUpperCase(),
      frameworkSubtitle: fwDesc?.subtitle || '',
      frameworkDescription: fwDesc?.description || '',
      frameworkColor: fwDesc?.color || 'blue',
      confidence: rec.confidence,
      reasoning: rec.reasoning,
      awarenessLevel: rec.awarenessLevel,
      awarenessLabel: awDesc?.label || rec.awarenessLevel,
      awarenessDescription: awDesc?.description || '',
      awarenessIcon: awDesc?.icon || '',
      imageMood: mood ? {
        moodOverride: mood.moodOverride,
        lightingStyle: mood.lightingStyle,
      } : null,
      brandPersonality: personality?.personality || null,
      brandMood: personality?.mood || null,
    })
  } catch {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
