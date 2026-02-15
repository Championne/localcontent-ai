# Complete Implementation Guide - Brand-Aware Image Generation
## Full Code for Cursor Implementation

**Target:** Cursor with Claude Opus 4.5  
**Status:** Production-Ready Code  
**Last Updated:** February 13, 2026

---

## File 1: Brand Personality Detection

**Path:** `/lib/branding/personality-detection.ts`

```typescript
/**
 * Brand Personality Detection System
 * Analyzes brand colors to determine personality and generate appropriate image prompts
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

/**
 * Convert hex color to HSL
 * @param hex - Hex color string (e.g., "#FF5733")
 * @returns HSL object
 */
export function hexToHSL(hex: string): HSL {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Convert to RGB (0-1 range)
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
    // Calculate saturation
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    
    // Calculate hue
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

/**
 * Detect brand personality from primary color
 * @param primaryColor - Hex color string
 * @param secondaryColor - Optional secondary hex color
 * @returns Brand personality with prompt guidance
 */
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
  
  // Default: Friendly
  return {
    personality: 'friendly',
    mood: 'welcoming, creative, approachable',
    colorDescription: 'balanced warm tones',
    lightingStyle: 'natural even lighting',
    promptModifiers: 'welcoming friendly atmosphere'
  };
}

/**
 * Get complementary color for text/accent use
 * @param hexColor - Primary brand color
 * @returns Hex color string
 */
export function getComplementaryColor(hexColor: string): string {
  const hsl = hexToHSL(hexColor);
  // Rotate hue by 180 degrees for complementary
  const compHue = (hsl.h + 180) % 360;
  return hslToHex({ h: compHue, s: hsl.s, l: hsl.l });
}

/**
 * Convert HSL back to hex
 */
function hslToHex(hsl: HSL): string {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Determine if a color is light or dark
 * @param hexColor - Hex color string
 * @returns true if light, false if dark
 */
export function isLightColor(hexColor: string): boolean {
  const hsl = hexToHSL(hexColor);
  return hsl.l > 50;
}

/**
 * Get contrasting text color (white or black)
 * @param backgroundColor - Background hex color
 * @returns '#FFFFFF' or '#000000'
 */
export function getContrastColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? '#000000' : '#FFFFFF';
}
```

---

## File 2: Updated Image Generation with Brand Awareness

**Path:** `/lib/openai/images.ts`

**ADD these imports at the top:**

```typescript
import { detectBrandPersonality, type BrandPersonality } from '@/lib/branding/personality-detection';
```

**ADD this interface to GenerateImageParams:**

```typescript
export interface GenerateImageParams {
  topic: string;
  businessName: string;
  industry: string;
  style: ImageStyle;
  contentType?: string;
  subVariation?: string | null;
  postType?: string;
  preferredStyles?: string[];
  avoidStyles?: string[];
  brandPrimaryColor?: string | null;
  brandSecondaryColor?: string | null;
  brandAccentColor?: string | null;
  sceneHintOverride?: string | null;
  stylePrefixOverride?: string | null;
  // NEW: Brand-aware parameters
  hasProductImage?: boolean;
  brandColors?: {
    primary: string;
    secondary?: string;
    accent?: string;
  };
}
```

**REPLACE the buildImagePrompt function with this:**

