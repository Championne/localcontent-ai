# GeoSpark Brand-Aware Image Generation - Complete Implementation Guide
## Autonomous Implementation Instructions for Cursor AI

**Target:** Cursor with Claude Opus (Latest)  
**Objective:** Implement complete brand-aware image generation system with hybrid model approach  
**Timeline:** Work autonomously, implement as much as possible  
**Status:** Production-Ready Implementation

---

## CURSOR START HERE - READ THIS FIRST

You are implementing a complete overhaul of GeoSpark's image generation system. This guide contains everything you need to work autonomously.

### High-Level Strategy:
1. ✅ **Brand personality auto-detection** from colors
2. ✅ **Hybrid model approach:** SDXL for backgrounds ($0.005), DALL-E for complex scenes ($0.04)
3. ✅ **Smart background removal:** Free Sharp method, fallback to Remove.bg
4. ✅ **Product composition:** Natural shadows and placement
5. ✅ **Smart text overlays:** Brand color bars with readable text
6. ✅ **Eliminate Step 3 manual controls:** Auto everything

### What You're Replacing:
- ❌ Complex 300-word prompts
- ❌ Manual logo placement
- ❌ Frame selection
- ❌ Tint overlays
- ❌ Generic images without brand integration

### What You're Building:
- ✅ Simple 50-word brand-aware prompts
- ✅ Automatic brand personality detection
- ✅ Cost-optimized model selection (SDXL vs DALL-E)
- ✅ Native brand integration in images
- ✅ Professional text overlays
- ✅ One-click generation

---

## IMPLEMENTATION CHECKLIST - DO IN THIS ORDER

### Phase 1: Brand Personality System (START HERE)

#### Task 1.1: Create Brand Personality Detection
**File:** `/lib/branding/personality-detection.ts`

Create this file with the following complete implementation:

```typescript
/**
 * Brand Personality Detection System
 * Analyzes brand colors to determine personality and guide image generation
 */

export interface HSL {
  h: number; // Hue: 0-360
  s: number; // Saturation: 0-100
  l: number; // Lightness: 0-100
}

export interface BrandPersonality {
  personality: 'energetic' | 'professional' | 'friendly' | 'luxury';
  mood: string;
  colorDescription: string;
  lightingStyle: string;
  promptModifiers: string;
}

export function hexToHSL(hex: string): HSL {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
  const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
  const b = parseInt(cleanHex.slice(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / delta + 2) / 6;
        break;
      case b:
        h = ((r - g) / delta + 4) / 6;
        break;
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

export function detectBrandPersonality(
  primaryColor: string,
  secondaryColor?: string
): BrandPersonality {
  const hsl = hexToHSL(primaryColor);
  const { h, s, l } = hsl;
  
  // LUXURY: Dark + Saturated (overrides hue)
  if (l < 30 && s > 50) {
    return {
      personality: 'luxury',
      mood: 'sophisticated, premium, exclusive',
      colorDescription: 'deep rich colors with dramatic intensity',
      lightingStyle: 'dramatic moody lighting with deep shadows and selective highlights',
      promptModifiers: 'elegant premium aesthetic, refined sophisticated atmosphere'
    };
  }
  
  // PROFESSIONAL: Low Saturation (overrides hue)
  if (s < 20) {
    return {
      personality: 'professional',
      mood: 'clean, minimal, sophisticated',
      colorDescription: 'neutral subtle tones and muted grays',
      lightingStyle: 'clean even lighting with soft diffusion',
      promptModifiers: 'corporate professional setting, trustworthy reliable feel'
    };
  }
  
  // RED/ORANGE (0-60°)
  if (h >= 0 && h < 60) {
    if (s > 60 && l > 40 && l < 70) {
      return {
        personality: 'energetic',
        mood: 'vibrant, dynamic, bold',
        colorDescription: 'warm reds and oranges with high energy',
        lightingStyle: 'bright warm lighting with strong highlights',
        promptModifiers: 'energetic vibrant atmosphere, bold confident feel'
      };
    } else {
      return {
        personality: 'professional',
        mood: 'confident, reliable, strong',
        colorDescription: 'muted warm tones',
        lightingStyle: 'balanced natural lighting',
        promptModifiers: 'professional dependable setting, confident atmosphere'
      };
    }
  }
  
  // YELLOW/GREEN (60-150°)
  if (h >= 60 && h < 150) {
    return {
      personality: 'friendly',
      mood: 'welcoming, approachable, optimistic',
      colorDescription: 'warm sunny tones and fresh greens',
      lightingStyle: 'soft golden hour glow with warm natural light',
      promptModifiers: 'welcoming friendly atmosphere, approachable cheerful mood'
    };
  }
  
  // BLUE/CYAN (150-250°)
  if (h >= 150 && h < 250) {
    if (s < 30 || l > 70) {
      return {
        personality: 'professional',
        mood: 'calm, trustworthy, clean',
        colorDescription: 'cool blue-gray tones',
        lightingStyle: 'clean diffused light with even illumination',
        promptModifiers: 'professional calm setting, trustworthy clean aesthetic'
      };
    } else {
      return {
        personality: 'friendly',
        mood: 'fresh, reliable, inviting',
        colorDescription: 'bright blues and teals',
        lightingStyle: 'bright natural light with crisp clarity',
        promptModifiers: 'fresh inviting atmosphere, reliable friendly feel'
      };
    }
  }
  
  // PURPLE/MAGENTA (250-330°)
  if (h >= 250 && h < 330) {
    if (s > 40 && l < 50) {
      return {
        personality: 'luxury',
        mood: 'sophisticated, premium, elegant',
        colorDescription: 'deep rich purples and magentas',
        lightingStyle: 'dramatic lighting with rich shadows',
        promptModifiers: 'sophisticated elegant atmosphere, premium exclusive feel'
      };
    } else {
      return {
        personality: 'friendly',
        mood: 'creative, unique, approachable',
        colorDescription: 'soft lavenders and pinks',
        lightingStyle: 'soft diffused lighting with gentle warmth',
        promptModifiers: 'creative approachable atmosphere, unique friendly feel'
      };
    }
  }
  
  return {
    personality: 'friendly',
    mood: 'welcoming, creative, approachable',
    colorDescription: 'balanced warm tones',
    lightingStyle: 'natural even lighting',
    promptModifiers: 'welcoming friendly atmosphere'
  };
}

export function isLightColor(hexColor: string): boolean {
  const hsl = hexToHSL(hexColor);
  return hsl.l > 50;
}

export function getContrastColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? '#000000' : '#FFFFFF';
}

function adjustAlpha(hexColor: string, alpha: number): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export { adjustAlpha };
```

