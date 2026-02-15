/**
 * SDXL Client via Replicate
 *
 * When REPLICATE_API_TOKEN is not set, callers should fall back to DALL-E.
 * This module exports an `isSDXLAvailable()` guard for that purpose.
 */

export interface SDXLGenerationOptions {
  prompt: string
  width?: number
  height?: number
  brandColors?: {
    primary: string
    secondary?: string
  }
  negativePrompt?: string
}

export interface SDXLGenerationResult {
  url: string
  cost: number
  model: 'sdxl'
  generationTime: number
}

export function isSDXLAvailable(): boolean {
  return !!process.env.REPLICATE_API_TOKEN
}

export async function generateWithSDXL(
  options: SDXLGenerationOptions
): Promise<SDXLGenerationResult> {
  if (!isSDXLAvailable()) {
    throw new Error('REPLICATE_API_TOKEN is not configured — cannot use SDXL')
  }

  // Dynamic import so the app doesn't explode when replicate isn't installed
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Replicate = (await import('replicate')).default
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! })

  const {
    prompt,
    width = 1024,
    height = 1024,
    brandColors,
    negativePrompt = 'text, watermark, letters, words, labels, signs, low quality, blurry, distorted, deformed',
  } = options

  const startTime = Date.now()

  // Enhance prompt with colour guidance
  let enhancedPrompt = prompt
  if (brandColors?.primary) {
    enhancedPrompt = `${prompt} Color palette influenced by ${brandColors.primary}.`
  }

  console.log('Generating with SDXL:', enhancedPrompt.slice(0, 120))

  const output = await replicate.run(
    'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    {
      input: {
        prompt: enhancedPrompt,
        width,
        height,
        num_outputs: 1,
        scheduler: 'K_EULER',
        num_inference_steps: 30,
        guidance_scale: 7.5,
        negative_prompt: negativePrompt,
        refine: 'expert_ensemble_refiner',
        apply_watermark: false,
      },
    }
  )

  const imageUrl = Array.isArray(output) ? output[0] : output
  const generationTime = Date.now() - startTime

  console.log(`SDXL generation completed in ${generationTime}ms`)

  return {
    url: imageUrl as string,
    cost: 0.005,
    model: 'sdxl',
    generationTime,
  }
}