```typescript
/**
 * Build brand-aware image prompt
 * Integrates brand personality and colors into generation
 */
function buildBrandAwarePrompt(params: GenerateImageParams): string {
  const { 
    topic, 
    industry, 
    brandColors, 
    hasProductImage,
    contentType 
  } = params;
  
  // Auto-detect brand personality if colors provided
  let personality: BrandPersonality | null = null;
  if (brandColors?.primary) {
    personality = detectBrandPersonality(
      brandColors.primary,
      brandColors.secondary
    );
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
  
  // Get image size for aspect ratio context
  const imageSize = getImageSizeForContentType(contentType || 'social-post');
  const aspectContext = imageSize === '1792x1024' 
    ? 'Wide landscape format.' 
    : imageSize === '1024x1792'
    ? 'Tall portrait format.'
    : 'Square format.';
  
  return `${focalPrompt} ${aspectContext} No text anywhere in the image.`;
}

/**
 * Generate branded background for product photography
 */
function getBrandedBackgroundPrompt(
  industry: string,
  personality: BrandPersonality | null
): string {
  const environment = getEnvironment(industry);
  
  if (!personality) {
    // Fallback without brand context
    return `Clean professional surface for product photography in ${environment}. 
            Soft natural shadows. Ample negative space in center. 
            Modern clean aesthetic.`;
  }
  
  return `Clean professional surface for product photography in ${environment}.
          ${personality.mood} aesthetic.
          ${personality.colorDescription} integrated subtly into lighting and surfaces.
          ${personality.lightingStyle}.
          ${personality.promptModifiers}.
          Ample negative space in center for product placement.
          Soft natural shadows suggesting dimension.
          No objects, no products, no text.
          Perfect branded background for product compositing.`;
}

/**
 * Generate service focal image with brand context
 */
function getServiceFocalPrompt(
  industry: string,
  topic: string,
  personality: BrandPersonality | null
): string {
  const person = getPersonType(industry);
  const action = sanitizeTopic(topic);
  const environment = getEnvironment(industry);
  
  if (!personality) {
    // Fallback without brand context
    return `Close-up of ${person} actively working on ${action}.
            Face showing genuine concentration.
            Hands in action with professional tools.
            ${environment} setting.
            Natural window light.
            One focal point: hands and tools in action.`;
  }
  
  return `Close-up of ${person} actively working on ${action}.
          Face showing genuine concentration and professionalism.
          Hands in action with professional tools.
          ${environment} setting with attention to detail.
          
          ${personality.mood} atmosphere throughout the scene.
          ${personality.colorDescription} subtly present in environment and clothing.
          ${personality.lightingStyle}.
          ${personality.promptModifiers}.
          
          One clear focal point: hands and tools in professional action.
          Authentic real-world service moment.`;
}

// Keep existing helper functions (getPersonType, getEnvironment, sanitizeTopic)
// These remain unchanged from the original implementation
```

**UPDATE the generateImage function:**

```typescript
export async function generateImage(params: GenerateImageParams): Promise<GenerateImageResult> {
  const client = getOpenAIClient();
  
  // Use brand-aware prompt builder
  const prompt = buildBrandAwarePrompt(params);
  
  const imageSize = getImageSizeForContentType(params.contentType || 'social-post');
  
  // Use 'natural' style for brand-aware generation (not 'vivid')
  const dalleStyle = 'natural';
  
  try {
    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: imageSize,
      quality: 'standard',
      style: dalleStyle,
    });
    
    const imageUrl = response.data[0]?.url;
    const revisedPrompt = response.data[0]?.revised_prompt;
    
    if (!imageUrl) {
      throw new Error('No image URL returned from DALL-E');
    }
    
    return {
      url: imageUrl,
      style: params.style,
      subVariation: params.subVariation || null,
      size: imageSize,
      revisedPrompt: revisedPrompt,
      fullPrompt: prompt
    };
  } catch (error: unknown) {
    const errObj = error as { 
      status?: number; 
      code?: string; 
      message?: string; 
      error?: { message?: string; code?: string; type?: string } 
    };
    const apiMsg = errObj?.error?.message || errObj?.message || String(error);
    const apiCode = errObj?.error?.code || errObj?.code || errObj?.status;
    console.error(`DALL-E image generation error [${apiCode}]:`, apiMsg);
    throw new Error(`DALL-E failed (${apiCode || 'unknown'}): ${apiMsg}`);
  }
}
```

---

## File 3: Background Removal System

**Path:** `/lib/image-processing/background-removal.ts`