**Testing:** Create test file at `/lib/branding/__tests__/personality-detection.test.ts`:

```typescript
import { detectBrandPersonality, hexToHSL } from '../personality-detection';

describe('Brand Personality Detection', () => {
  test('Red brand should be energetic', () => {
    const result = detectBrandPersonality('#FF0000');
    expect(result.personality).toBe('energetic');
  });
  
  test('Gray brand should be professional', () => {
    const result = detectBrandPersonality('#808080');
    expect(result.personality).toBe('professional');
  });
  
  test('Blue brand should be professional or friendly', () => {
    const result = detectBrandPersonality('#0066CC');
    expect(['professional', 'friendly']).toContain(result.personality);
  });
  
  test('Dark purple should be luxury', () => {
    const result = detectBrandPersonality('#4B0082');
    expect(result.personality).toBe('luxury');
  });
});
```

---

### Phase 2: SDXL Integration (Hybrid Model Approach)

#### Task 2.1: Create SDXL Client
**File:** `/lib/image-generation/sdxl-client.ts`

```typescript
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export interface SDXLGenerationOptions {
  prompt: string;
  width?: number;
  height?: number;
  brandColors?: {
    primary: string;
    secondary?: string;
  };
  negativePrompt?: string;
}

export interface SDXLGenerationResult {
  url: string;
  cost: number;
  model: 'sdxl';
  generationTime: number;
}

export async function generateWithSDXL(
  options: SDXLGenerationOptions
): Promise<SDXLGenerationResult> {
  const {
    prompt,
    width = 1024,
    height = 1024,
    brandColors,
    negativePrompt = 'text, watermark, letters, words, labels, signs, low quality, blurry, distorted, deformed'
  } = options;
  
  const startTime = Date.now();
  
  // Enhance prompt with color guidance
  let enhancedPrompt = prompt;
  if (brandColors?.primary) {
    const colorHint = `Color palette influenced by ${brandColors.primary}.`;
    enhancedPrompt = `${prompt} ${colorHint}`;
  }
  
  console.log('Generating with SDXL:', enhancedPrompt);
  
  try {
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: enhancedPrompt,
          width,
          height,
          num_outputs: 1,
          scheduler: "K_EULER",
          num_inference_steps: 30,
          guidance_scale: 7.5,
          negative_prompt: negativePrompt,
          refine: "expert_ensemble_refiner",
          apply_watermark: false
        }
      }
    );
    
    const imageUrl = Array.isArray(output) ? output[0] : output;
    const generationTime = Date.now() - startTime;
    
    console.log(`SDXL generation completed in ${generationTime}ms`);
    
    return {
      url: imageUrl as string,
      cost: 0.005,
      model: 'sdxl',
      generationTime
    };
  } catch (error) {
    console.error('SDXL generation failed:', error);
    throw new Error(`SDXL generation failed: ${(error as Error).message}`);
  }
}

export function isSDXLAvailable(): boolean {
  return !!process.env.REPLICATE_API_TOKEN;
}
```

