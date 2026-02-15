# ⚡ CURSOR SETUP & START INSTRUCTIONS

## 🚨 CRITICAL: API Keys Required BEFORE Starting

### **MUST HAVE (Get These First):**

#### 1. Replicate API Token (REQUIRED for SDXL)
**Why:** SDXL is 90% cheaper than DALL-E for backgrounds  
**Cost:** Free tier available, then pay-per-use ($0.005/image)

**Get it:**
1. Go to: https://replicate.com
2. Click "Sign Up" (free)
3. Go to Account → API Tokens
4. Copy your token (starts with `r8_`)
5. Add to `.env.local`:
```bash
REPLICATE_API_TOKEN=r8_your_token_here
```

#### 2. Remove.bg API Key (STRONGLY RECOMMENDED)
**Why:** Professional background removal for complex product images  
**Cost:** 50 free images/month, then $0.20 per image

**Get it:**
1. Go to: https://remove.bg/api
2. Sign up (free account)
3. Get API key from dashboard
4. Add to `.env.local`:
```bash
REMOVE_BG_API_KEY=your_key_here
```

#### 3. OpenAI API Key (Already Have)
Keep existing key in `.env.local`

---

## 🎯 Strategy (NOT Fallbacks)

This is the **intended production strategy:**

| Workflow | Model | Cost | When to Use |
|----------|-------|------|-------------|
| **Product Backgrounds** | **SDXL** | $0.005 | Simple branded backgrounds (90% cheaper!) |
| **Service Workers** | **DALL-E 3** | $0.04 | Complex scenes with humans (better quality) |
| **Simple BG Removal** | **Sharp** | Free | Clean white/solid backgrounds (automatic) |
| **Complex BG Removal** | **Remove.bg** | $0.20 | Product photos with complex backgrounds |

### What "Fallback" Means:

**ONLY for technical failures:**
- ❌ NOT: "I don't have the API key so I'll skip it"
- ✅ YES: "API server returned 500 error, temporarily using alternative"

```typescript
// Correct fallback logic:
try {
  return await generateWithSDXL(prompt);
} catch (error) {
  if (error.status === 500 || error.code === 'ETIMEDOUT') {
    console.error('SDXL API is down, using DALL-E temporarily');
    return await generateWithDALLE(prompt);
  }
  throw error; // Don't catch missing API keys
}
```

---

## ✅ Pre-Implementation Checklist

Before running ANY code:

- [ ] Replicate account created
- [ ] Replicate API token obtained
- [ ] Remove.bg account created
- [ ] Remove.bg API key obtained
- [ ] Both keys added to `.env.local`
- [ ] File permissions checked (`chmod 600 .env.local`)
- [ ] Dependencies installed: `npm install replicate sharp form-data`

**DO NOT proceed to implementation until all keys are configured.**

---

## 📖 Implementation Guide

**After obtaining all API keys:**

1. **Read:** `/docs/CURSOR_AUTONOMOUS_IMPLEMENTATION.md`
   - Complete code for all 6 files
   - Phase-by-phase instructions

2. **Create files in order:**
   - Phase 1: Brand personality detection
   - Phase 2: SDXL client integration
   - Phase 3: Background removal (Sharp + Remove.bg)
   - Phase 4: Product composition
   - Phase 5: Text overlays
   - Phase 6: API route updates

3. **Test each phase** before moving to next

4. **Document results** in `/docs/IMPLEMENTATION_COMPLETE.md`

---

## 🎯 Success Criteria

When finished, you should have:

✅ **SDXL generating backgrounds** (fast, cheap, good quality)  
✅ **DALL-E generating service images** (complex scenes, humans)  
✅ **Remove.bg handling complex products** (professional quality)  
✅ **Sharp handling simple products** (free, instant)  
✅ **Hybrid model selection working** (automatic, cost-optimized)  
✅ **Cost tracking accurate** ($0.005 - $0.24 per image)  
✅ **No errors, all tests passing**

---

## 💰 Expected Costs After Implementation

**Per Image:**
- Simple service image (no product): $0.04 (DALL-E only)
- Product with clean background: $0.005 (SDXL) + $0.00 (Sharp) = $0.005
- Product with complex background: $0.005 (SDXL) + $0.20 (Remove.bg) = $0.205

**Monthly (1000 images):**
- 50% service images: 500 × $0.04 = $20
- 25% clean product images: 250 × $0.005 = $1.25
- 25% complex product images: 250 × $0.205 = $51.25
- **Total: ~$72.50/month** vs **$100/month** before = **27.5% savings**

**This is the goal. This is not a fallback strategy.**

---

## 🚨 Common Mistakes to Avoid

### ❌ WRONG:
"I'll implement it without the API keys and just use DALL-E for everything"

### ✅ CORRECT:
"I'll get the API keys first, then implement the hybrid strategy as designed"

---

### ❌ WRONG:
"SDXL is optional, I'll add it later"

### ✅ CORRECT:
"SDXL is core to the cost optimization strategy, I need it from the start"

---

### ❌ WRONG:
"Remove.bg costs money, I'll skip it and use free method for everything"

### ✅ CORRECT:
"Remove.bg gives professional results for 30% of images, worth the investment"

---

## 🔧 Environment File Template

Your `.env.local` should look like:

```bash
# Core Services (Already Have)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxxxxx

# New Services (GET THESE NOW)
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxx
REMOVE_BG_API_KEY=xxxxxxxxxxxxx

# Optional (Add Later)
# ANTHROPIC_API_KEY=sk-ant-xxxxx  # For future features
```

---

## 📞 Getting Help

### If Replicate Signup Fails:
- Try different email
- Check spam folder for verification
- Contact: team@replicate.com

### If Remove.bg Signup Fails:
- Try different email  
- Free tier is limited but sufficient for testing
- Contact: support@remove.bg

### If API Keys Don't Work:
- Verify keys are correct (no extra spaces)
- Check `.env.local` is in root directory
- Restart dev server: `npm run dev`
- Check console for error messages

---

## 🚀 Ready to Start?

✅ All API keys obtained?  
✅ All keys in `.env.local`?  
✅ Dependencies installed?  

**Then proceed to:** `/docs/CURSOR_AUTONOMOUS_IMPLEMENTATION.md`

---

## ⏱️ Time Estimates

- Getting API keys: 15 minutes
- Phase 1 (Brand Detection): 30 minutes
- Phase 2 (SDXL Integration): 30 minutes
- Phase 3 (Background Removal): 20 minutes
- Phase 4 (Product Composition): 20 minutes
- Phase 5 (Text Overlays): 20 minutes
- Phase 6 (API Updates): 15 minutes
- Testing & Documentation: 30 minutes

**Total: ~3 hours** (including setup)

---

## 🎯 Final Note

**This is not a "make it work with what you have" project.**

**This is a "implement the optimal solution with the right tools" project.**

Get the API keys. Use the hybrid strategy. Build it right the first time.

**Now go get those API keys, then start implementation!** 🚀