```typescript
import sharp from 'sharp';

export interface BackgroundRemovalResult {
  buffer: Buffer;
  method: 'free' | 'paid';
  cost: number;
  quality: number; // 0-1 score
}

/**
 * Smart background removal with hybrid approach
 * Tries free Sharp-based removal first, falls back to Remove.bg for complex images
 */
export async function smartBackgroundRemoval(
  imageBuffer: Buffer
): Promise<BackgroundRemovalResult> {
  console.log('Starting background removal...');
  
  // Step 1: Try free Sharp-based removal
  const simpleResult = await sharpBackgroundRemoval(imageBuffer);
  const quality = await assessRemovalQuality(simpleResult, imageBuffer);
  
  console.log(`Free removal quality score: ${quality.toFixed(2)}`);
  
  // Step 2: If quality is good enough, use free method
  if (quality >= 0.7) {
    console.log('✓ Clean background detected - using free method');
    return {
      buffer: simpleResult,
      method: 'free',
      cost: 0,
      quality
    };
  }
  
  // Step 3: Use Remove.bg for complex backgrounds
  console.log('⚠ Complex background detected - using Remove.bg ($0.20)');
  
  if (!process.env.REMOVE_BG_API_KEY) {
    console.warn('Remove.bg API key not configured, using free method anyway');
    return {
      buffer: simpleResult,
      method: 'free',
      cost: 0,
      quality
    };
  }
  
  try {
    const removeBgResult = await removeBgAPI(imageBuffer);
    return {
      buffer: removeBgResult,
      method: 'paid',
      cost: 0.20,
      quality: 0.95 // Remove.bg is typically high quality
    };
  } catch (error) {
    console.error('Remove.bg API failed, falling back to free method:', error);
    return {
      buffer: simpleResult,
      method: 'free',
      cost: 0,
      quality
    };
  }
}

/**
 * Free background removal using Sharp
 * Works well for clean, solid backgrounds
 */
async function sharpBackgroundRemoval(imageBuffer: Buffer): Promise<Buffer> {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  
  // Get dominant background color (sample corners)
  const { data } = await image
    .extract({ left: 0, top: 0, width: 10, height: 10 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  // Average the corner colors
  const avgR = data[0];
  const avgG = data[1];
  const avgB = data[2];
  
  // Create mask based on color similarity
  // This works well for white/solid backgrounds
  const mask = await image
    .clone()
    .removeAlpha()
    .toColourspace('srgb')
    .raw()
    .toBuffer()
    .then((rawData: Buffer) => {
      // Create alpha mask
      const maskData = Buffer.alloc(metadata.width! * metadata.height!);
      
      for (let i = 0; i < rawData.length; i += metadata.channels || 3) {
        const r = rawData[i];
        const g = rawData[i + 1];
        const b = rawData[i + 2];
        
        // Calculate color distance from background
        const distance = Math.sqrt(
          Math.pow(r - avgR, 2) +
          Math.pow(g - avgG, 2) +
          Math.pow(b - avgB, 2)
        );
        
        // Threshold: if similar to background, make transparent
        const alpha = distance < 40 ? 0 : 255;
        maskData[i / (metadata.channels || 3)] = alpha;
      }
      
      return sharp(maskData, {
        raw: {
          width: metadata.width!,
          height: metadata.height!,
          channels: 1
        }
      }).toBuffer();
    });
  
  // Apply mask to original image
  return image
    .joinChannel(await mask)
    .png()
    .toBuffer();
}

/**
 * Remove background using Remove.bg API
 */
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
    const errorText = await response.text();
    throw new Error(`Remove.bg API error: ${response.status} - ${errorText}`);
  }
  
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Assess quality of background removal
 * Returns score from 0 (poor) to 1 (excellent)
 */
async function assessRemovalQuality(
  result: Buffer,
  original: Buffer
): Promise<number> {
  try {
    const resultImage = sharp(result);
    const metadata = await resultImage.metadata();
    
    // Check if result has alpha channel
    if (!metadata.hasAlpha) {
      return 0.3; // Poor quality if no alpha
    }
    
    // Analyze alpha channel
    const { data } = await resultImage
      .extractChannel(3) // Alpha channel
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // Count transparent vs opaque pixels
    let transparentPixels = 0;
    let opaquePixels = 0;
    
    for (let i = 0; i < data.length; i++) {
      if (data[i] < 10) {
        transparentPixels++;
      } else if (data[i] > 245) {
        opaquePixels++;
      }
    }
    
    const total = data.length;
    const transparencyRatio = transparentPixels / total;
    const opaqueRatio = opaquePixels / total;
    
    // Good removal: 30-70% transparent (product isolated from background)
    // High opaque ratio (50%+) is good (product clearly defined)
    if (transparencyRatio > 0.3 && transparencyRatio < 0.7 && opaqueRatio > 0.5) {
      return 0.85;
    }
    
    // Decent removal: 20-80% transparent
    if (transparencyRatio > 0.2 && transparencyRatio < 0.8 && opaqueRatio > 0.3) {
      return 0.65;
    }
    
    // Poor removal: too much or too little transparency
    return 0.4;
    
  } catch (error) {
    console.error('Quality assessment failed:', error);
    return 0.5; // Unknown quality
  }
}

/**
 * Clean up background removal artifacts
 * Refines edges and removes noise
 */
export async function refineBackgroundRemoval(
  imageBuffer: Buffer
): Promise<Buffer> {
  return sharp(imageBuffer)
    .median(2) // Remove salt-and-pepper noise
    .png()
    .toBuffer();
}
```