#### Task 2.2: Update Image Generation with Hybrid Model Selection
**File:** `/lib/openai/images.ts`

Add these imports at the top:
```typescript
import { detectBrandPersonality, type BrandPersonality } from '@/lib/branding/personality-detection';
import { generateWithSDXL, isSDXLAvailable } from '@/lib/image-generation/sdxl-client';
```

Update the GenerateImageParams interface:
```typescript
export interface GenerateImageParams {
  topic: string;
  businessName: string;
  industry: string;
  style: ImageStyle;
  contentType?: string;
  brandColors?: {
    primary: string;
    secondary?: string;
  };
  hasProductImage?: boolean;
  requiresComplexScene?: boolean; // For model selection
  forceModel?: 'dalle3' | 'sdxl'; // Override model selection
}
```

Add new function for model selection:
```typescript
function selectOptimalModel(params: GenerateImageParams): 'dalle3' | 'sdxl' {
  // Override if specified
  if (params.forceModel) {
    return params.forceModel;
  }
  
  // Check if SDXL is available
  if (!isSDXLAvailable()) {
    console.log('SDXL not available, using DALL-E 3');
    return 'dalle3';
  }
  
  // Use SDXL for simple product backgrounds
  if (params.hasProductImage && !params.requiresComplexScene) {
    console.log('Using SDXL for product background (cost-optimized)');
    return 'sdxl';
  }
  
  // Use DALL-E for complex service worker scenes
  if (!params.hasProductImage || params.requiresComplexScene) {
    console.log('Using DALL-E 3 for complex scene (quality-optimized)');
    return 'dalle3';
  }
  
  // Default to DALL-E
  return 'dalle3';
}
```

Replace buildImagePrompt with brand-aware version:
```typescript
function buildBrandAwarePrompt(params: GenerateImageParams): string {
  const { topic, industry, brandColors, hasProductImage } = params;
  
  // Auto-detect brand personality if colors provided
  let personality: BrandPersonality | null = null;
  if (brandColors?.primary) {
    personality = detectBrandPersonality(
      brandColors.primary,
      brandColors.secondary
    );
    console.log(`Detected brand personality: ${personality.personality}`);
  }
  
  // Determine prompt type
  let focalPrompt: string;
  
  if (hasProductImage) {
    // Workflow A: Generate branded background for product
    focalPrompt = getBrandedBackgroundPrompt(industry, personality);
  } else {
    // Workflow B: Generate service/focal image with brand
    focalPrompt = getServiceFocalPrompt(industry, topic, personality);
  }
  
  return `${focalPrompt} No text anywhere in the image.`;
}

function getBrandedBackgroundPrompt(
  industry: string,
  personality: BrandPersonality | null
): string {
  const environment = getEnvironment(industry);
  
  if (!personality) {
    return `Clean professional surface for product photography in ${environment}. 
            Soft natural shadows. Ample negative space in center. Modern clean aesthetic.`;
  }
  
  return `Clean professional surface for product photography in ${environment}.
          ${personality.mood} aesthetic.
          ${personality.colorDescription} integrated subtly into lighting and surfaces.
          ${personality.lightingStyle}.
          ${personality.promptModifiers}.
          Ample negative space in center for product placement.
          Soft natural shadows.
          No objects, no products, no text.`;
}

function getServiceFocalPrompt(
  industry: string,
  topic: string,
  personality: BrandPersonality | null
): string {
  const person = getPersonType(industry);
  const action = sanitizeTopic(topic);
  const environment = getEnvironment(industry);
  
  if (!personality) {
    return `Close-up of ${person} actively working on ${action}.
            Face showing concentration. Hands with professional tools.
            ${environment} setting. Natural window light.
            One focal point: hands and tools.`;
  }
  
  return `Close-up of ${person} actively working on ${action}.
          Face showing genuine concentration.
          Hands in action with professional tools.
          ${environment} setting.
          ${personality.mood} atmosphere.
          ${personality.colorDescription} subtly present in environment.
          ${personality.lightingStyle}.
          ${personality.promptModifiers}.
          One focal point: hands and tools.`;
}
```

