# GeoSpark Cost Analysis
*Last updated: February 2026*

---

## Your Pricing Tiers (Revenue)

| Plan | Monthly | Annual (per month) | Content/mo | Images/mo |
|------|---------|-------------------|------------|-----------|
| Free | $0 | $0 | 5 | 5 |
| Starter | $29 | $23 | 30 | 30 |
| Pro | $79 | $63 | 100 | 100 |
| Premium | $179 | $143 | Unlimited | Unlimited |

---

## Per-Unit Costs (Your Expenses)

### 1. AI Text Generation

You're using **OpenRouter with Claude 3.5 Sonnet** (or fallback to GPT-4o-mini).

**Claude 3.5 Sonnet (via OpenRouter):**
| Metric | Cost |
|--------|------|
| Input tokens | $3.00 / 1M tokens |
| Output tokens | $15.00 / 1M tokens |

**Typical content piece token usage:**
- System prompt + context: ~800 input tokens
- Generated content: ~1,200 output tokens (blog posts longer, social shorter)

**Cost per content piece (Claude 3.5 Sonnet):**
```
Input:  800 tokens × $0.000003 = $0.0024
Output: 1,200 tokens × $0.000015 = $0.018
─────────────────────────────────────────
TOTAL: $0.0204 per content piece (~2 cents)
```

**Social Pack (6 platforms at once):**
```
Input:  1,000 tokens × $0.000003 = $0.003
Output: 2,500 tokens × $0.000015 = $0.0375
─────────────────────────────────────────
TOTAL: $0.0405 per social pack (~4 cents)
```

**GPT-4o-mini Alternative (much cheaper):**
| Metric | Cost |
|--------|------|
| Input tokens | $0.15 / 1M tokens |
| Output tokens | $0.60 / 1M tokens |

**Cost per content piece (GPT-4o-mini):**
```
Input:  800 tokens × $0.00000015 = $0.00012
Output: 1,200 tokens × $0.0000006 = $0.00072
─────────────────────────────────────────────
TOTAL: $0.00084 per content piece (~0.08 cents)
```

### 2. AI Image Generation (DALL-E 3)

| Size | Quality | Cost |
|------|---------|------|
| 1024×1024 (social) | Standard | **$0.040** |
| 1792×1024 (blog/email) | Standard | **$0.080** |
| 1024×1024 (social) | HD | $0.080 |
| 1792×1024 (blog/email) | HD | $0.120 |

**Current setting:** Standard quality = **$0.04 per image** (square) or **$0.08** (landscape)

Average assuming 70% social (square), 30% blog (landscape):
```
(0.70 × $0.04) + (0.30 × $0.08) = $0.052 average per image
```

### 3. Email (Transactional)

**Resend Pricing:**
| Tier | Emails/month | Cost |
|------|--------------|------|
| Free | 3,000 | $0 |
| Pro | 50,000 | $20/mo |
| Business | 100,000 | $80/mo |

**Cost per email:** ~$0.0004 - $0.0008 (negligible)

---

## Monthly Fixed Costs (Infrastructure)

| Service | Free Tier | Paid Tier | Your Likely Tier |
|---------|-----------|-----------|------------------|
| **Supabase** | 500MB DB, 50k MAU | $25/mo Pro | Free → $25 at scale |
| **Vercel** | 100GB bandwidth | $20/mo Pro | Free → $20 at scale |
| **Resend** | 3k emails | $20/mo | Free initially |
| **OpenRouter** | Pay-per-use | Pay-per-use | ~$0 monthly fee |
| **OpenAI (DALL-E)** | Pay-per-use | Pay-per-use | ~$0 monthly fee |
| **Domain** | - | ~$15/year | $1.25/mo |

**Total Fixed Costs:**
- **Starting out:** ~$1.25/mo (just domain)
- **At scale (1000+ users):** ~$66/mo (Supabase + Vercel + Resend + domain)

---

## Profit Margin Analysis by Plan

### Assumptions:
- Using Claude 3.5 Sonnet for text (~$0.02/piece)
- Using DALL-E 3 Standard (~$0.05/image average)
- Users consume 80% of their allocation

### Free Plan ($0/mo)
```
Revenue:                    $0.00
─────────────────────────────────
Content cost (4 × $0.02):   $0.08
Image cost (4 × $0.05):     $0.20
─────────────────────────────────
Variable cost:              $0.28
Margin:                    -$0.28 (loss leader)
```