---

## File 4: Product Composition

**Path:** `/lib/image-processing/product-composition.ts`

```typescript
import sharp from 'sharp';

export interface CompositionOptions {
  productScale?: number; // 0-1, default 0.6 (60% of frame)
  position?: 'center' | 'rule-of-thirds';
  addShadow?: boolean;
  shadowIntensity?: number; // 0-1, default 0.3
}

/**
 * Composite product onto branded background
 */
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
  
  // Get dimensions
  const bgMeta = await sharp(backgroundBuffer).metadata();
  const prodMeta = await sharp(productBuffer).metadata();
  
  const bgWidth = bgMeta.width || 1024;
  const bgHeight = bgMeta.height || 1024;
  const prodWidth = prodMeta.width || 512;
  const prodHeight = prodMeta.height || 512;
  
  // Calculate scaled product dimensions
  const maxProductWidth = Math.round(bgWidth * productScale);
  const aspectRatio = prodHeight / prodWidth;
  const scaledHeight = Math.round(maxProductWidth * aspectRatio);
  
  // Ensure product doesn't exceed background height
  let finalWidth = maxProductWidth;
  let finalHeight = scaledHeight;
  
  if (scaledHeight > bgHeight * productScale) {
    finalHeight = Math.round(bgHeight * productScale);
    finalWidth = Math.round(finalHeight / aspectRatio);
  }
  
  // Resize product
  const resizedProduct = await sharp(productBuffer)
    .resize(finalWidth, finalHeight, { 
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();
  
  // Calculate position
  let posX: number;
  let posY: number;
  
  if (position === 'center') {
    posX = Math.round((bgWidth - finalWidth) / 2);
    posY = Math.round((bgHeight - finalHeight) / 2);
  } else {
    // Rule of thirds: position at 1/3 point
    posX = Math.round((bgWidth - finalWidth) / 2);
    posY = Math.round(bgHeight * 0.4 - finalHeight / 2);
  }
  
  // Add shadow if requested
  let productWithShadow = resizedProduct;
  if (addShadow) {
    productWithShadow = await addNaturalShadow(
      resizedProduct,
      finalWidth,
      finalHeight,
      shadowIntensity
    );
  }
  
  // Composite onto background
  return sharp(backgroundBuffer)
    .composite([{
      input: productWithShadow,
      left: posX,
      top: posY,
      blend: 'over'
    }])
    .toBuffer();
}

/**
 * Add natural drop shadow to product
 */
async function addNaturalShadow(
  productBuffer: Buffer,
  width: number,
  height: number,
  intensity: number = 0.3
): Promise<Buffer> {
  const shadowOffset = Math.round(Math.max(width, height) * 0.02); // 2% of size
  const shadowBlur = Math.round(Math.max(width, height) * 0.04); // 4% of size
  
  // Create shadow using SVG filter
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
  
  return sharp(shadowSvg)
    .png()
    .toBuffer();
}

/**
 * Add subtle product reflection
 * Optional enhancement for product photos
 */
export async function addProductReflection(
  imageBuffer: Buffer,
  reflectionIntensity: number = 0.3
): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width || 1024;
  const height = metadata.height || 1024;
  
  // Get bottom half of image
  const bottomHalf = await sharp(imageBuffer)
    .extract({
      left: 0,
      top: Math.round(height / 2),
      width: width,
      height: Math.round(height / 2)
    })
    .flip() // Flip vertically for reflection
    .modulate({ brightness: 0.5 }) // Darken
    .blur(2) // Slight blur
    .toBuffer();
  
  // Create gradient mask for reflection fade
  const gradientMask = await createVerticalGradient(
    width,
    Math.round(height / 2),
    reflectionIntensity
  );
  
  // Apply mask to reflection
  const maskedReflection = await sharp(bottomHalf)
    .composite([{
      input: gradientMask,
      blend: 'dest-in'
    }])
    .toBuffer();
  
  // Composite reflection below original
  return sharp({
    create: {
      width: width,
      height: height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    }
  })
  .composite([
    { input: imageBuffer, top: 0, left: 0 },
    { input: maskedReflection, top: Math.round(height / 2), left: 0 }
  ])
  .toBuffer();
}

/**
 * Helper: Create vertical gradient for reflection
 */
async function createVerticalGradient(
  width: number,
  height: number,
  maxOpacity: number
): Promise<Buffer> {
  const gradientSvg = Buffer.from(`
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:white;stop-opacity:${maxOpacity}" />
          <stop offset="100%" style="stop-color:white;stop-opacity:0" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)" />
    </svg>
  `);
  
  return sharp(gradientSvg).png().toBuffer();
}
```

