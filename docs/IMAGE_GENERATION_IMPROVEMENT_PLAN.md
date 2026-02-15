# GeoSpark Image Generation Improvement Plan
## From Complex Prompts to Impactful Advertising Images

**Created:** February 13, 2026  
**Status:** Ready for Implementation  
**Priority:** HIGH - Core Product Feature

---

## Executive Summary

This plan transforms GeoSpark's image generation from complex, over-engineered prompts to simple, impactful advertising images that actually work for local businesses. The key insight: **Less prompt complexity + Clear focal point + Separate text overlays = Better results**.

### Problems with Current System:
1. ❌ Over-complex prompts (200-400+ words)
2. ❌ Too many style variations (10 styles + sub-variations)
3. ❌ Generic, unfocused images
4. ❌ No human faces/hands (which drive engagement)
5. ❌ Trying to use DALL-E for text (always fails)
6. ❌ Verbose safeguards that confuse the AI

### New Approach:
1. ✅ Simple prompts (50-100 words max)
2. ✅ 4 core styles (authentic, professional, promotional, lifestyle)
3. ✅ ONE focal point per image
4. ✅ Human faces and hands for service businesses
5. ✅ Text overlays added AFTER image generation
6. ✅ Clear, directive prompts

---

## Research Findings: What Actually Works in 2025

### Key Insights from Social Media Advertising Research:

1. **Visual Hierarchy Wins**
   - 70%+ of social media use happens on mobile devices
   - 4:5 vertical format outperforms 1:1 square by 15%
   - Single focal point > multiple elements
   - People scan, don't read - need instant visual impact

2. **Authenticity Over Polish**
   - UGC-style content has 6-10x higher engagement
   - Real humans in ads improve metrics significantly
   - Interview-style and testimonials outperform playful formats
   - Genuine moments > staged perfection

3. **Serious Tone for Meta/Facebook**
   - Problem-solution narratives drive stronger conversions
   - Meta (Facebook/Instagram) calls for serious, structured tone
   - Educational and informative content performs best
   - Avoid overly playful unless it's TikTok

4. **Bold, Simple Design**
   - AIDA principle must work within first 3 seconds
   - Minimal text overlays work better than cluttered designs
   - High contrast and clear hierarchy guide the eye
   - Simplicity = higher CTR

5. **Emotional Connection**
   - People buy experiences and feelings, not products
   - 88% of consumers value authenticity
   - 46% willing to pay more for trusted brands
   - Visual storytelling creates lasting impressions

---

## Proposed New Architecture

### 1. Simplified Style System (4 Core Styles)

Replace the current 10 styles with 4 proven approaches:

```javascript
const SIMPLIFIED_STYLES = {
  authentic: {
    name: 'Authentic',
    description: 'Real people, genuine moments, UGC-style',
    useCase: 'Service businesses, testimonials, lifestyle',
    keywords: ['real', 'genuine', 'authentic', 'testimonial', 'customer'],
    promptCore: 'Candid photograph of a real person [doing relevant activity]. Natural smartphone camera aesthetic. Genuine expression, authentic moment. Soft natural lighting. Clean background. One clear focal point: the person and their authentic emotion.'
  },
  
  professional: {
    name: 'Professional',  
    description: 'Clean, editorial, trust-building',
    useCase: 'B2B, professional services, authority',
    keywords: ['professional', 'expert', 'quality', 'trust', 'service'],
    promptCore: 'High-end editorial photograph. One clear subject [relevant to business]. Clean minimal composition. Soft natural window light. Muted sophisticated color palette. DSLR quality. One focal point.'
  },
  
  promotional: {
    name: 'Promotional',
    description: 'Eye-catching, product-focused, sale-ready',
    useCase: 'Retail, e-commerce, special offers',
    keywords: ['sale', 'offer', 'deal', 'special', 'discount', 'new'],
    promptCore: 'Striking product photograph. [Product/service] as the single hero element. Cinematic lighting. Warm inviting atmosphere. Shallow depth of field. One clear focal point: the product.'
  },
  
  lifestyle: {
    name: 'Lifestyle',
    description: 'Aspirational moments, relatable scenes',
    useCase: 'Broad appeal, emotional connection',
    keywords: ['lifestyle', 'enjoy', 'experience', 'moment', 'happy'],
    promptCore: 'Lifestyle photograph showing [relevant scene]. One person or couple enjoying [relevant experience]. Golden hour light. Warm, inviting feel. Natural bokeh background. One focal point: the human moment.'
  }
}
```

