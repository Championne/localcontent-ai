# Brand-Aware Image Generation - Implementation Guide

**Created:** February 13, 2026 (Evening)  
**Status:** Ready for Implementation  
**Priority:** HIGH

---

## TL;DR - What Changed

### OLD APPROACH (Eliminated):
```
Generate generic image → Manual logo placement → Add frame → Add tint → Add text
❌ Result: Layers that don't integrate, looks assembled
```

### NEW APPROACH:
```
Generate brand-aware image → Smart text overlay (optional)
✅ Result: Native brand integration, looks designed
```

---

## Core Changes

### 1. **Brand Personality Auto-Detection**
System automatically detects brand personality from colors:
- **Energetic** (red/orange, high saturation)
- **Professional** (blue/gray, low saturation)  
- **Friendly** (yellow/green, warm tones)
- **Luxury** (dark + saturated, rich colors)

### 2. **Brand-Aware Prompts**
Prompts now include brand context:
```typescript
"Close-up of HVAC technician working...
Brand aesthetic: energetic and dynamic
Color palette: warm reds with high energy  
Lighting: bright warm lighting with highlights"
```

### 3. **Eliminate Step 3 Manual Controls**
Remove ALL of these:
- ❌ Logo placement
- ❌ Frame selection
- ❌ Tint overlays
- ❌ Manual text positioning

### 4. **Smart Text Overlays**
Text now uses brand color bars for integration:
```
┌───────────────────────┐
│ [Service Image]       │
│ Brand colors baked in │
├───────────────────────┤
│ ╔═══════════════════╗ │
│ ║ 20% OFF          ║ │ ← Brand color bar
│ ║ BUSINESS NAME    ║ │    with text
│ ╚═══════════════════╝ │
└───────────────────────┘
```

---

## Two Workflows

### **Workflow A: WITH Product Image**
```
1. Upload product photo
2. Auto-detect background complexity
3. Remove background (free if simple, $0.20 if complex)
4. Generate branded background with:
   - Brand colors in lighting
   - Brand personality in mood
   - Space for product
5. Composite product naturally
6. Add text overlay (if promotional)
```

### **Workflow B: WITHOUT Product (Service)**
```
1. Generate brand-aware service image:
   - Human focal point (hands/face)
   - Brand colors in environment
   - Brand personality in mood
2. Add text overlay (if promotional)
```

---

## Implementation Priority

### **Week 1: Foundation**
1. Brand personality detection (`/lib/branding/personality-detection.ts`)
2. Brand-aware prompts (update `/lib/openai/images.ts`)
3. Test Workflow B (simpler - no product)

### **Week 2: Product Integration**
1. Hybrid background removal (`/lib/image-processing/background-removal.ts`)
2. Product composition (`/lib/image-processing/product-composition.ts`)
3. Test Workflow A

### **Week 3: Text & UI**
1. Smart text overlays with brand bars
2. Simplify frontend (remove Step 3 controls)
3. A/B testing

---

## Key Code Files

### **NEW Files to Create:**

#### 1. `/lib/branding/personality-detection.ts`
```typescript
export interface BrandPersonality {
  personality: 'energetic' | 'professional' | 'friendly' | 'luxury';
  mood: string;
  colorDescription: string;
  lightingStyle: string;
}

export function detectBrandPersonality(
  primaryColor: string,
  secondaryColor?: string
): BrandPersonality {
  const hsl = hexToHSL(primaryColor);
  
  // RED/ORANGE → Energetic or Professional
  if (hsl.h < 60) {
    return hsl.s > 60 ? {
      personality: 'energetic',
      mood: 'vibrant, dynamic, bold',
      colorDescription: 'warm reds and oranges',
      lightingStyle: 'bright warm lighting'
    } : {
      personality: 'professional',
      mood: 'confident, reliable',
      colorDescription: 'muted warm tones',
      lightingStyle: 'balanced natural lighting'
    };
  }
  
  // YELLOW/GREEN → Friendly
  if (hsl.h < 150) {
    return {
      personality: 'friendly',
      mood: 'welcoming, approachable',
      colorDescription: 'warm sunny tones',
      lightingStyle: 'soft golden hour glow'
    };
  }
  
  // BLUE → Professional or Friendly
  if (hsl.h < 250) {
    return hsl.s < 30 ? {
      personality: 'professional',
      mood: 'calm, trustworthy',
      colorDescription: 'cool blue-gray',
      lightingStyle: 'clean diffused light'
    } : {
      personality: 'friendly',
      mood: 'fresh, reliable',
      colorDescription: 'bright blues',
      lightingStyle: 'bright natural light'
    };
  }
  
  // PURPLE → Luxury or Friendly
  if (hsl.s > 40 && hsl.l < 50) {
    return {
      personality: 'luxury',
      mood: 'sophisticated, premium',
      colorDescription: 'deep rich purples',
      lightingStyle: 'dramatic lighting'
    };
  }
  
  return {
    personality: 'friendly',
    mood: 'creative, unique',
    colorDescription: 'soft pastels',
    lightingStyle: 'soft diffused lighting'
  };
}
```

