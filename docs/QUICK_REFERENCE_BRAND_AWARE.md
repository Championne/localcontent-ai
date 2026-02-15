# Quick Reference - Brand-Aware Image Generation

## What Changed (Evening Update)

### ❌ ELIMINATED:
- Step 3 manual logo placement
- Frame selection
- Tint overlays  
- Manual text controls

### ✅ NEW APPROACH:
- Auto-detect brand personality from colors
- Bake brand into image generation
- Smart text overlays with brand color bars
- One-click generation

---

## Implementation Checklist

### Day 1-2: Brand Detection
- [ ] Create `/lib/branding/personality-detection.ts`
- [ ] Add `detectBrandPersonality()` function
- [ ] Test with different brand colors
- [ ] Verify personality mapping

### Day 3-4: Brand-Aware Prompts  
- [ ] Update `/lib/openai/images.ts`
- [ ] Add `buildBrandAwarePrompt()` 
- [ ] Test Workflow B (no product)
- [ ] Compare old vs new outputs

### Day 5-7: Product Workflow
- [ ] Create `/lib/image-processing/background-removal.ts`
- [ ] Implement hybrid removal (Sharp + Remove.bg)
- [ ] Create `/lib/image-processing/product-composition.ts`
- [ ] Test Workflow A (with product)

### Day 8-10: Text Overlays
- [ ] Update `/lib/image-processing/text-overlay.ts`
- [ ] Add brand color bar system
- [ ] Test readability across brand colors
- [ ] Add contrast detection

### Day 11-14: UI Simplification
- [ ] Remove Step 3 controls from frontend
- [ ] Add product upload instructions
- [ ] Add cost preview
- [ ] Test user flow

---

## Quick Code Snippets

### Brand Personality Detection
```typescript
// /lib/branding/personality-detection.ts
const personality = detectBrandPersonality('#FF5733', '#333333');
// Returns: { personality: 'energetic', mood: '...', colorDescription: '...', lightingStyle: '...' }
```

### Brand-Aware Prompt
```typescript
// /lib/openai/images.ts
const prompt = buildBrandAwarePrompt({
  topic: "Summer Sale",
  industry: "HVAC",
  brandColors: { primary: '#FF5733' },
  hasProductImage: false
});
// Returns: "HVAC technician working... energetic atmosphere... warm reds in environment..."
```

### Smart Background Removal
```typescript
// /lib/image-processing/background-removal.ts
const result = await smartBackgroundRemoval(productImageBuffer);
// Returns: { buffer: Buffer, method: 'free' | 'paid', cost: 0 | 0.20 }
```

### Smart Text Overlay
```typescript
// /lib/image-processing/smart-text-overlay.ts
const final = await addSmartTextOverlay(
  imageBuffer,
  "20% OFF",
  "#FF5733",
  "Cool Air HVAC"
);
// Returns: Image with brand color bar + text
```

---

## Workflows

### Workflow A: With Product
```
User uploads → Auto remove BG → Generate branded background → 
Composite product → Add text bar → Done
```

### Workflow B: Without Product (Service)
```
User provides topic → Generate brand-aware service image → 
Add text bar → Done
```

---

## Cost Tracking

| Item | Cost | Frequency |
|------|------|-----------|
| DALL-E base | $0.04 | Every image |
| Simple BG removal | $0.00 | 70% of products |
| Complex BG removal | $0.20 | 30% of products |
| **Average** | **~$0.10** | Per image |

---

## Testing Commands

```bash
# Test brand detection
npm run test:brand-detection

# Test Workflow B (service images)
npm run test:service-workflow

# Test Workflow A (product images)  
npm run test:product-workflow

# A/B test old vs new
npm run test:compare-outputs
```

---

## Files to Create

1. `/lib/branding/personality-detection.ts` (~100 lines)
2. `/lib/image-processing/background-removal.ts` (~150 lines)
3. `/lib/image-processing/product-composition.ts` (~120 lines)
4. `/lib/image-processing/smart-text-overlay.ts` (~100 lines)

## Files to Update

1. `/lib/openai/images.ts` - Add brand-aware prompts
2. `/app/api/content/generate-image/route.ts` - New workflow
3. `/app/dashboard/content/components/ImageGenerator.tsx` - Remove Step 3

---

## Common Issues

### Brand Colors Not Integrating?
- Check if personality detection is working
- Verify prompt includes brand context
- Test with extreme colors (very saturated)

### Background Removal Quality Poor?
- Check if Remove.bg API key is set
- Verify hybrid logic (0.7 threshold)
- Test with clean background images

### Text Not Readable?
- Check contrast detection
- Verify brand color bar opacity (0.90)
- Test with light and dark brand colors

---

## Next Steps

1. **Read** `BRAND_AWARE_IMAGE_GENERATION.md` for details
2. **Start** with Day 1-2 (Brand Detection)
3. **Test** each component thoroughly  
4. **Deploy** with feature flag
5. **Monitor** metrics

---

**Remember:** Brand integration must feel native, not layered! 🎨