### 2. Focal Point System

Every image MUST have ONE clear focal point:

```javascript
const FOCAL_POINT_TYPES = {
  humanFace: {
    description: 'A single person\'s face showing genuine emotion',
    when: 'Service businesses, testimonials, personal services',
    examples: ['joy', 'satisfaction', 'concentration', 'relief']
  },
  
  humanAction: {
    description: 'Person\'s hands actively doing the service',
    when: 'HVAC, plumbing, electrical, hair salon, mechanic',
    examples: ['hands fixing pipe', 'hands cutting hair', 'hands serving food']
  },
  
  productHero: {
    description: 'The product alone, hero-shot, clear and prominent',
    when: 'Retail, e-commerce, product launches',
    examples: ['product fills 60% of frame', 'dramatic lighting', 'minimal background']
  },
  
  experienceResult: {
    description: 'The end result - the transformation',
    when: 'Landscaping, cleaning, renovation, before/after',
    examples: ['clean kitchen', 'manicured lawn', 'renovated bathroom']
  }
}
```

### 3. Human-First Prompt Templates

**For Service Businesses WITHOUT Product Images:**

#### Template A: The Service Provider (Human Face + Hands)
```
Close-up photograph of skilled [profession] hands performing [service]. 
Face partially visible in soft focus background showing concentration. 
Professional tools in use. Clean, uncluttered workspace.
Natural window light. Warm, trustworthy atmosphere.
One focal point: the hands and tool in action.
No text.
```

**Example:**
```
Close-up photograph of skilled HVAC technician hands installing air filter. 
Face partially visible in soft focus background showing concentration. 
Professional tools in use. Clean residential basement.
Natural window light. Warm, trustworthy atmosphere.
One focal point: the hands and filter in action.
No text.
```

#### Template B: The Happy Customer (Emotional Result)
```
Portrait of relieved customer after [service completed].
Genuine smile, authentic emotion. 
[Service provider] visible in blurred background.
Home/business setting, natural light.
One focal point: customer's face showing satisfaction.
No text.
```

**Example:**
```
Portrait of relieved homeowner after plumbing repair completed.
Genuine smile, authentic relief. 
Plumber visible in blurred background with toolbox.
Modern kitchen setting, natural window light.
One focal point: customer's face showing satisfaction.
No text.
```

#### Template C: The Transformation (Before/After)
```
Side-by-side: [problem] on left, [solution] on right.
Same location, same angle, different state.
Clear visual difference. Documentary photography style.
Natural lighting. Clean composition.
Two focal points: problem vs solution.
No text.
```

**Example:**
```
Side-by-side: overgrown lawn on left, freshly manicured lawn on right.
Same suburban house, same angle, different state.
Clear visual difference. Documentary photography style.
Natural afternoon lighting. Clean composition.
Two focal points: before vs after.
No text.
```

**For Businesses WITH Product Images:**

#### Template D: Product Hero Shot
```
Hero product shot: [product/dish/item].
Product fills 60% of frame, sharp focus.
Minimal props, clean surface.
Dramatic but natural lighting.
Shallow depth of field.
One focal point: the product.
No text.
```

---

## Implementation Plan

### Phase 1: Simplify Prompt Generation (Week 1)

**File:** `/lib/openai/images.ts`

**Current function to replace:** `buildImagePrompt()`

**New implementation:**

