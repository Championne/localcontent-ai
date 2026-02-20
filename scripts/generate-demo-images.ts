/**
 * One-shot script: generate 3 hero demo images using GeoSpark's own DALL-E engine.
 * Run: npx tsx scripts/generate-demo-images.ts
 */
import 'dotenv/config'
import { writeFileSync, mkdirSync } from 'fs'
import OpenAI from 'openai'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

const demos = [
  {
    file: 'public/demo/brunch.jpg',
    prompt: `Inviting promotional photograph with cinematic lighting, warm highlights and shallow depth of field. Beautifully plated weekend brunch spread on a rustic wooden café table — avocado toast, poached eggs, fresh berries, and a mimosa in golden morning light. Overhead angle, natural restaurant ambiance, cozy interior with exposed brick. Photorealistic, DSLR quality shot on Canon 50mm f/1.4. CRITICAL: absolutely no text, no letters, no words, no signs, no labels, no menus. All surfaces blank. Single cohesive photograph, not a collage.`,
  },
  {
    file: 'public/demo/flowers.jpg',
    prompt: `High-end editorial photograph with soft natural window light. A lush hand-tied spring bouquet of roses, peonies, ranunculus and eucalyptus in soft pinks, whites and greens, wrapped in kraft paper, resting on a light marble countertop in a bright airy florist studio. Shallow depth of field, muted sophisticated colour palette. Photorealistic, DSLR quality. CRITICAL: absolutely no text, no letters, no words, no labels, no signage, no ribbon text. All surfaces blank. Single cohesive photograph, not a collage.`,
  },
  {
    file: 'public/demo/gym.jpg',
    prompt: `Candid lifestyle photograph with golden hour warmth. Personal trainer guiding a motivated client through a kettlebell workout in a bright modern gym studio, encouraging good form. Natural light streaming through large windows, energetic but focused atmosphere. Warm colour tones, shallow depth of field. Photorealistic, DSLR quality shot on Canon 35mm. CRITICAL: absolutely no text, no letters, no numbers, no signs, no logos on equipment or clothing. All clothing is plain solid colors. All surfaces blank. Single cohesive photograph, not a collage.`,
  },
]

async function main() {
  mkdirSync('public/demo', { recursive: true })

  for (const demo of demos) {
    console.log(`Generating: ${demo.file} ...`)
    const start = Date.now()

    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt: demo.prompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
      style: 'natural',
    })

    const url = response.data?.[0]?.url
    if (!url) {
      console.error(`  FAILED — no URL returned`)
      continue
    }

    const imgRes = await fetch(url)
    const buffer = Buffer.from(await imgRes.arrayBuffer())
    writeFileSync(demo.file, buffer)
    console.log(`  Done (${((Date.now() - start) / 1000).toFixed(1)}s, ${(buffer.length / 1024).toFixed(0)} KB)`)
  }

  console.log('\nAll demo images generated.')
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