#### 2. `/lib/image-processing/background-removal.ts`
```typescript
export async function smartBackgroundRemoval(
  imageBuffer: Buffer
): Promise<{ 
  buffer: Buffer; 
  method: 'free' | 'paid'; 
  cost: number 
}> {
  // Try free Sharp method first
  const simpleResult = await sharpMasking(imageBuffer);
  const quality = await assessQuality(simpleResult);
  
  if (quality.score >= 0.7) {
    return { buffer: simpleResult, method: 'free', cost: 0 };
  }
  
  // Use Remove.bg for complex backgrounds
  const removeBgResult = await callRemoveBg(imageBuffer);
  return { buffer: removeBgResult, method: 'paid', cost: 0.20 };
}
```

#### 3. `/lib/image-processing/smart-text-overlay.ts`
```typescript
export async function addSmartTextOverlay(
  imageBuffer: Buffer,
  text: string,
  brandColor: string,
  businessName: string
): Promise<Buffer> {
  const meta = await sharp(imageBuffer).metadata();
  const width = meta.width || 1024;
  const height = meta.height || 1024;
  
  const barHeight = 80;
  const barY = height - barHeight - 20;
  const barColor = adjustAlpha(brandColor, 0.90);
  const textColor = getContrastColor(brandColor);
  
  const svg = Buffer.from(`
    <svg width="${width}" height="${height}">
      <rect x="20" y="${barY}" width="${width-40}" height="${barHeight}" 
            rx="8" fill="${barColor}"/>
      <text x="${width/2}" y="${barY+35}" font-size="48" font-weight="900" 
            fill="${textColor}" text-anchor="middle">${text}</text>
      <text x="${width/2}" y="${barY+65}" font-size="24" font-weight="600" 
            fill="${textColor}" text-anchor="middle" opacity="0.9">
        ${businessName.toUpperCase()}
      </text>
    </svg>
  `);
  
  return sharp(imageBuffer)
    .composite([{ input: svg, blend: 'over' }])
    .toBuffer();
}
```

### **UPDATE Existing Files:**

#### `/lib/openai/images.ts`
Add brand-aware prompt builder:
```typescript
function buildBrandAwarePrompt(params: GenerateImageParams): string {
  const personality = detectBrandPersonality(
    params.brandColors.primary,
    params.brandColors.secondary
  );
  
  const focalPoint = params.hasProductImage
    ? `Clean surface for product photography. ${personality.colorDescription} 
       in lighting. ${personality.lightingStyle}. Negative space in center.`
    : `${getPersonType(params.industry)} working on ${sanitizeTopic(params.topic)}.
       ${personality.mood} atmosphere. ${personality.colorDescription} in environment.
       ${personality.lightingStyle}.`;
  
  return `${focalPoint} No text.`;
}
```

---

## User Instructions for Product Photos

Add this to the upload UI:

```markdown
### 📸 Best Product Photos:
✅ Clean white or solid background
✅ Good lighting (natural or studio)  
✅ Product fills frame
✅ No shadows on background
✅ Sharp focus

💡 **Tip:** Better photos = free processing!  
Complex backgrounds use $0.20 AI removal.
```

---

## Cost Structure

- **Base DALL-E:** $0.04
- **Simple background (70%):** $0.00 (free Sharp)
- **Complex background (30%):** $0.20 (Remove.bg)
- **Average per image:** ~$0.10

---

## Success Metrics

Track these:
- % images with integrated brand colors (target: 95%)
- % free background removals (target: 70%)
- User satisfaction (target: 4.5/5)
- Time to generate (target: < 30 seconds)
- Support tickets about branding (target: -80%)

---

## Questions to Decide

### 1. Text Bar Style?
- **A) Brand color bar + white text** ← Recommended
- B) White bar + brand color text
- C) No bar, just shadow

### 2. Show Personality?
Show detected personality to user?
- "We detected your brand as: **Energetic** 🔥"
- Allow override? Or keep automatic?

### 3. Cost Display?
Show background removal cost?
- "Free processing ✓"
- "Premium processing ($0.20)"

---

## Next Steps

1. **Start with Week 1** - Brand detection
2. **Test thoroughly** - Each workflow separately  
3. **A/B test** - New vs old side-by-side
4. **Simplify UI** - Remove Step 3 complexity
5. **Deploy gradually** - Feature flag rollout

---

**See full implementation details in:**
- `IMAGE_GENERATION_IMPROVEMENT_PLAN.md` (original plan)
- Code examples above

**Ready to start? Begin with `/lib/branding/personality-detection.ts`** 🚀
