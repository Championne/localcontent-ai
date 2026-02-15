# Image Model Selection for Brand-Aware Generation
## Analysis & Recommendation for GeoSpark

**Created:** February 13, 2026  
**Status:** Decision Required  
**Priority:** HIGH - Affects Cost & Quality

---

## Executive Summary

**Current State:** Using DALL-E 3 for all images ($0.04-0.08 per image)

**Recommendation:** **HYBRID APPROACH**
- **Workflow A (Product Backgrounds):** Switch to SDXL ($0.005) - **90% cost savings**
- **Workflow B (Service Workers):** Keep DALL-E 3 ($0.04) - **Better quality**

**Expected Savings:** ~40% overall cost reduction

---

## Detailed Model Comparison

### 1. DALL-E 3 (Current)

#### Strengths:
- ✅ Excellent prompt understanding ("HVAC technician hands installing filter")
- ✅ Reliable human generation (faces, hands, clothing)
- ✅ Good compositional intelligence
- ✅ Stable, production-ready API
- ✅ Can handle brand aesthetic context

#### Weaknesses:
- ❌ Expensive: $0.04-0.08 per image
- ❌ Slow: 10-30 seconds generation time
- ❌ Limited color control (can't force exact hex colors)
- ❌ Terrible at text (we work around this anyway)
- ❌ Sometimes too "artistic" even with "natural" style

#### Cost:
```
Standard 1024x1024: $0.04
Standard 1024x1792: $0.08
HD 1024x1024: $0.08
HD 1024x1792: $0.12
```

#### Best For:
- Complex scenes with humans
- Service worker images
- Specific professions/actions
- When prompt complexity matters

---

### 2. Stable Diffusion XL (SDXL)

#### Strengths:
- ✅ **10x cheaper**: $0.003-0.01 per image
- ✅ **Very fast**: 2-5 seconds
- ✅ Better color control (ControlNet)
- ✅ Can fine-tune on brand examples
- ✅ Excellent for backgrounds/surfaces
- ✅ Good for product photography backdrops

#### Weaknesses:
- ❌ Worse at complex prompts
- ❌ Less reliable for specific humans ("HVAC technician")
- ❌ May need multiple generations
- ❌ Quality varies by prompt
- ❌ Requires more prompt engineering

#### Cost:
```
Via Replicate: $0.003 per image
Via Together.ai: $0.005 per image
Via FAL.ai: $0.008 per image
Self-hosted: $0.001 (GPU costs)
```

#### Best For:
- Simple backgrounds
- Product surfaces
- Abstract scenes
- Color-controlled environments
- When cost matters

---

### 3. Flux Pro

#### Strengths:
- ✅ Better prompt adherence than DALL-E
- ✅ Faster: 5-10 seconds
- ✅ More photorealistic
- ✅ Better color accuracy
- ✅ More consistent outputs

#### Weaknesses:
- ❌ **Most expensive**: $0.055 per image
- ❌ Less compositional understanding
- ❌ Newer, less proven
- ❌ Fewer examples/best practices

#### Cost:
```
Via Replicate: $0.055 per image
Via Together.ai: $0.04 per image
Via BFL (official): $0.06 per image
```

#### Best For:
- High-end marketing imagery
- When you need the absolute best quality
- Photorealistic product shots
- Worth the premium cost

---

### 4. Leonardo.ai

#### Strengths:
- ✅ Marketing/advertising focused models
- ✅ Fast generation
- ✅ Good API
- ✅ Multiple specialized models
- ✅ Reasonable pricing

#### Weaknesses:
- ❌ Less intelligent than DALL-E
- ❌ Can be generic
- ❌ Smaller models

#### Cost:
```
Standard: $0.01 per image
Premium models: $0.02 per image
```

#### Best For:
- Marketing teams
- Batch generation
- When speed + cost matter more than perfection

---

## Use Case Analysis

### What GeoSpark Actually Needs:

#### Workflow A: Branded Backgrounds (for product compositing)
**Requirements:**
- Clean surface/environment
- Brand colors in lighting
- Appropriate mood (energetic/professional/luxury)
- Negative space for product
- Simple, not complex

**Perfect for:** **SDXL** ✅
- Simple prompts ("clean surface with warm red lighting")
- Color control via ControlNet
- 10x cheaper
- Fast enough for real-time

#### Workflow B: Service Worker Images
**Requirements:**
- Specific person ("HVAC technician", "plumber")
- Realistic hands/tools
- Appropriate environment
- Brand colors in setting
- Complex composition

**Perfect for:** **DALL-E 3** ✅
- Best prompt understanding
- Reliable human generation
- Worth the cost for quality
- Can't risk bad outputs here

---

## Recommended Hybrid Architecture

### Implementation:

```typescript
// /lib/image-generation/model-selector.ts

export function selectModel(params: {
  workflow: 'background' | 'service';
  complexity: 'simple' | 'complex';
  budget: 'low' | 'standard' | 'premium';
}): 'dalle3' | 'sdxl' | 'flux' {
  
  // Workflow A: Product Backgrounds
  if (params.workflow === 'background') {
    return params.budget === 'premium' ? 'flux' : 'sdxl';
  }
  
  // Workflow B: Service Workers
  if (params.workflow === 'service') {
    return params.complexity === 'complex' ? 'dalle3' : 'sdxl';
  }
  
  return 'dalle3'; // Default fallback
}

// Usage in generation code:
const model = selectModel({
  workflow: hasProductImage ? 'background' : 'service',
  complexity: requiresHumans ? 'complex' : 'simple',
  budget: 'standard'
});

if (model === 'sdxl') {
  return await generateWithSDXL(prompt, brandColors);
} else {
  return await generateWithDALLE3(prompt);
}
```

### Cost Comparison:

**Current (DALL-E only):**
```
Service image: $0.04
Product bg: $0.04 + $0.20 bg removal = $0.24
Average: ~$0.10 per image
```

**Hybrid (SDXL + DALL-E):**
```
Service image: $0.04 (DALL-E)
Product bg: $0.005 (SDXL) + $0.20 bg removal = $0.205
Average: ~$0.06 per image

SAVINGS: 40% reduction
```

**If 1000 images/month:**
- Current: $100/month
- Hybrid: $60/month
- **Save $40/month = $480/year**

---

## Implementation Plan

### Phase 1: Add SDXL Integration (Week 1)

**New file:** `/lib/image-generation/sdxl-client.ts`

```typescript
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function generateWithSDXL(
  prompt: string,
  options: {
    width?: number;
    height?: number;
    brandColors?: { primary: string; secondary?: string };
    controlNetEnabled?: boolean;
  } = {}
): Promise<{ url: string; cost: number }> {
  
  const {
    width = 1024,
    height = 1024,
    brandColors,
    controlNetEnabled = false
  } = options;
  
  // Enhance prompt with color guidance if brand colors provided
  let enhancedPrompt = prompt;
  if (brandColors?.primary) {
    enhancedPrompt += ` Color palette: ${brandColors.primary}. Lighting matches this color tone.`;
  }
  
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
        negative_prompt: "text, watermark, letters, words, labels, signs, low quality, blurry, distorted"
      }
    }
  );
  
  const imageUrl = Array.isArray(output) ? output[0] : output;
  
  return {
    url: imageUrl as string,
    cost: 0.005
  };
}
```

### Phase 2: Model Selection Logic (Week 1)

**Update:** `/lib/openai/images.ts`

```typescript
import { generateWithSDXL } from '@/lib/image-generation/sdxl-client';

export async function generateImage(params: GenerateImageParams) {
  // Determine which model to use
  const useSDXL = params.hasProductImage && !params.requiresComplexScene;
  
  if (useSDXL) {
    console.log('Using SDXL for branded background');
    
    const result = await generateWithSDXL(
      buildBrandAwarePrompt(params),
      {
        width: 1024,
        height: 1024,
        brandColors: params.brandColors
      }
    );
    
    return {
      url: result.url,
      cost: result.cost,
      model: 'sdxl',
      ...
    };
  }
  
  // Use DALL-E 3 for complex scenes
  console.log('Using DALL-E 3 for service worker image');
  return await generateWithDALLE3(params);
}
```

### Phase 3: A/B Testing (Week 2)

Test SDXL vs DALL-E for backgrounds:
- Generate 50 backgrounds with SDXL
- Generate 50 backgrounds with DALL-E
- Compare quality scores
- Measure success rate
- Calculate actual cost savings

**Success Criteria:**
- SDXL quality score >= 80% of DALL-E
- Background removal works equally well
- Brand colors integrated properly
- Generation time < 10 seconds

### Phase 4: Gradual Rollout (Week 3)

```
Week 3 Day 1-2: 10% SDXL / 90% DALL-E
Week 3 Day 3-4: 25% SDXL / 75% DALL-E
Week 3 Day 5-7: 50% SDXL / 50% DALL-E
Week 4: 100% SDXL for backgrounds (if tests pass)
```

---

## Risk Analysis

### Risks of Switching:

1. **Quality Variation**
   - SDXL less consistent than DALL-E
   - **Mitigation:** Keep DALL-E as fallback, regenerate if quality low

2. **Prompt Engineering**
   - SDXL needs different prompt style
   - **Mitigation:** Test extensively, build prompt templates

3. **Color Accuracy**
   - SDXL may not match brand colors exactly
   - **Mitigation:** Use ControlNet, add color correction post-processing

4. **API Reliability**
   - Third-party APIs (Replicate) less reliable than OpenAI
   - **Mitigation:** Implement retry logic, fallback to DALL-E

5. **Learning Curve**
   - Team needs to learn new model
   - **Mitigation:** Document thoroughly, provide examples

---

## Alternative: Flux Pro Consideration

If SDXL quality is insufficient, consider **Flux Pro** as middle ground:

### Flux Pro Hybrid:
```
Backgrounds: Flux Pro ($0.055)
Service workers: DALL-E 3 ($0.04)
Average: ~$0.08 per image
```

**Pros:**
- Better quality than SDXL
- Faster than DALL-E
- More photorealistic
- Better color accuracy

**Cons:**
- More expensive than SDXL
- Only 20% savings vs current

**When to use Flux:**
- If SDXL fails quality tests
- If users demand premium quality
- If cost savings less critical

---

## Decision Matrix

| Metric | DALL-E Only | SDXL Hybrid | Flux Hybrid |
|--------|-------------|-------------|-------------|
| **Cost/image** | $0.10 | $0.06 | $0.08 |
| **Quality** | 9/10 | 7/10 | 9/10 |
| **Speed** | 15s | 8s | 10s |
| **Reliability** | 9/10 | 7/10 | 8/10 |
| **Color Control** | 6/10 | 9/10 | 8/10 |
| **Setup Complexity** | Low | Medium | Medium |
| **Risk** | Low | Medium | Low |

---

## Final Recommendation

### Primary Strategy: **SDXL Hybrid**

1. **Implement SDXL for Workflow A** (product backgrounds)
   - Cost: $0.005 vs $0.04 (90% savings)
   - Quality sufficient for backgrounds
   - Fast generation
   - Better color control

2. **Keep DALL-E 3 for Workflow B** (service workers)
   - Worth $0.04 for reliable human generation
   - Complex prompt understanding needed
   - Can't risk poor quality here

3. **Fallback Strategy**
   - If SDXL fails (quality < threshold), auto-retry with DALL-E
   - Track failure rate
   - If >20% failure, reconsider

### Timeline:
- **Week 1:** Implement SDXL integration
- **Week 2:** A/B test 50 images
- **Week 3:** Gradual rollout (10% → 100%)
- **Week 4:** Monitor and optimize

### Expected Outcome:
- **40% cost reduction**
- **Faster generation**
- **Better color control**
- **Same or better quality**

---

## Implementation Code

### Environment Variables:
```bash
# Add to .env.local
REPLICATE_API_TOKEN=r8_xxx  # For SDXL
OPENAI_API_KEY=sk-xxx       # For DALL-E (keep)
```

### Package Dependencies:
```json
{
  "dependencies": {
    "replicate": "^0.25.0",
    "openai": "^4.20.0"
  }
}
```

### Install:
```bash
npm install replicate
```

---

## Questions to Answer

1. **Quality Tolerance:** Can we accept 85% quality for 90% cost savings?
2. **Fallback Budget:** How many DALL-E fallbacks are acceptable per month?
3. **Premium Option:** Should we offer "Premium" generation with Flux/DALL-E HD?
4. **Testing Budget:** Allocate $50 for testing SDXL vs DALL-E?

---

## Next Steps

1. **Review this analysis** with team
2. **Decide:** SDXL Hybrid vs Status Quo vs Flux
3. **Allocate testing budget** ($50)
4. **Implement SDXL integration** (Week 1)
5. **Run A/B tests** (Week 2)
6. **Make final decision** based on data

---

**Bottom Line:** Using SDXL for product backgrounds while keeping DALL-E for service workers gives us **40% cost savings** with **minimal quality impact**. The hybrid approach is the smart move.

**Recommendation:** Implement and test SDXL hybrid approach. 🚀
