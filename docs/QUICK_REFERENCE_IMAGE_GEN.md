# Quick Implementation Reference - Image Generation Simplification

## TL;DR - What to Change

### The Big Idea
Replace complex 300-word prompts with simple 50-word prompts + separate text overlays

### Before/After Comparison

**BEFORE:**
```typescript
// 300+ word prompt trying to prevent text
"Inviting promotional photograph with cinematic lighting... CRITICAL: no text..."
```

**AFTER:**
```typescript
// 50-word focused prompt
"Close-up of plumber hands fixing pipe. Face visible. Natural light. One focal point."

// Then add text separately
addTextOverlays(image, [
  { text: "20% OFF", position: "top" }
])
```

---

## Files to Create

### 1. `/lib/image-processing/text-overlay.ts`
**Purpose:** Add text to images AFTER generation (not during)

**Key Functions:**
- `addTextOverlays(imageBuffer, overlays)` - Main function
- `extractHeadline(topic)` - Pull promo text from topic
- `getContrastColor(bgColor)` - Smart text color

**Lines of Code:** ~200

---

### 2. `/lib/openai/focal-prompts.ts` (optional)
**Purpose:** Separate focal point templates from main file

**Key Exports:**
- `FOCAL_POINT_TEMPLATES` - Template strings
- `getFocalPrompt(type, industry, topic)` - Builder function

**Lines of Code:** ~100

---

## Files to Modify

### 1. `/lib/openai/images.ts`

**Changes:**

```typescript
// REPLACE this function:
function buildImagePrompt(params) {
  // ... 300 lines of complex logic
}

// WITH this:
function buildSimplePrompt(params: GenerateImageParams): string {
  const { topic, industry, hasProductImage } = params;
  
  // Determine focal type
  const focalType = hasProductImage ? 'product_hero' : 
                    hasHumanIndustry(industry) ? 'human_service' : 
                    'environment_result';
  
  // Get template
  const focal = FOCAL_PROMPTS[focalType](industry, topic);
  const mood = STYLE_MOODS[params.style || 'authentic'];
  
  // Return simple prompt (50-100 words)
  return `${focal} ${mood} No text.`;
}

// Add these maps:
const FOCAL_PROMPTS = {
  human_service: (industry, topic) => 
    `Close-up of ${getPersonType(industry)} working on ${sanitizeTopic(topic)}. 
     Face showing concentration. Hands with tools. Natural light.`,
  
  product_hero: (industry, topic) =>
    `Hero shot of ${sanitizeTopic(topic)}. Product fills frame. Minimal background.`,
  
  environment_result: (industry, topic) =>
    `Wide shot of completed ${sanitizeTopic(topic)} in ${getEnvironment(industry)}.`
};

const STYLE_MOODS = {
  authentic: 'Candid aesthetic. Soft light.',
  professional: 'Editorial quality. DSLR.',
  promotional: 'Cinematic warmth.',
  lifestyle: 'Golden hour glow.'
};
```

**Lines Changed:** ~100  
**Lines Added:** ~150  
**Lines Removed:** ~200

---

### 2. `/app/api/content/generate-image/route.ts`

**Changes:**

```typescript
// ADD after image generation:

// 1. Generate clean image
const result = await generateImage({...params});

// 2. Fetch image
const imageResponse = await fetch(result.url);
const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

// 3. Add text overlays
const headline = extractHeadline(topic);
const finalBuffer = await addTextOverlays(imageBuffer, [
  {
    text: headline,
    position: 'top',
    fontSize: 72,
    color: '#FFFFFF',
    font: 'Inter',
    weight: '900',
    alignment: 'center',
    shadow: true
  },
  {
    text: businessName.toUpperCase(),
    position: 'bottom',
    fontSize: 36,
    color: '#FFFFFF',
    font: 'Inter',
    weight: '600',
    alignment: 'center',
    shadow: true
  }
]);

// 4. Upload final image
// ... (existing upload code)
```

**Lines Added:** ~30

---

## Simplified Prompt Examples

### Service Business (No Product)

```typescript
// HVAC
"Close-up of HVAC technician hands installing air filter. 
Face showing concentration. Professional tools. Clean basement. 
Natural window light. One focal point: hands and filter. No text."

// Plumber  
"Close-up of plumber hands fixing pipe under sink. 
Face visible. Wrench in action. Modern kitchen. 
Natural light. One focal point: hands at work. No text."

// Hair Salon
"Close-up of stylist hands cutting hair. Client face in mirror. 
Professional scissors. Bright salon. Natural light. 
One focal point: hands styling. No text."
```

### Product Business

```typescript
// Restaurant
"Hero shot of gourmet burger with melted cheese. 
Product fills 60% of frame. Rustic wooden table. 
Dramatic natural lighting. Shallow depth. No text."

// Retail
"Hero shot of leather handbag on clean white surface. 
Product fills frame, sharp focus. Minimal props. 
Soft natural light. Shallow depth. No text."
```

---

## Helper Functions to Add