### Starter Plan ($29/mo)
```
Revenue:                   $29.00
─────────────────────────────────
Content cost (24 × $0.02):  $0.48
Image cost (24 × $0.05):    $1.20
─────────────────────────────────
Variable cost:              $1.68
Gross profit:              $27.32
Margin:                    94.2%
```

### Pro Plan ($79/mo) ⭐ Most Popular
```
Revenue:                   $79.00
─────────────────────────────────
Content cost (80 × $0.02):  $1.60
Image cost (80 × $0.05):    $4.00
─────────────────────────────────
Variable cost:              $5.60
Gross profit:              $73.40
Margin:                    92.9%
```

### Premium Plan ($179/mo)
```
Revenue:                  $179.00
─────────────────────────────────
Assuming 300 content pieces: $6.00
Assuming 300 images:        $15.00
─────────────────────────────────
Variable cost:              $21.00
Gross profit:             $158.00
Margin:                    88.3%
```

---

## Cost Comparison: Claude vs GPT-4o-mini

If you switch to **GPT-4o-mini** for text generation:

| Plan | Claude Cost | GPT-4o-mini Cost | Savings |
|------|-------------|------------------|---------|
| Free | $0.28 | $0.23 | $0.05 |
| Starter | $1.68 | $1.22 | $0.46 |
| Pro | $5.60 | $4.07 | $1.53 |
| Premium | $21.00 | $15.25 | $5.75 |

**Recommendation:** Claude 3.5 Sonnet produces higher quality content, and the cost difference is minimal at your margins. Stick with Claude for quality.

---

## Breakeven Analysis

**Monthly fixed costs at scale:** ~$66

**Breakeven with Starter plans only:**
```
$66 ÷ $27.32 gross profit = 2.4 customers
```

**Breakeven with Pro plans:**
```
$66 ÷ $73.40 gross profit = 0.9 customers
```

**You need just 1 Pro customer or 3 Starter customers to cover all fixed costs.**

---

## Scenario: 100 Paying Customers

| Mix | Revenue | Variable Costs | Fixed Costs | Net Profit | Margin |
|-----|---------|----------------|-------------|------------|--------|
| 50 Starter, 40 Pro, 10 Premium | $6,400 | $340 | $66 | **$5,994** | 93.7% |
| 100 Pro | $7,900 | $560 | $66 | **$7,274** | 92.1% |
| 80 Starter, 20 Premium | $5,900 | $555 | $66 | **$5,279** | 89.5% |

---

## Summary: Per-Unit Cost Table

| Item | Your Cost | Notes |
|------|-----------|-------|
| **1 Blog Post** | $0.02 | Claude 3.5 Sonnet |
| **1 Social Pack** (6 posts) | $0.04 | Claude 3.5 Sonnet |
| **1 GMB Post** | $0.02 | Claude 3.5 Sonnet |
| **1 Email** | $0.02 | Claude 3.5 Sonnet |
| **1 Image** (square) | $0.04 | DALL-E 3 Standard |
| **1 Image** (landscape) | $0.08 | DALL-E 3 Standard |
| **1 Transactional Email** | $0.0004 | Resend |

---

## Key Takeaways

1. **Your margins are excellent** (88-94%) — SaaS gold standard is 70-80%
2. **AI costs are negligible** relative to subscription revenue
3. **Images are your biggest variable cost** (DALL-E at $0.04-0.08)
4. **Fixed costs stay low** until you hit significant scale
5. **Premium "unlimited" plan is risky** — consider soft caps or usage-based pricing above 500/month
6. **Free tier costs ~$0.28/user** — acceptable for conversion funnel

---

## Recommendations

1. **Keep Claude 3.5 Sonnet** — quality justifies the ~$0.01 premium per piece
2. **Consider image caching** — if users regenerate images, cache originals to avoid re-billing
3. **Monitor Premium users** — "unlimited" could become expensive with power users
4. **Add usage analytics** — track actual consumption to refine these estimates
5. **Annual billing discount (20%)** — encourages commitment, improves cash flow

---

*This analysis assumes standard usage patterns. Actual costs may vary based on content length, image dimensions, and user behavior.*