```typescript
// SIMPLIFIED PROMPT BUILDER
function buildSimplePrompt(params: GenerateImageParams): string {
  const { topic, industry, businessName, hasProductImage } = params;
  
  // 1. Determine focal strategy
  const focalType = hasProductImage 
    ? 'product_hero'
    : hasHumanIndustry(industry)
    ? 'human_service'
    : 'environment_result';
    
  // 2. Get focal prompt template
  const focalPrompt = getFocalPrompt(focalType, industry, topic);
  
  // 3. Add mood/style modifier (just 1-2 sentences)
  const styleMood = STYLE_MOODS[params.style || 'authentic'];
  
  // 4. Combine (total: 50-100 words)
  return `${focalPrompt} ${styleMood} No text anywhere in the image.`;
}

// Focal point templates
const FOCAL_PROMPTS = {
  human_service: (industry: string, topic: string) => {
    const person = getPersonType(industry); // "HVAC technician", "plumber", etc.
    const action = sanitizeTopic(topic); // Remove promo text
    return `Close-up of ${person} actively working on ${action}. Face showing genuine concentration. Hands in action with professional tools. Clean workspace. Natural window light.`;
  },
    
  product_hero: (industry: string, topic: string) => {
    const item = sanitizeTopic(topic);
    return `Hero shot of ${item}. Product fills 60% of frame, sharp focus. Minimal background props. Dramatic natural lighting. Shallow depth of field.`;
  },
    
  environment_result: (industry: string, topic: string) => {
    const result = sanitizeTopic(topic);
    const setting = getEnvironment(industry); // "home", "office", "garden"
    return `Wide shot of completed ${result} in ${setting}. Clean, professional result. Natural light highlighting the quality work.`;
  },
  
  customer_emotion: (industry: string, topic: string) => {
    const emotion = getExpectedEmotion(topic); // "relief", "joy", "satisfaction"
    return `Portrait of customer showing ${emotion} after service completion. Genuine authentic smile. Service provider visible in soft-focus background. Natural home setting.`;
  }
};

// Simple mood descriptors (1-2 sentences max)
const STYLE_MOODS = {
  authentic: 'Candid smartphone aesthetic. Genuine moment. Soft natural light.',
  professional: 'Editorial quality. Muted sophisticated tones. DSLR depth of field.',
  promotional: 'Cinematic warmth. Inviting atmosphere. Shallow focus on subject.',
  lifestyle: 'Golden hour glow. Natural bokeh. Relatable everyday scene.'
};

// Helper functions
function hasHumanIndustry(industry: string): boolean {
  const humanIndustries = [
    'hvac', 'plumber', 'plumbing', 'electrician', 'electrical',
    'roofing', 'cleaning', 'salon', 'fitness', 'dental', 'dentist',
    'auto', 'mechanic', 'contractor', 'landscaping'
  ];
  return humanIndustries.some(ind => 
    industry.toLowerCase().includes(ind)
  );
}

function getPersonType(industry: string): string {
  const personMap: Record<string, string> = {
    'hvac': 'HVAC technician',
    'plumber': 'professional plumber',
    'plumbing': 'professional plumber',
    'electrician': 'certified electrician',
    'electrical': 'certified electrician',
    'roofing': 'experienced roofer',
    'cleaning': 'cleaning specialist',
    'salon': 'hair stylist',
    'fitness': 'personal trainer',
    'dental': 'dental hygienist',
    'dentist': 'dentist',
    'auto': 'skilled mechanic',
    'mechanic': 'skilled mechanic',
    'contractor': 'general contractor',
    'landscaping': 'landscaper'
  };
  
  for (const [key, value] of Object.entries(personMap)) {
    if (industry.toLowerCase().includes(key)) {
      return value;
    }
  }
  
  return 'professional service provider';
}

function getEnvironment(industry: string): string {
  const envMap: Record<string, string> = {
    'hvac': 'modern home',
    'plumbing': 'residential bathroom',
    'electrical': 'home interior',
    'roofing': 'suburban house exterior',
    'cleaning': 'bright clean home',
    'landscaping': 'suburban front yard',
    'salon': 'modern salon',
    'dental': 'dental office',
    'restaurant': 'restaurant dining area',
    'retail': 'welcoming storefront'
  };
  
  for (const [key, value] of Object.entries(envMap)) {
    if (industry.toLowerCase().includes(key)) {
      return value;
    }
  }
  
  return 'professional business setting';
}

function sanitizeTopic(topic: string): string {
  // Remove promotional text that DALL-E would try to render
  let cleaned = topic;
  
  // Remove percentages and prices
  cleaned = cleaned.replace(/\d+[\.,]?\d*\s*%/g, '');
  cleaned = cleaned.replace(/[$€£¥]\s*\d+[\.,]?\d*/g, '');
  cleaned = cleaned.replace(/\d+[\.,]?\d*\s*[$€£¥]/g, '');
  
  // Remove promotional phrases
  const promoPatterns = [
    /\bonly today\b/gi, /\btoday only\b/gi, /\blimited time\b/gi,
    /\bact now\b/gi, /\bhurry\b/gi, /\bdon'?t miss\b/gi,
    /\bbuy one get one\b/gi, /\bbogo\b/gi, /\bfree shipping\b/gi,
    /\bsave up to\b/gi, /\bsave\b/gi, /\boff\b/gi,
    /\bdiscount\b/gi, /\bspecial offer\b/gi, /\bdeal of\b/gi,
    /\bcoupon\b/gi, /\bpromo code\b/gi, /\bflash sale\b/gi,
    /\bclearance\b/gi, /\bwhile supplies last\b/gi,
    /\border now\b/gi, /\bbook now\b/gi, /\bcall now\b/gi,
    /\bget yours\b/gi, /\bshop now\b/gi
  ];
  
  for (const pattern of promoPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }
  
  // Clean up whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // If too short after cleaning, return generic
  if (cleaned.length < 3) {
    return 'the service';
  }
  
  return cleaned;
}
```