```typescript
function hasHumanIndustry(industry: string): boolean {
  const humanIndustries = [
    'hvac', 'plumber', 'electrician', 'roofing', 
    'cleaning', 'salon', 'dental', 'auto', 'landscaping'
  ];
  return humanIndustries.some(ind => 
    industry.toLowerCase().includes(ind)
  );
}

function getPersonType(industry: string): string {
  const map: Record<string, string> = {
    'hvac': 'HVAC technician',
    'plumber': 'professional plumber',
    'electrician': 'certified electrician',
    'salon': 'hair stylist',
    'dental': 'dentist',
    'auto': 'skilled mechanic'
  };
  
  for (const [key, value] of Object.entries(map)) {
    if (industry.toLowerCase().includes(key)) return value;
  }
  return 'service professional';
}

function getEnvironment(industry: string): string {
  const map: Record<string, string> = {
    'hvac': 'modern home',
    'plumbing': 'residential bathroom',
    'electrical': 'home interior',
    'landscaping': 'suburban yard',
    'salon': 'modern salon'
  };
  
  for (const [key, value] of Object.entries(map)) {
    if (industry.toLowerCase().includes(key)) return value;
  }
  return 'professional setting';
}

function sanitizeTopic(topic: string): string {
  // Remove promotional text
  let clean = topic
    .replace(/\d+%/g, '')
    .replace(/\$\d+/g, '')
    .replace(/\b(sale|off|special|limited|free|now)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  return clean.length > 3 ? clean : 'the service';
}
```

---

## Testing Commands

### Test Prompt Generation

```typescript
// In your code or console:
const result = buildSimplePrompt({
  topic: "Summer HVAC Tune-Up - 20% Off",
  industry: "HVAC",
  businessName: "Cool Air Co",
  style: 'authentic'
});

console.log(result);
// Expected: ~50 words, focused on hands/tools, no mention of percentages
```

### Test Text Overlay

```typescript
import { extractHeadline } from './lib/image-processing/text-overlay';

console.log(extractHeadline("50% Off Summer Sale"));
// Expected: "50% OFF"

console.log(extractHeadline("New Menu Items Available"));
// Expected: "NEW MENU"

console.log(extractHeadline("Book Your Tune-Up Today"));
// Expected: "BOOK TODAY"
```

---

## Implementation Checklist

### Day 1: Setup
- [ ] Create `/lib/image-processing/text-overlay.ts`
- [ ] Add `addTextOverlays()` function
- [ ] Add `extractHeadline()` function
- [ ] Add `getContrastColor()` function
- [ ] Test text overlay on sample image

### Day 2: Prompt Simplification
- [ ] Add `buildSimplePrompt()` to `/lib/openai/images.ts`
- [ ] Add helper functions (getPersonType, sanitizeTopic, etc.)
- [ ] Add FOCAL_PROMPTS templates
- [ ] Add STYLE_MOODS map
- [ ] Test with 10 sample prompts

### Day 3: Integration
- [ ] Update image generation API route
- [ ] Connect text overlay system
- [ ] Add feature flag
- [ ] Test end-to-end flow
- [ ] Deploy to staging

### Day 4: Testing
- [ ] Generate 20 test images
- [ ] Check for unwanted text
- [ ] Check focal point clarity
- [ ] Get feedback from team
- [ ] Iterate if needed

### Day 5: Launch
- [ ] Enable feature flag for 50% of traffic
- [ ] Monitor metrics
- [ ] Collect user feedback
- [ ] Make go/no-go decision for 100% rollout

---

## Common Pitfalls to Avoid

❌ **DON'T:**
- Make prompts too long again (keep under 100 words)
- Try to add text with DALL-E (use text overlay instead)
- Use multiple focal points (one focal point only!)
- Forget to sanitize promotional text from topic
- Skip the text overlay step (it's critical)

✅ **DO:**
- Keep prompts simple and focused
- Use ONE clear focal point
- Add text separately using Sharp/SVG
- Test with real business scenarios
- Monitor success rate

---

## Quick Reference: Focal Point Types

| Business Type | Focal Point | Example Prompt |
|--------------|-------------|----------------|
| Service (Human) | Hands + Face | "Close-up of technician hands installing..." |
| Service (Result) | Completed work | "Wide shot of completed renovation..." |
| Product | Product hero | "Hero shot of product filling frame..." |
| Experience | Customer emotion | "Portrait of satisfied customer..." |
| Before/After | Split comparison | "Side-by-side: problem vs solution..." |

---

## Need Help?

**Full Plan:** See `IMAGE_GENERATION_IMPROVEMENT_PLAN.md`

**Key Sections:**
- Phase 1: Prompt Simplification (Week 1)
- Phase 2: Text Overlay System (Week 2)
- Phase 3: Integration (Week 3)

**Questions?**
- Check the FAQ section in the full plan
- Review the example transformations
- Look at the before/after comparisons

---

**Remember:** Simple prompts + Clear focal point + Separate text = Better results! 🚀