Update the main generateImage function:
```typescript
export async function generateImage(params: GenerateImageParams): Promise<GenerateImageResult> {
  const model = selectOptimalModel(params);
  const prompt = buildBrandAwarePrompt(params);
  
  const startTime = Date.now();
  
  if (model === 'sdxl') {
    const result = await generateWithSDXL({
      prompt,
      width: 1024,
      height: 1024,
      brandColors: params.brandColors
    });
    
    return {
      url: result.url,
      style: params.style,
      size: '1024x1024',
      revisedPrompt: prompt,
      fullPrompt: prompt,
      model: 'sdxl',
      cost: result.cost,
      generationTime: result.generationTime
    };
  }
  
  // DALL-E 3 generation (existing code)
  const client = getOpenAIClient();
  const imageSize = '1024x1024';
  
  try {
    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: imageSize,
      quality: 'standard',
      style: 'natural',
    });
    
    const imageUrl = response.data[0]?.url;
    const revisedPrompt = response.data[0]?.revised_prompt;
    
    if (!imageUrl) {
      throw new Error('No image URL returned from DALL-E');
    }
    
    const generationTime = Date.now() - startTime;
    
    return {
      url: imageUrl,
      style: params.style,
      size: imageSize,
      revisedPrompt: revisedPrompt,
      fullPrompt: prompt,
      model: 'dalle3',
      cost: 0.04,
      generationTime
    };
  } catch (error: unknown) {
    console.error('Image generation error:', error);
    throw error;
  }
}
```

Add to GenerateImageResult interface:
```typescript
export interface GenerateImageResult {
  url: string;
  style: string;
  subVariation?: string | null;
  size: string;
  revisedPrompt?: string;
  fullPrompt: string;
  model?: 'dalle3' | 'sdxl';
  cost?: number;
  generationTime?: number;
}
```

---

### Phase 3: Background Removal System

#### Task 3.1: Create Background Removal
**File:** `/lib/image-processing/background-removal.ts`