### Phase 2: Add Text Overlay System (Week 2)

**New file:** `/lib/image-processing/text-overlay.ts`

```typescript
import sharp from 'sharp';

export interface TextOverlayConfig {
  text: string;
  position: 'top' | 'center' | 'bottom' | 'top-left' | 'top-right';
  fontSize: number;
  color: string;
  font: 'Inter' | 'Georgia' | 'Playfair Display';
  weight: '400' | '600' | '700' | '900';
  alignment: 'left' | 'center' | 'right';
  strokeColor?: string;
  strokeWidth?: number;
  shadow?: boolean;
}

/**
 * Add text overlays to an image using SVG composition.
 * This is MORE RELIABLE than trying to get DALL-E to not add text.
 */
export async function addTextOverlays(
  imageBuffer: Buffer,
  overlays: TextOverlayConfig[]
): Promise<Buffer> {
  const meta = await sharp(imageBuffer).metadata();
  const width = meta.width || 1024;
  const height = meta.height || 1024;
  
  // Build SVG with all text elements
  const textElements = overlays.map((overlay, index) => {
    const { x, y } = calculatePosition(overlay.position, width, height, index, overlays.length);
    
    // Optional text shadow for readability
    const shadow = overlay.shadow 
      ? `<text 
          x="${x + 2}" 
          y="${y + 2}" 
          font-family="${overlay.font}"
          font-size="${overlay.fontSize}"
          font-weight="${overlay.weight}"
          fill="rgba(0,0,0,0.5)"
          text-anchor="${overlay.alignment === 'center' ? 'middle' : overlay.alignment === 'right' ? 'end' : 'start'}"
          filter="url(#shadow)"
        >${escapeXml(overlay.text)}</text>`
      : '';
    
    // Main text with optional stroke
    const stroke = overlay.strokeColor && overlay.strokeWidth
      ? `stroke="${overlay.strokeColor}" stroke-width="${overlay.strokeWidth}"`
      : '';
    
    return `
      ${shadow}
      <text 
        x="${x}" 
        y="${y}" 
        font-family="${overlay.font}"
        font-size="${overlay.fontSize}"
        font-weight="${overlay.weight}"
        fill="${overlay.color}"
        text-anchor="${overlay.alignment === 'center' ? 'middle' : overlay.alignment === 'right' ? 'end' : 'start'}"
        ${stroke}
      >${escapeXml(overlay.text)}</text>
    `;
  }).join('\n');
  
  const svgOverlay = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="2" dy="2" result="offsetblur"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      ${textElements}
    </svg>
  `);
  
  return sharp(imageBuffer)
    .composite([{ input: svgOverlay, blend: 'over' }])
    .toBuffer();
}