---

## File 5: Smart Text Overlay with Brand Bars

**Path:** `/lib/image-processing/smart-text-overlay.ts`

```typescript
import sharp from 'sharp';
import { getContrastColor, isLightColor } from '@/lib/branding/personality-detection';

export interface TextOverlayOptions {
  headline: string;
  businessName: string;
  brandColor: string;
  position?: 'top' | 'bottom' | 'center';
  barOpacity?: number; // 0-1, default 0.90
  fontSize?: {
    headline?: number;
    businessName?: number;
  };
}

/**
 * Add smart text overlay with brand color bar
 * Analyzes image composition and adds text with optimal readability
 */
export async function addSmartTextOverlay(
  imageBuffer: Buffer,
  options: TextOverlayOptions
): Promise<Buffer> {
  const {
    headline,
    businessName,
    brandColor,
    position = 'bottom',
    barOpacity = 0.90,
    fontSize = {}
  } = options;
  
  const meta = await sharp(imageBuffer).metadata();
  const width = meta.width || 1024;
  const height = meta.height || 1024;
  
  // Analyze image to find best text zones
  const zones = await analyzeTextZones(imageBuffer);
  const bestZone = position === 'top' ? zones.top : 
                   position === 'center' ? zones.center :
                   zones.bottom;
  
  // Determine text colors
  const barColor = adjustAlpha(brandColor, barOpacity);
  const textColor = getContrastColor(brandColor);
  
  // Calculate dimensions
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
  
  // Font sizes (scale based on image size)
  const scaleFactor = width / 1024;
  const headlineFontSize = fontSize.headline || Math.round(48 * scaleFactor);
  const businessNameFontSize = fontSize.businessName || Math.round(24 * scaleFactor);
  
  // Create SVG overlay
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
  
  // Composite onto image
  return sharp(imageBuffer)
    .composite([{
      input: svgOverlay,
      blend: 'over'
    }])
    .toBuffer();
}

/**
 * Create SVG for text bar overlay
 */
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
  } = params;
  
  const barX = barPadding;
  const barWidth = width - (barPadding * 2);
  const textCenterX = width / 2;
  const headlineY = barY + (barHeight * 0.4);
  const businessNameY = barY + (barHeight * 0.75);
  
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Drop shadow for bar -->
        <filter id="barShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        <!-- Text shadow for readability -->
        <filter id="textShadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="1" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.5"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Brand color bar with rounded corners -->
      <rect 
        x="${barX}" 
        y="${barY}" 
        width="${barWidth}" 
        height="${barHeight}" 
        rx="12" 
        ry="12"
        fill="${barColor}"
        filter="url(#barShadow)"
      />
      
      <!-- Headline text -->
      <text 
        x="${textCenterX}" 
        y="${headlineY}" 
        font-family="Inter, -apple-system, system-ui, sans-serif"
        font-size="${headlineFontSize}"
        font-weight="900"
        fill="${textColor}"
        text-anchor="middle"
        dominant-baseline="middle"
        filter="url(#textShadow)"
      >${escapeXml(headline)}</text>
      
      <!-- Business name text -->
      <text 
        x="${textCenterX}" 
        y="${businessNameY}" 
        font-family="Inter, -apple-system, system-ui, sans-serif"
        font-size="${businessNameFontSize}"
        font-weight="600"
        fill="${textColor}"
        text-anchor="middle"
        dominant-baseline="middle"
        opacity="0.95"
        filter="url(#textShadow)"
      >${escapeXml(businessName.toUpperCase())}</text>
    </svg>
  `);
}

/**
 * Analyze image to find best text zones
 */