```typescript
import sharp from 'sharp';

export interface BackgroundRemovalResult {
  buffer: Buffer;
  method: 'free' | 'paid';
  cost: number;
  quality: number;
}

export async function smartBackgroundRemoval(
  imageBuffer: Buffer
): Promise<BackgroundRemovalResult> {
  console.log('Starting smart background removal...');
  
  // Try free method first
  const simpleResult = await sharpBackgroundRemoval(imageBuffer);
  const quality = await assessRemovalQuality(simpleResult, imageBuffer);
  
  console.log(`Free removal quality: ${quality.toFixed(2)}`);
  
  if (quality >= 0.7) {
    console.log('✓ Using free method');
    return {
      buffer: simpleResult,
      method: 'free',
      cost: 0,
      quality
    };
  }
  
  // Fallback to Remove.bg if available
  if (!process.env.REMOVE_BG_API_KEY) {
    console.warn('Remove.bg not configured, using free method anyway');
    return {
      buffer: simpleResult,
      method: 'free',
      cost: 0,
      quality
    };
  }
  
  console.log('⚠ Using Remove.bg ($0.20)');
  
  try {
    const removeBgResult = await removeBgAPI(imageBuffer);
    return {
      buffer: removeBgResult,
      method: 'paid',
      cost: 0.20,
      quality: 0.95
    };
  } catch (error) {
    console.error('Remove.bg failed, using free method:', error);
    return {
      buffer: simpleResult,
      method: 'free',
      cost: 0,
      quality
    };
  }
}

async function sharpBackgroundRemoval(imageBuffer: Buffer): Promise<Buffer> {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  
  // Sample corner for background color
  const { data } = await image
    .extract({ left: 0, top: 0, width: 10, height: 10 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const avgR = data[0];
  const avgG = data[1];
  const avgB = data[2];
  
  // Create alpha mask based on color similarity
  const rawData = await image.clone().removeAlpha().toColourspace('srgb').raw().toBuffer();
  const maskData = Buffer.alloc(metadata.width! * metadata.height!);
  
  for (let i = 0; i < rawData.length; i += metadata.channels || 3) {
    const r = rawData[i];
    const g = rawData[i + 1];
    const b = rawData[i + 2];
    
    const distance = Math.sqrt(
      Math.pow(r - avgR, 2) +
      Math.pow(g - avgG, 2) +
      Math.pow(b - avgB, 2)
    );
    
    const alpha = distance < 40 ? 0 : 255;
    maskData[i / (metadata.channels || 3)] = alpha;
  }
  
  const mask = await sharp(maskData, {
    raw: {
      width: metadata.width!,
      height: metadata.height!,
      channels: 1
    }
  }).toBuffer();
  
  return image.joinChannel(mask).png().toBuffer();
}

async function removeBgAPI(imageBuffer: Buffer): Promise<Buffer> {
  const FormData = require('form-data');
  const fetch = (await import('node-fetch')).default;
  
  const formData = new FormData();
  formData.append('image_file', imageBuffer, {
    filename: 'image.png',
    contentType: 'image/png',
  });
  formData.append('size', 'auto');
  
  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': process.env.REMOVE_BG_API_KEY!,
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`Remove.bg error: ${response.status}`);
  }
  
  return Buffer.from(await response.arrayBuffer());
}

async function assessRemovalQuality(
  result: Buffer,
  original: Buffer
): Promise<number> {
  try {
    const resultImage = sharp(result);
    const metadata = await resultImage.metadata();
    
    if (!metadata.hasAlpha) {
      return 0.3;
    }
    
    const { data } = await resultImage
      .extractChannel(3)
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    let transparentPixels = 0;
    let opaquePixels = 0;
    
    for (let i = 0; i < data.length; i++) {
      if (data[i] < 10) transparentPixels++;
      else if (data[i] > 245) opaquePixels++;
    }
    
    const total = data.length;
    const transparencyRatio = transparentPixels / total;
    const opaqueRatio = opaquePixels / total;
    
    if (transparencyRatio > 0.3 && transparencyRatio < 0.7 && opaqueRatio > 0.5) {
      return 0.85;
    }
    
    if (transparencyRatio > 0.2 && transparencyRatio < 0.8 && opaqueRatio > 0.3) {
      return 0.65;
    }
    
    return 0.4;
  } catch (error) {
    return 0.5;
  }
}
```

---

### Phase 4: Product Composition

#### Task 4.1: Create Product Composition
**File:** `/lib/image-processing/product-composition.ts`

```typescript
import sharp from 'sharp';

export interface CompositionOptions {
  productScale?: number;
  position?: 'center' | 'rule-of-thirds';
  addShadow?: boolean;
  shadowIntensity?: number;
}

export async function compositeProduct(
  backgroundBuffer: Buffer,
  productBuffer: Buffer,
  brandColor: string,
  options: CompositionOptions = {}
): Promise<Buffer> {
  const {
    productScale = 0.6,
    position = 'center',
    addShadow = true,
    shadowIntensity = 0.3
  } = options;
  
  const bgMeta = await sharp(backgroundBuffer).metadata();
  const prodMeta = await sharp(productBuffer).metadata();
  
  const bgWidth = bgMeta.width || 1024;
  const bgHeight = bgMeta.height || 1024;
  const prodWidth = prodMeta.width || 512;
  const prodHeight = prodMeta.height || 512;
  
  const maxProductWidth = Math.round(bgWidth * productScale);
  const aspectRatio = prodHeight / prodWidth;
  let scaledHeight = Math.round(maxProductWidth * aspectRatio);
  
  let finalWidth = maxProductWidth;
  let finalHeight = scaledHeight;
  
  if (scaledHeight > bgHeight * productScale) {
    finalHeight = Math.round(bgHeight * productScale);
    finalWidth = Math.round(finalHeight / aspectRatio);
  }
  
  const resizedProduct = await sharp(productBuffer)
    .resize(finalWidth, finalHeight, { 
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();
  
  let posX: number, posY: number;
  
  if (position === 'center') {
    posX = Math.round((bgWidth - finalWidth) / 2);
    posY = Math.round((bgHeight - finalHeight) / 2);
  } else {
    posX = Math.round((bgWidth - finalWidth) / 2);
    posY = Math.round(bgHeight * 0.4 - finalHeight / 2);
  }
  
  let productWithShadow = resizedProduct;
  if (addShadow) {
    productWithShadow = await addNaturalShadow(
      resizedProduct,
      finalWidth,
      finalHeight,
      shadowIntensity
    );
  }
  
  return sharp(backgroundBuffer)
    .composite([{
      input: productWithShadow,
      left: posX,
      top: posY,
      blend: 'over'
    }])
    .toBuffer();
}

async function addNaturalShadow(
  productBuffer: Buffer,
  width: number,
  height: number,
  intensity: number = 0.3
): Promise<Buffer> {
  const shadowOffset = Math.round(Math.max(width, height) * 0.02);
  const shadowBlur = Math.round(Math.max(width, height) * 0.04);
  
  const shadowSvg = Buffer.from(`
    <svg width="${width + shadowOffset * 3}" height="${height + shadowOffset * 3}">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="${shadowBlur}"/>
          <feOffset dx="${shadowOffset}" dy="${shadowOffset}" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="${intensity}"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <image 
          href="data:image/png;base64,${productBuffer.toString('base64')}" 
          x="${shadowOffset}" 
          y="${shadowOffset}" 
          width="${width}" 
          height="${height}"
        />
      </g>
    </svg>
  `);
  
  return sharp(shadowSvg).png().toBuffer();
}
```

