# Cost analysis: Branding page & dashboard API queries

This document summarizes what each API used on the **Branding** page does and what it costs, plus a **dashboard-wide** overview of which APIs touch paid services.

---

## Quick summary: where costs come from

| Service | Used by | Cost type |
|--------|---------|-----------|
| **Supabase** (auth, DB, storage) | Branding, content, generations, sales, etc. | Usage (DB size, egress, storage) after free tier |
| **OpenAI** (GPT + DALL·E) | Content generate, generate-image, demo, examples, admin blog-images | Per token (text) / per image (DALL·E 3) |
| **Groq** (optional) | Sales AI Coach (chat, briefing, summary, analyze) | Free tier / usage |
| **Unsplash** | Stock images on content page | Free API (rate limits) |
| **Stripe** | Checkout, portal, webhooks | Per transaction + subscription % |
| **Twilio** | Sales dialer (calls, token, webhooks) | Per minute / per phone number |
| **SendGrid / Resend** | Sales email, inbound webhook | Per email (free tier available) |
| **Vercel Blob** | Admin blog-images (store generated images) | Storage + egress |

**Branding page only:** All branding-page APIs use **Supabase only**. No OpenAI, Stripe, or other paid third-party APIs. Cost = Supabase usage if you exceed free tier.

---

## APIs used on the Branding page

| API | When it’s called | Backend service | Per-request cost |
|-----|------------------|-----------------|------------------|
| **GET /api/business** | Page load (fetch businesses) | Supabase Auth + DB | **$0** (included in plan) |
| **POST /api/business** | Add new business | Supabase Auth + DB | **$0** |
| **PATCH /api/business** | Save edits (name, colors, tagline, etc.) | Supabase Auth + DB | **$0** |
| **DELETE /api/business/[id]** | Delete a business | Supabase Auth + DB | **$0** |
| **POST /api/business/logo** | Upload logo or profile photo | Supabase Auth + DB + **Storage** | **$0** per request* |
| **DELETE /api/business/logo** | Remove logo or profile photo | Supabase Auth + DB + **Storage** | **$0** per request* |

\* Supabase does **not** charge per API request. Costs are from **usage** (storage, egress, DB size) when you exceed the free tier.

---

## What each API uses (and what can incur cost)

### 1. GET /api/business  
- **Supabase Auth:** `getUser()` (session check).  
- **Supabase DB:** One `select` from `businesses` for the current user.  
- **Cost:** No per-call fee. Counts as normal DB usage and egress (response size).

### 2. POST /api/business  
- **Supabase Auth:** `getUser()`.  
- **Supabase DB:** One `insert` into `businesses`.  
- **Cost:** No per-call fee. Slightly increases DB size.

### 3. PATCH /api/business  
- **Supabase Auth:** `getUser()`.  
- **Supabase DB:** One `update` on `businesses`.  
- **Cost:** No per-call fee. Minimal DB usage.

### 4. DELETE /api/business/[id]  
- **Supabase Auth:** `getUser()`.  
- **Supabase DB:** One `delete` on `businesses`.  
- **Cost:** No per-call fee. Reduces DB size.

### 5. POST /api/business/logo  
- **Supabase Auth:** `getUser()`.  
- **Supabase DB:** `select` business, then `update` with new URL; may `remove` old file from storage.  
- **Supabase Storage:** `upload` to bucket `logos` (and optional `remove` of previous file).  
- **Cost:** No per-call fee. **Storage** usage increases by file size (up to 2MB per image). When those images are later loaded (e.g. in dashboard or content), that traffic is **egress**.

### 6. DELETE /api/business/logo  
- **Supabase Auth:** `getUser()`.  
- **Supabase DB:** `select` business, `update` to clear URL, `remove` from storage.  
- **Supabase Storage:** `remove` object.  
- **Cost:** No per-call fee. **Storage** usage decreases.

---

## Branding-related API on the Content page

| API | When it’s called | Backend service | Per-request cost |
|-----|------------------|-----------------|------------------|
| **POST /api/image/branding-recommendation** | “Apply suggested branding” / auto-apply when selecting an image | **None** (in-app logic only) | **$0** |

