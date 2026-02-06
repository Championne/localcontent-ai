# GeoSpark pricing schedule (source of truth)

This document is the single reference for pricing. All code and internal docs should match.

**Stripe products (3 paid tiers):**

| Tier     | Monthly | Annual (total) | Notes        |
|----------|---------|----------------|--------------|
| Starter  | $29/mo  | $290/year      | 30 content, 1 business |
| Pro      | $79/mo  | $790/year      | 100 content, 3 businesses. Most popular. |
| Premium  | $199/mo | $1990/year     | Unlimited content, 10 businesses, 3 users |

**Free tier:** $0 — 5 content pieces/month, 5 AI images/month, 2 platforms (no Stripe product).

**Where this is used in code:**
- `lib/stripe/stripe.ts` — PLANS (priceId, price in cents, features)
- `types/sales.ts` — PLAN_PRICING (monthly/annual for deals)
- `app/(marketing)/pricing/page.tsx` — marketing pricing page (4 tiers: Free, Starter, Pro, Premium)
- `app/page.tsx` — landing #pricing section
- `app/api/usage/route.ts` — plan limits (content, businesses)
- `app/api/content/generate/route.ts` — content/image limits per plan
- `lib/openai/images.ts` — IMAGE_LIMITS, CONTENT_LIMITS
- Sales: ai-coach (analyze, chat, briefing, assist), CallScriptPanel, deals dropdown

**Legacy:** Plan type `growth` exists for backward compatibility (old deals/DB); not in Stripe. Treat as Pro for limits and display.

*Last updated: Feb 2025*