---

### Phase 5: Smart Text Overlays

#### Task 5.1: Create Smart Text Overlay System
**File:** `/lib/image-processing/smart-text-overlay.ts`

```typescript
import sharp from 'sharp';
import { getContrastColor, adjustAlpha } from '@/lib/branding/personality-detection';

export interface TextOverlayOptions {
  headline: string;
  businessName: string;
  brandColor: string;
  position?: 'top' | 'bottom' | 'center';
  barOpacity?: number;
}

export async function addSmartTextOverlay(
  imageBuffer: Buffer,
  options: TextOverlayOptions
): Promise<Buffer> {
  const {
    headline,
    businessName,
    brandColor,
    position = 'bottom',
    barOpacity = 0.90
  } = options;
  
  const meta = await sharp(imageBuffer).metadata();
  const width = meta.width || 1024;
  const height = meta.height || 1024;
  
  const barColor = adjustAlpha(brandColor, barOpacity);
  const textColor = getContrastColor(brandColor);
  
  const barPadding = 20;
  const barHeight = 90;
  let barY: number;
  
  if (position === 'bottom') {
    barY = height - barHeight - barPadding;
  } else if (position === 'top') {
    barY = barPadding;
  } else {
    barY = (height - barHeight) / 2;
  }
  
  const scaleFactor = width / 1024;
  const headlineFontSize = Math.round(48 * scaleFactor);
  const businessNameFontSize = Math.round(24 * scaleFactor);
  
  const svgOverlay = createTextBarSVG({
    width,
    height,
    barY,
    barHeight,
    barPadding,
    barColor,
    textColor,
    headline,
    businessName,
    headlineFontSize,
    businessNameFontSize
  });
  
  return sharp(imageBuffer)
    .composite([{ input: svgOverlay, blend: 'over' }])
    .toBuffer();
}

function createTextBarSVG(params: {
  width: number;
  height: number;
  barY: number;
  barHeight: number;
  barPadding: number;
  barColor: string;
  textColor: string;
  headline: string;
  businessName: string;
  headlineFontSize: number;
  businessNameFontSize: number;
}): Buffer {
  const {
    width, height, barY, barHeight, barPadding,
    barColor, textColor, headline, businessName,
    headlineFontSize, businessNameFontSize
  } = params;
  
  const barX = barPadding;
  const barWidth = width - (barPadding * 2);
  const textCenterX = width / 2;
  const headlineY = barY + (barHeight * 0.4);
  const businessNameY = barY + (barHeight * 0.75);
  
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="barShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
          <feOffset dx="0" dy="2"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <rect 
        x="${barX}" y="${barY}" width="${barWidth}" height="${barHeight}" 
        rx="12" fill="${barColor}" filter="url(#barShadow)"
      />
      
      <text 
        x="${textCenterX}" y="${headlineY}" 
        font-family="Inter, sans-serif"
        font-size="${headlineFontSize}" font-weight="900"
        fill="${textColor}" text-anchor="middle" dominant-baseline="middle"
      >${escapeXml(headline)}</text>
      
      <text 
        x="${textCenterX}" y="${businessNameY}" 
        font-family="Inter, sans-serif"
        font-size="${businessNameFontSize}" font-weight="600"
        fill="${textColor}" text-anchor="middle" dominant-baseline="middle" opacity="0.95"
      >${escapeXml(businessName.toUpperCase())}</text>
    </svg>
  `);
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function extractHeadline(topic: string): string {
  const percentMatch = topic.match(/(\d+%\s*(?:off|discount))/i);
  if (percentMatch) return percentMatch[1].toUpperCase();
  
  const dollarMatch = topic.match(/(\$\d+(?:\.\d{2})?)/);
  if (dollarMatch) return dollarMatch[1];
  
  const promoKeywords = ['new', 'sale', 'special', 'limited', 'free', 'today', 'now'];
  const words = topic.toLowerCase().split(/\s+/);
  const promoWords = words.filter(word => 
    promoKeywords.some(keyword => word.includes(keyword))
  );
  
  if (promoWords.length > 0) {
    return promoWords.slice(0, 3).join(' ').toUpperCase();
  }
  
  const significantWords = words.filter(word => 
    word.length > 3 && !['the', 'and', 'for', 'with'].includes(word)
  );
  
  if (significantWords.length > 0) {
    return significantWords.slice(0, 2).join(' ').toUpperCase();
  }
  
  return topic.slice(0, 20).toUpperCase();
}
```

---

### Phase 6: Update API Route

#### Task 6.1: Update Image Generation API
**File:** `/app/api/content/generate-image/route.ts`

Replace entire file with:

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateImage } from '@/lib/openai/images';
import { smartBackgroundRemoval } from '@/lib/image-processing/background-removal';
import { compositeProduct } from '@/lib/image-processing/product-composition';
import { addSmartTextOverlay, extractHeadline } from '@/lib/image-processing/smart-text-overlay';
import { detectBrandPersonality } from '@/lib/branding/personality-detection';

export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const {
      topic,
      businessName,
      industry,
      brandColors,
      productImage,
      addTextOverlay = true,
      contentType = 'social-post'
    } = await request.json();
    
    if (!topic || !businessName || !industry) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    let finalBuffer: Buffer;
    let totalCost = 0;
    let removalMethod: 'free' | 'paid' | 'none' = 'none';
    let model: 'dalle3' | 'sdxl' = 'dalle3';
    
    const personality = brandColors?.primary 
      ? detectBrandPersonality(brandColors.primary, brandColors.secondary)
      : null;
    
    console.log(`Brand personality: ${personality?.personality || 'none'}`);
    
    // WORKFLOW A: With Product Image
    if (productImage) {
      console.log('Workflow A: Product image generation');
      
      // 1. Remove background
      const productBuffer = Buffer.from(
        productImage.replace(/^data:image\/\w+;base64,/, ''), 
        'base64'
      );
      const { buffer: cleanProduct, method, cost: bgCost } = 
        await smartBackgroundRemoval(productBuffer);
      
      totalCost += bgCost;
      removalMethod = method;
      
      // 2. Generate branded background (use SDXL if available)
      const bgResult = await generateImage({
        topic,
        businessName,
        industry,
        style: 'professional',
        hasProductImage: true,
        brandColors,
        contentType,
        requiresComplexScene: false // Simple background, use SDXL
      });
      
      totalCost += bgResult.cost || 0.04;
      model = bgResult.model || 'dalle3';
      
      const bgResponse = await fetch(bgResult.url);
      const bgBuffer = Buffer.from(await bgResponse.arrayBuffer());
      
      // 3. Composite product
      finalBuffer = await compositeProduct(
        bgBuffer,
        cleanProduct,
        brandColors.primary,
        { productScale: 0.6, addShadow: true }
      );
    } 
    // WORKFLOW B: Service Workers
    else {
      console.log('Workflow B: Service image generation');
      
      const result = await generateImage({
        topic,
        businessName,
        industry,
        style: 'authentic',
        hasProductImage: false,
        brandColors,
        contentType,
        requiresComplexScene: true // Complex scene, use DALL-E
      });
      
      totalCost += result.cost || 0.04;
      model = result.model || 'dalle3';
      
      const response = await fetch(result.url);
      finalBuffer = Buffer.from(await response.arrayBuffer());
    }
    
    // 4. Add text overlay
    if (addTextOverlay && brandColors?.primary) {
      const headline = extractHeadline(topic);
      if (headline) {
        finalBuffer = await addSmartTextOverlay(finalBuffer, {
          headline,
          businessName,
          brandColor: brandColors.primary
        });
      }
    }
    
    // 5. Upload to storage
    const filename = `${user.id}/generated_${Date.now()}.jpg`;
    
    const { error: uploadError } = await supabase.storage
      .from('generated-images')
      .upload(filename, finalBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Upload failed' },
        { status: 500 }
      );
    }
    
    const { data: urlData } = supabase.storage
      .from('generated-images')
      .getPublicUrl(filename);
    
    return NextResponse.json({
      url: urlData.publicUrl,
      success: true,
      cost: totalCost,
      personality: personality?.personality || 'neutral',
      removalMethod,
      model,
      hasProduct: !!productImage
    });
    
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: 'Generation failed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
```