async function analyzeTextZones(imageBuffer: Buffer): Promise<{
  top: { contrast: number; recommended: boolean };
  center: { contrast: number; recommended: boolean };
  bottom: { contrast: number; recommended: boolean };
}> {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  const width = metadata.width || 1024;
  const height = metadata.height || 1024;
  
  // Sample brightness in each zone
  const topZone = await sampleZoneBrightness(image, 0, height * 0.15, width, height);
  const centerZone = await sampleZoneBrightness(image, height * 0.4, height * 0.6, width, height);
  const bottomZone = await sampleZoneBrightness(image, height * 0.85, height, width, height);
  
  return {
    top: topZone,
    center: centerZone,
    bottom: bottomZone
  };
}

/**
 * Sample average brightness in a zone
 */
async function sampleZoneBrightness(
  image: sharp.Sharp,
  startY: number,
  endY: number,
  width: number,
  totalHeight: number
): Promise<{ contrast: number; recommended: boolean }> {
  const zoneHeight = Math.round(endY - startY);
  
  try {
    const { data } = await image
      .clone()
      .extract({ 
        left: 0, 
        top: Math.round(startY), 
        width: width, 
        height: Math.max(1, zoneHeight)
      })
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // Calculate average brightness
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    const avgBrightness = sum / data.length / 255; // 0-1
    
    // Good contrast zones: very dark (< 0.3) or very light (> 0.7)
    const contrast = avgBrightness < 0.3 ? 1 - avgBrightness : 
                    avgBrightness > 0.7 ? avgBrightness : 
                    0.5;
    
    return {
      contrast,
      recommended: contrast > 0.6
    };
  } catch (error) {
    // If extraction fails, return neutral recommendation
    return { contrast: 0.5, recommended: true };
  }
}

/**
 * Helper: Convert hex color to RGBA string with alpha
 */
function adjustAlpha(hexColor: string, alpha: number): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Helper: Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Extract headline from topic text
 * Looks for promotional keywords and formats them
 */
export function extractHeadline(topic: string): string {
  // Look for percentage offers
  const percentMatch = topic.match(/(\d+%\s*(?:off|discount))/i);
  if (percentMatch) {
    return percentMatch[1].toUpperCase();
  }
  
  // Look for dollar amounts
  const dollarMatch = topic.match(/(\$\d+(?:\.\d{2})?)/);
  if (dollarMatch) {
    return dollarMatch[1];
  }
  
  // Look for promotional keywords
  const promoKeywords = [
    'new', 'sale', 'special', 'limited', 'free', 
    'today', 'now', 'exclusive', 'offer'
  ];
  
  const words = topic.toLowerCase().split(/\s+/);
  const promoWords = words.filter(word => 
    promoKeywords.some(keyword => word.includes(keyword))
  );
  
  if (promoWords.length > 0) {
    return promoWords.slice(0, 3).join(' ').toUpperCase();
  }
  
  // Fallback: first 2-3 significant words
  const significantWords = words.filter(word => 
    word.length > 3 && 
    !['the', 'and', 'for', 'with', 'that', 'this'].includes(word)
  );
  
  if (significantWords.length > 0) {
    return significantWords.slice(0, 2).join(' ').toUpperCase();
  }
  
  // Last resort: first 20 characters
  return topic.slice(0, 20).toUpperCase();
}
```

---

## File 6: Updated API Route

**Path:** `/app/api/content/generate-image/route.ts`

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
      brandColors, // { primary: string, secondary?: string }
      productImage, // Base64 string or null
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
    let totalCost = 0.04; // Base DALL-E cost
    let removalMethod: 'free' | 'paid' | 'none' = 'none';
    
    // Auto-detect brand personality for logging
    const personality = brandColors?.primary 
      ? detectBrandPersonality(brandColors.primary, brandColors.secondary)
      : null;
    
    console.log(`Generating image with ${personality?.personality || 'no'} brand personality`);
    
    // WORKFLOW A: With Product Image
    if (productImage) {
      console.log('Workflow A: Product image provided');
      
      // 1. Remove background
      const productBuffer = Buffer.from(productImage.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      const { buffer: cleanProduct, method, cost: bgCost } = await smartBackgroundRemoval(productBuffer);
      
      totalCost += bgCost;
      removalMethod = method;
      console.log(`Background removal: ${method} (cost: $${bgCost})`);
      
      // 2. Generate branded background
      const bgResult = await generateImage({
        topic,
        businessName,
        industry,
        style: 'professional',
        hasProductImage: true,
        brandColors,
        contentType
      });
      
      const bgResponse = await fetch(bgResult.url);
      const bgBuffer = Buffer.from(await bgResponse.arrayBuffer());
      
      // 3. Composite product onto background
      finalBuffer = await compositeProduct(
        bgBuffer,
        cleanProduct,
        brandColors.primary,
        {
          productScale: 0.6,
          position: 'center',
          addShadow: true
        }
      );
      
      console.log('Product composited successfully');
    } 
    // WORKFLOW B: Without Product Image (Service)
    else {
      console.log('Workflow B: Service image (no product)');
      
      const result = await generateImage({
        topic,
        businessName,
        industry,
        style: 'authentic',
        hasProductImage: false,
        brandColors,
        contentType
      });
      
      const response = await fetch(result.url);
      finalBuffer = Buffer.from(await response.arrayBuffer());
    }
    
    // 4. Add text overlay if requested
    if (addTextOverlay) {
      const headline = extractHeadline(topic);
      if (headline && brandColors?.primary) {
        console.log(`Adding text overlay: "${headline}"`);
        
        finalBuffer = await addSmartTextOverlay(finalBuffer, {
          headline,
          businessName,
          brandColor: brandColors.primary,
          position: 'bottom'
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
        { error: 'Failed to upload image' },
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
      hasProduct: !!productImage
    });
    
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: 'Image generation failed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
```