This endpoint uses **no external paid APIs** (no OpenAI, no image API). It returns a deterministic recommendation (frame style, overlay positions, tint, text) based on template and business fields. The only “cost” is server compute time (and an intentional 400ms delay).

---

## Where real cost can come from (Supabase)

Supabase pricing is **usage-based**, not per-request:

| Resource | Free tier | Overage (Pro, indicative) |
|----------|-----------|----------------------------|
| **API requests** | Unlimited | N/A (no per-request charge) |
| **Database size** | 500 MB | $0.125/GB |
| **Egress** | 5 GB | $0.09/GB (standard) |
| **File storage** | 1 GB | $0.021/GB/month |

So for the **branding page**:

- **Database:** Each business row and each PATCH/GET adds a tiny amount of size/egress. Typical usage stays well within 500 MB.
- **Storage:** Logo and profile photo uploads (max 2MB each) go into the **logos** bucket. Many logos (e.g. 500 × 2MB) could approach 1 GB and then hit overage.
- **Egress:** Every time a logo or profile image is **served** (dashboard, content page, exports), that counts as egress. 5 GB free can be used quickly if many images are viewed often.

---

## Summary

- **No per-request API cost** for any of the branding page or branding-recommendation calls.
- **No OpenAI or other third-party paid APIs** are used on the branding page or in branding-recommendation.
- **Only Supabase** is used; cost is from **usage** (DB size, storage, egress) if you exceed the free tier.
- **Rough order of impact:** logo/profile **storage** and **egress** (when images are loaded) are the main things to watch; DB and auth usage from the branding page are negligible in comparison.

---

## Other dashboard APIs that can incur cost

APIs used on **Content**, **Sales**, **Generations**, etc., and whether they call paid services:

| API | Page / flow | External paid service | Notes |
|-----|-------------|------------------------|-------|
| **POST /api/content/generate** | Content creation | **OpenAI** (GPT + optional DALL·E) | Text: ~$0.01–0.03 per piece; image: DALL·E 3 ~$0.04–0.08 per image (size-dependent) |
| **POST /api/content/generate-image** | Content → “Generate with AI” | **OpenAI** (DALL·E 3) | Same as above; counts against plan image quota |
| **POST /api/image/composite** | Content → apply logo/frame | None (Sharp) | Server fetches image URLs → egress from Supabase/Unsplash/OpenAI CDN only |
| **POST /api/image/upload-overlay** | Content → upload custom image | **Supabase Storage** | Storage + egress (usage-based) |
| **GET /api/stock-images** | Content → stock options | **Unsplash** | Free API; rate limits only |
| **POST /api/image/branding-recommendation** | Content → suggested branding | None | Deterministic logic; **$0** |
| **GET /api/generated-images**, **/api/generated-texts** | Generations, Pictures, Text library | **Supabase** (DB + any stored image URLs) | Egress when images are served |
| **POST /api/sales/ai-coach/briefing** | Sales dialer | **Groq** (preferred) or **OpenAI** | Chat completion; Groq has free tier |
| **POST /api/sales/ai-coach/chat** | Sales AI Coach | **Groq** or **OpenAI** | Same |
| **POST /api/sales/ai-coach/assist** | Sales AI Coach | **OpenAI** | Chat completion |
| **POST /api/sales/ai-coach/summary**, **/analyze** | Sales AI Coach | **Groq** or **OpenAI** | Same |
| **POST /api/stripe/checkout** | Settings / upgrade | **Stripe** | Per transaction + subscription |
| **POST /api/sales/calls/token** | Sales dialer | **Twilio** | Token generation; calls = per-minute |
| **POST /api/sales/calls** (create call) | Sales dialer | **Twilio** | Per-minute call cost |
| **POST /api/sales/email** | Sales email | **SendGrid** or **Resend** | Per email (free tiers available) |
| **POST /api/admin/blog-images/generate** | Admin blog images | **OpenAI** (DALL·E) + **Vercel Blob** | Image cost + storage |
| **GET /api/examples/generate** | Demo / examples | **OpenAI** (if configured) | Same as content generate |

So: **branding page = Supabase only**. **Content page** adds OpenAI (text + optional image), Unsplash (free), and Supabase. **Sales** adds Groq/OpenAI, Twilio, SendGrid/Resend, Stripe.