---

### Phase 7: Environment & Dependencies

#### Task 7.1: Update Environment Variables
Add to `.env.local`:

```bash
# SDXL via Replicate (required for cost optimization)
REPLICATE_API_TOKEN=r8_your_token_here

# Remove.bg (optional, for complex backgrounds)
REMOVE_BG_API_KEY=your_key_here

# Existing
OPENAI_API_KEY=sk-xxx
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

#### Task 7.2: Update package.json
Add dependencies:

```json
{
  "dependencies": {
    "replicate": "^0.25.0",
    "sharp": "^0.33.0",
    "openai": "^4.20.0",
    "form-data": "^4.0.0"
  }
}
```

Install:
```bash
npm install replicate sharp form-data
```

---

## TESTING PROTOCOL

After implementing all files, test in this order:

### Test 1: Brand Detection
```typescript
// Create test-brand-detection.ts
import { detectBrandPersonality } from './lib/branding/personality-detection';

console.log('Red:', detectBrandPersonality('#FF0000'));
console.log('Blue:', detectBrandPersonality('#0000FF'));
console.log('Gray:', detectBrandPersonality('#808080'));
console.log('Purple:', detectBrandPersonality('#8B00FF'));
```

Expected: Different personalities for different colors.

### Test 2: SDXL Generation
```bash
# Test SDXL if token is configured
curl -X POST http://localhost:3000/api/content/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Professional Surface",
    "businessName": "Test Co",
    "industry": "retail",
    "brandColors": {"primary": "#FF5733"},
    "productImage": null
  }'