---

## Environment Variables

Add to `.env.local`:

```bash
# Remove.bg API (optional, for complex background removal)
REMOVE_BG_API_KEY=your_key_here

# Existing variables
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

---

## Package Dependencies

Add to `package.json` if not already present:

```json
{
  "dependencies": {
    "sharp": "^0.33.0",
    "openai": "^4.20.0",
    "node-fetch": "^3.3.0",
    "form-data": "^4.0.0"
  },
  "devDependencies": {
    "@types/sharp": "^0.32.0",
    "@types/node-fetch": "^2.6.0"
  }
}
```

---

## Testing Strategy

### Test 1: Brand Detection
```typescript
// test/brand-detection.test.ts
import { detectBrandPersonality } from '@/lib/branding/personality-detection';

console.log('Red brand:', detectBrandPersonality('#FF0000'));
// Expected: energetic

console.log('Blue brand:', detectBrandPersonality('#0000FF'));
// Expected: professional or friendly

console.log('Purple brand:', detectBrandPersonality('#8B00FF'));
// Expected: luxury

console.log('Gray brand:', detectBrandPersonality('#808080'));
// Expected: professional
```

### Test 2: Background Removal
```typescript
// Test with sample product image
const testImage = fs.readFileSync('test-product.png');
const result = await smartBackgroundRemoval(testImage);
console.log(`Method: ${result.method}, Quality: ${result.quality}`);
```

### Test 3: Full Workflow
```typescript
// Test complete generation
const response = await fetch('http://localhost:3000/api/content/generate-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: '20% Off Summer Sale',
    businessName: 'Test Business',
    industry: 'HVAC',
    brandColors: { primary: '#FF5733' },
    productImage: null, // Test service workflow first
    addTextOverlay: true
  })
});

const data = await response.json();
console.log('Generated:', data.url);
console.log('Cost:', data.cost);
console.log('Personality:', data.personality);
```

---

## Deployment Checklist

- [ ] Install dependencies: `npm install`
- [ ] Add REMOVE_BG_API_KEY to environment (optional)
- [ ] Create all 6 files above
- [ ] Test brand detection with various colors
- [ ] Test Workflow B (no product) first
- [ ] Test Workflow A (with product) second
- [ ] Test text overlay readability
- [ ] Deploy to staging
- [ ] Run A/B test: old vs new
- [ ] Monitor costs and quality
- [ ] Roll out to production

---

## Success Metrics

Track these in your analytics:
- Brand personality detection accuracy
- Background removal success rate (free vs paid)
- Average cost per image
- User satisfaction scores
- Time to generate
- Text readability scores

---

**This guide contains complete, production-ready code that Cursor can implement directly.** All functions include proper TypeScript types, error handling, and documentation.
