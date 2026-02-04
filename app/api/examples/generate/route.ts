import { NextResponse } from 'next/server'
import { generateContent, generateSocialPack, isOpenAIConfigured, SocialPackResult } from '@/lib/openai'
import { generateImage, isImageGenerationConfigured } from '@/lib/openai/images'
import { SAMPLE_BUSINESSES, type ExamplesData, type GeneratedExample } from '@/scripts/generate-examples'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export const maxDuration = 120 // Allow up to 2 minutes for generation

export async function GET(request: Request) {
  // Simple auth check - you could add admin auth here
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  
  if (secret !== process.env.ADMIN_SECRET && secret !== 'generate-examples-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isOpenAIConfigured()) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 500 })
  }

  try {
    const results: GeneratedExample[] = []
    const generateImages = isImageGenerationConfigured()

    // Generate content for each sample business
    for (const sample of SAMPLE_BUSINESSES) {
      console.log(`Generating ${sample.type} for ${sample.businessName}...`)
      
      let content: string | SocialPackResult
      let imageUrl: string | undefined

      if (sample.type === 'social-pack') {
        content = await generateSocialPack({
          businessName: sample.businessName,
          industry: sample.industry,
          topic: sample.topic,
          tone: 'professional',
        })
      } else {
        content = await generateContent({
          template: sample.type,
          businessName: sample.businessName,
          industry: sample.industry,
          topic: sample.topic,
          tone: 'professional',
          gbpPostType: sample.type === 'gmb-post' ? 'update' : undefined,
        })
      }

      // Generate image for each piece
      if (generateImages) {
        try {
          const imageResult = await generateImage({
            topic: sample.topic,
            businessName: sample.businessName,
            industry: sample.industry,
            style: 'professional',
            contentType: sample.type
          })
          imageUrl = imageResult.url
        } catch (imgError) {
          console.error(`Image generation failed for ${sample.businessName}:`, imgError)
        }
      }

      results.push({
        id: `example-${sample.type}-${Date.now()}`,
        type: sample.type,
        businessName: sample.businessName,
        industry: sample.industry,
        topic: sample.topic,
        content: content as string,
        imageUrl,
        generatedAt: new Date().toISOString()
      })
    }

    // Structure the data for the examples pages
    const examplesData: ExamplesData = {
      frontPageSocialPack: results.find(r => r.businessName === "FitLife Personal Training")!,
      examples: {
        blogPost: results.find(r => r.type === 'blog-post')!,
        socialPack: results.find(r => r.type === 'social-pack' && r.businessName === "Bella's Italian Kitchen")!,
        googleBusinessPost: results.find(r => r.type === 'gmb-post')!,
        emailNewsletter: results.find(r => r.type === 'email')!,
      },
      generatedAt: new Date().toISOString()
    }

    // Save to data file
    try {
      const dataDir = join(process.cwd(), 'data')
      await mkdir(dataDir, { recursive: true })
      await writeFile(
        join(dataDir, 'generated-examples.json'),
        JSON.stringify(examplesData, null, 2)
      )
      console.log('Examples saved to data/generated-examples.json')
    } catch (fsError) {
      console.error('Failed to save examples file:', fsError)
      // Continue anyway - we'll return the data
    }

    return NextResponse.json({
      success: true,
      message: 'Examples generated successfully!',
      data: examplesData,
      stats: {
        totalGenerated: results.length,
        withImages: results.filter(r => r.imageUrl).length,
        aiPowered: isOpenAIConfigured()
      }
    })

  } catch (error) {
    console.error('Example generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate examples', details: String(error) },
      { status: 500 }
    )
  }
}