```

Expected: Image generated, model should be "sdxl" or "dalle3".

### Test 3: Full Workflow A (Product)
With a test product image (base64).

### Test 4: Full Workflow B (Service)
Without product image.

---

## ERROR HANDLING

If you encounter errors:

1. **SDXL not available:** System will fall back to DALL-E 3
2. **Remove.bg fails:** System will use free Sharp method
3. **Any generation fails:** Log error and return 500

All errors should be logged to console for debugging.

---

## DEPLOYMENT CHECKLIST

Before considering complete:

- [ ] All 6 main files created
- [ ] Dependencies installed
- [ ] Environment variables set
- [ ] Tests pass for brand detection
- [ ] At least one successful image generation
- [ ] Cost tracking works
- [ ] Model selection logic works
- [ ] Text overlays appear correctly
- [ ] No TypeScript errors
- [ ] Console logs show model selection

---

## SUCCESS CRITERIA

You've succeeded when:

1. ✅ Brand personality detection works
2. ✅ SDXL generates backgrounds (if token configured)
3. ✅ DALL-E generates service images
4. ✅ Background removal works (free or paid)
5. ✅ Product composition works
6. ✅ Text overlays are readable
7. ✅ Cost tracking is accurate
8. ✅ No blocking errors

---

## NOTES FOR CURSOR

- Work methodically through phases
- Test each component before moving to next
- If blocked on one part, move to next and come back
- Log everything for debugging
- Don't worry about perfection, focus on functionality
- If SDXL token not available, DALL-E fallback is fine
- If Remove.bg not available, free method is fine

---

## WHAT NOT TO DO

- ❌ Don't modify existing unrelated files
- ❌ Don't change database schemas
- ❌ Don't update authentication
- ❌ Don't modify routing (except specified API route)
- ❌ Don't change UI yet (that's later)

---

## WHEN STUCK

If you get stuck or unsure:

1. Check console logs
2. Verify environment variables
3. Test components individually
4. Fall back to simpler approach
5. Document what's not working in a file called `IMPLEMENTATION_ISSUES.md`

---

## FINAL OUTPUT

When done, create a file: `/docs/IMPLEMENTATION_COMPLETE.md` with:

- What was implemented
- What works
- What doesn't work
- Test results
- Next steps needed

---

**START WITH PHASE 1, WORK THROUGH SYSTEMATICALLY. GOOD LUCK!** 🚀