function calculatePosition(
  position: TextOverlayConfig['position'],
  width: number,
  height: number,
  index: number,
  totalOverlays: number
): { x: number; y: number } {
  const padding = 40;
  const spacing = 60;
  
  switch (position) {
    case 'top':
      return { x: width / 2, y: padding + (index * spacing) };
    case 'center':
      return { x: width / 2, y: (height / 2) + (index * spacing) - ((totalOverlays - 1) * spacing / 2) };
    case 'bottom':
      return { x: width / 2, y: height - padding - ((totalOverlays - index - 1) * spacing) };
    case 'top-left':
      return { x: padding, y: padding + (index * spacing) };
    case 'top-right':
      return { x: width - padding, y: padding + (index * spacing) };
    default:
      return { x: width / 2, y: height / 2 };
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Extract headline from topic (promotional text)
 * Examples:
 *   "50% Off Summer Sale" -> "50% OFF"
 *   "New Menu Items" -> "NEW MENU"
 *   "Book Your Tune-Up Today" -> "BOOK TODAY"
 */
export function extractHeadline(topic: string): string {
  // Look for percentage offers
  const percentMatch = topic.match(/(\d+%\s*off)/i);
  if (percentMatch) {
    return percentMatch[1].toUpperCase();
  }
  
  // Look for dollar amounts
  const dollarMatch = topic.match(/(\$\d+)/);
  if (dollarMatch) {
    return dollarMatch[1];
  }
  
  // Look for promotional keywords
  const promoKeywords = ['new', 'sale', 'special', 'limited', 'free', 'today', 'now'];
  const words = topic.toLowerCase().split(/\s+/);
  const promoWords = words.filter(word => 
    promoKeywords.some(keyword => word.includes(keyword))
  );
  
  if (promoWords.length > 0) {
    return promoWords.slice(0, 2).join(' ').toUpperCase();
  }
  
  // Fallback: first 2-3 significant words
  const significantWords = words.filter(word => 
    word.length > 3 && 
    !['the', 'and', 'for', 'with'].includes(word)
  );
  
  return significantWords.slice(0, 2).join(' ').toUpperCase();
}

/**
 * Smart text color that contrasts with background
 */
export function getContrastColor(
  backgroundColor: string,
  lightColor: string = '#FFFFFF',
  darkColor: string = '#000000'
): string {
  // Parse hex color
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return contrasting color
  return luminance > 0.5 ? darkColor : lightColor;
}
```

### Phase 3: Update API Routes (Week 3)

**File:** `/app/api/content/generate-image/route.ts` (or wherever image generation happens)

```typescript
import { generateImage } from '@/lib/openai/images';
import { addTextOverlays, extractHeadline, getContrastColor } from '@/lib/image-processing/text-overlay';

export async function POST(req: Request) {
  const { 
    topic, 
    businessName, 
    industry, 
    hasProductImage,
    brandPrimaryColor,
    addTextOverlay = true // New parameter
  } = await req.json();
  
  // 1. Generate CLEAN image (absolutely no text)
  const result = await generateImage({
    topic,
    industry,
    businessName,
    style: 'authentic', // or determine from topic
    hasProductImage,
    contentType: 'social-post'
  });
  
  // 2. Fetch the generated image
  const imageResponse = await fetch(result.url);
  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
  
  // 3. Add text overlays if requested
  let finalBuffer = imageBuffer;
  
  if (addTextOverlay) {
    const headline = extractHeadline(topic);
    const textColor = brandPrimaryColor 
      ? getContrastColor(brandPrimaryColor)
      : '#FFFFFF';
    
    finalBuffer = await addTextOverlays(imageBuffer, [
      {
        text: headline,
        position: 'top',
        fontSize: 72,
        color: textColor,
        font: 'Inter',
        weight: '900',
        alignment: 'center',
        strokeColor: '#000000',
        strokeWidth: 2,
        shadow: true
      },
      {
        text: businessName.toUpperCase(),
        position: 'bottom',
        fontSize: 36,
        color: textColor,
        font: 'Inter',
        weight: '600',
        alignment: 'center',
        shadow: true
      }
    ]);
  }
  
  // 4. Upload final image to storage
  const supabase = createClient();
  const filename = `${userId}/generated_${Date.now()}.jpg`;
  
  const { error: uploadError } = await supabase.storage
    .from('generated-images')
    .upload(filename, finalBuffer, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: true
    });
  
  if (uploadError) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
  
  const { data: urlData } = supabase.storage
    .from('generated-images')
    .getPublicUrl(filename);
  
  return NextResponse.json({ 
    url: urlData.publicUrl,
    success: true,
    headline: addTextOverlay ? extractHeadline(topic) : undefined
  });
}
```

---

## Testing Strategy

### A/B Testing Plan

**Control Group:** Current image generation system  
**Test Group:** New simplified system

**Test with 50 images each:**
- 10 HVAC businesses
- 10 Plumbers
- 10 Restaurants
- 10 Salons
- 10 Retail shops

**Metrics to track:**
1. **Success Rate:** % of images without unwanted text
2. **Focal Clarity:** % with clear single focal point (manual review)
3. **User Satisfaction:** Survey rating 1-5
4. **Engagement Rate:** If deployed, track likes/shares/clicks
5. **Generation Time:** Speed comparison

**Expected Results:**
- Success rate: 85%+ (up from ~60%)
- Focal clarity: 90%+ (up from ~40%)
- User satisfaction: 4.0+ (up from 3.2)
- Generation speed: Similar or faster (simpler prompts)

---

## Migration Strategy

### Week 1: Parallel Implementation
- Keep current system running
- Add new simplified system as option
- Feature flag: `USE_SIMPLIFIED_IMAGE_GEN`

### Week 2: A/B Testing
- 50% traffic to new system
- Collect metrics
- Iterate based on feedback

### Week 3: Full Rollout
- If metrics are positive (>80% success), migrate 100%
- Keep old system as fallback for 2 weeks
- Monitor error rates

### Week 4: Cleanup
- Remove old prompt builder
- Clean up deprecated code
- Update documentation

---

## Example Transformations

### Example 1: HVAC Summer Special

**OLD PROMPT (280 words):**
```
Inviting promotional photograph with cinematic lighting, warm highlights and shallow 
depth of field. Natural but vibrant tones matching an energetic mood. Single clear 
subject from the business world, premium focus on the product or service. No generic 
interiors, no furniture showrooms, no pedestals, no abstract decor or mood boards. 
All surfaces and objects free of text or signage. High resolution, detailed textures, 
cinematic composition, shallow depth of field. CRITICAL: This image must contain 
absolutely no text. No words, no letters, no numbers, no signs, no labels, no logos, 
no writing on walls or objects. All surfaces are blank and unmarked...
[continues for 200+ more words]
```

**NEW PROMPT (42 words):**
```
Close-up of HVAC technician hands installing new air filter in residential AC unit. 
Face partially visible showing concentration. Professional tools. Clean home basement. 
Natural window light. One focal point: hands and filter. No text.
```

**Text Overlay (added separately):**
- Headline: "SUMMER TUNE-UP"
- Subtext: "20% OFF THROUGH AUGUST"
- CTA: "BOOK NOW"

---

### Example 2: Restaurant New Menu

**OLD PROMPT (310 words):**
```
[Similar verbose prompt about food photography...]
```

**NEW PROMPT (38 words):**
```
Hero shot of gourmet burger with melted cheese and fresh toppings. 
Product fills 60% of frame, sharp focus. Rustic wooden table. 
Dramatic natural lighting from window. Shallow depth of field. No text.
```

**Text Overlay:**
- Headline: "NEW MENU"
- Subtext: "TRY OUR SIGNATURE BURGER"
- Business name at bottom

---

### Example 3: Salon Services

**OLD PROMPT (295 words):**
```
[Verbose prompt about salon styling...]
```

**NEW PROMPT (45 words):**
```
Close-up of hair stylist hands cutting client's hair in modern salon. 
Client's satisfied face visible in mirror reflection. Professional scissors. 
Clean bright salon. Natural window light. Warm professional atmosphere. 
One focal point: hands styling hair. No text.
```

**Text Overlay:**
- Headline: "FRESH LOOK"
- Subtext: "BOOK YOUR STYLE"
- Business name: "STUDIO SALON"

---

## Success Criteria

### Must Achieve:
- ✅ 85%+ images without unwanted text
- ✅ 90%+ images with clear focal point
- ✅ 4.0+ user satisfaction rating
- ✅ Faster or same generation time

### Nice to Have:
- 📈 Higher engagement on social media posts
- 📈 Better click-through rates on ads
- 📈 More diverse image outputs
- 📈 Easier for non-technical users to understand

---

## Rollback Plan

If the new system doesn't meet success criteria:

1. **Immediate:** Switch feature flag back to old system
2. **Analyze:** What went wrong? Prompts? Text overlay? Focal points?
3. **Iterate:** Fix issues in staging environment
4. **Retest:** Run another A/B test
5. **Decide:** Rollout again or revert permanently

**Rollback Trigger:**
- Success rate < 70%
- User satisfaction < 3.5
- Major bugs or errors

---

## Next Steps for Implementation

### Developer Checklist:

**Phase 1 (Week 1) - Prompt Simplification:**
- [ ] Create new `buildSimplePrompt()` function in `/lib/openai/images.ts`
- [ ] Add focal point templates
- [ ] Add helper functions (getPersonType, getEnvironment, sanitizeTopic)
- [ ] Add feature flag `USE_SIMPLIFIED_IMAGE_GEN`
- [ ] Test with 20 sample prompts
- [ ] Deploy to staging

**Phase 2 (Week 2) - Text Overlay System:**
- [ ] Create `/lib/image-processing/text-overlay.ts`
- [ ] Implement `addTextOverlays()` function
- [ ] Implement `extractHeadline()` function
- [ ] Implement `getContrastColor()` function
- [ ] Test with sample images
- [ ] Add to API route
- [ ] Deploy to staging

**Phase 3 (Week 3) - Integration & Testing:**
- [ ] Update image generation API route
- [ ] Add option for text overlay on/off
- [ ] Set up A/B test infrastructure
- [ ] Run A/B test with 50 images
- [ ] Collect metrics
- [ ] Review with team
- [ ] Make go/no-go decision

**Phase 4 (Week 4) - Rollout:**
- [ ] If successful, set feature flag to 100%
- [ ] Monitor error rates for 1 week
- [ ] Collect user feedback
- [ ] Remove old code if successful
- [ ] Update documentation
- [ ] Celebrate! 🎉

---

## Code Files to Create/Modify

### New Files:
1. `/lib/image-processing/text-overlay.ts` - Text overlay system
2. `/lib/openai/focal-prompts.ts` - Focal point templates (optional separation)

### Modified Files:
1. `/lib/openai/images.ts` - Add simplified prompt builder
2. `/app/api/content/generate-image/route.ts` - Update to use new system
3. `/app/api/image/composite/route.ts` - May need updates for text overlays

### Configuration:
1. Add feature flag in environment: `NEXT_PUBLIC_USE_SIMPLIFIED_IMAGE_GEN=true`

---

## Resources & References

### Research Sources:
- Social Media Advertising Best Practices 2025
- Meta Ads Creative Performance Data
- UGC vs Branded Content Studies
- Visual Marketing Psychology Research
- Mobile-First Design Principles

### Tools:
- DALL-E 3 API (existing)
- Sharp (image processing - existing)
- SVG for text overlays (new)

---

## Questions & Answers

**Q: Won't simpler prompts give worse results?**  
A: No. Research shows DALL-E performs BETTER with clear, directive prompts. Our current verbose prompts confuse the AI.

**Q: What if clients want the old style options?**  
A: The 4 new styles cover all use cases. We can keep old styles as "legacy" if needed.

**Q: How do we handle text in different languages?**  
A: Text overlay system supports any UTF-8 characters. Just ensure font supports the characters.

**Q: What about images that need no text?**  
A: Add `addTextOverlay: false` parameter to API call. System generates clean image only.

**Q: Can we A/B test this easily?**  
A: Yes, feature flag controls which system to use. Easy to split traffic 50/50.

---

## Conclusion

This plan transforms GeoSpark from a complex, over-engineered image generation system to a simple, effective, results-driven system that actually works for local businesses.

**Key Philosophy:** 
> "A clear focal point + authentic human moment + bold text overlay = Scroll-stopping advertising image"

**Implementation Time:** 3-4 weeks  
**Risk Level:** Low (feature-flagged, easy rollback)  
**Expected Impact:** High (2x better success rate, higher engagement)

Ready to implement? Start with Phase 1 this week! 🚀

---

**Document Version:** 1.0  
**Last Updated:** February 13, 2026  
**Status:** Ready for Development  
**Owner:** GeoSpark Engineering Team
