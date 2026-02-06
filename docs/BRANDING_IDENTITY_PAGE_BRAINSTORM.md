# Branding Identity page – brainstorm

## Goal

A dedicated **Branding Identity** page where users define *who they are* and *how they look* across the product. Move business creation and visual identity there; add brand colours, SEO keywords, and other fields that flow into content and image generation.

---

## What we have today

- **Settings:** Profile (name, email), **Businesses** (name, industry, location, logo, profile photo). Logo and profile photo are used in the overlay editor when creating content.
- **Create Content:** User picks a business → we use business name, industry, logo, photo. No brand colours or SEO keywords yet.

---

## Branding Identity page – what to include

### 1. Core (move from Settings)

- **Business creation & list** – Add / edit / delete businesses (same as today).
- **Per business:**
  - **Logo** – already exist; used in image overlay.
  - **Profile / brand photo** – already exist; used in overlay, “face” of the brand.
  - **Name, industry, location** – already exist; used in all content.

### 2. Brand colours

- **Primary colour** – main brand colour (hex).
- **Secondary colour** (optional).
- **Accent** (optional) – for CTAs, highlights.

**Use in workflow:**

- **Images:** Suggest or apply a tint/border in overlay; pass to AI image prompt (“use brand colours where appropriate”); watermark or accent bar colour.
- **Text / UI:** Email templates, PDF exports, Spark Library cards, or future “branded” PDFs with a header bar in primary colour.
- **Blog:** If we add a simple blog theme or export, use primary for headings/links.

### 3. SEO keywords

- **List of keywords** – e.g. “plumber near me”, “emergency plumber”, “drain cleaning [city]”. Comma-separated or tag-style.

**Use in workflow:**

- **Blog posts:** Feed into meta description, title, H2s; natural placement in body (avoid stuffing).
- **Social pack:** Hashtags derived from keywords; captions that include key phrases where natural.
- **GMB posts:** Work keywords into post text.
- **Email:** Subject lines or body when relevant.
- **Future:** Sitemap, schema (LocalBusiness) – we could auto-suggest or prefill from branding.

### 4. Tagline / value proposition

- **One short line** – e.g. “24/7 Emergency Plumbers You Can Trust”.

**Use in workflow:**

- Social posts (especially Twitter/LinkedIn), email sign-off, GMB short description, “About” snippets, text overlay suggestions.

### 5. Default tone / voice

- **Brand voice** – e.g. Professional, Friendly, Playful, Authoritative (same options as current “tone” in Create Content).

**Use in workflow:**

- Default tone in Create Content when this business is selected; optionally lock or suggest it so all content stays on-brand.

### 6. Call-to-action (CTA) defaults

- **Primary CTA** – e.g. “Book now”, “Contact us”, “Get a quote”.
- **Secondary** (optional) – e.g. “Learn more”, “See menu”.

**Use in workflow:**

- Social pack: “Follow us” + primary CTA in captions; button-style text in posts.
- Blog: CTA block at the end (“Contact us today”).
- GMB: CTA button text.
- Email: Main button and closing line.

### 7. Links & handles

- **Website URL** – for “Visit our website”, blog canonical, GMB.
- **Social handles** (optional) – @username per platform (Instagram, Facebook, etc.).

**Use in workflow:**

- Social pack: “Follow us @handle”; link in bio; website in email footer and blog.

### 8. Local SEO (optional but strong)

- **Service area(s)** – city, neighbourhoods, “Greater [X]”.
- **Sub-niches** – e.g. “Emergency plumbing”, “Residential”, “Commercial”.

**Use in workflow:**

- Blog titles and meta: “[Service] in [City]”; “near me” content.
- GMB and localised posts.
- AI prompt: “This business serves [area] and focuses on [sub-niches].”

### 9. Short “About” / brand story

- **Paragraph** – 2–4 sentences for About sections, GMB, blog author box.

**Use in workflow:**

- Prefill or suggest “About” in GMB; author box in blog; “Who we are” in email or landing layout.

### 10. Optional extras (later)

- **Font preference** – if we add text-on-image fonts or PDF themes.
- **Competitor / USP notes** – private notes for AI to emphasise differentiators (e.g. “We’re the only 24/7 option in [town]”).
- **Do-not-use words** – words to avoid in copy (e.g. “cheap”, “discount” for a premium brand).

---

## How the Branding Identity page enhances images and text

| Field              | Images                                                                 | Text                                                                 |
|--------------------|------------------------------------------------------------------------|----------------------------------------------------------------------|
| Logo / photo       | Overlay editor (already); watermark                                     | —                                                                   |
| Brand colours      | Overlay tint/border; AI style hint; accent bar                         | PDF/email theme; headings in export                                 |
| SEO keywords       | —                                                                      | Blog meta, H2s, body; social hashtags; GMB                          |
| Tagline            | Text overlay suggestion                                                 | Social, email, GMB, About                                           |
| Tone               | —                                                                      | Default in Create Content; consistent voice                         |
| CTA defaults       | —                                                                      | Every post type: button text, closing line                          |
| Website / handles  | —                                                                      | Links in social, email, blog                                        |
| Service area       | —                                                                      | “[Service] in [City]”, localised blog and GMB                       |
| About              | —                                                                      | GMB, author box, About sections                                     |

---

## Data model (minimal change)

- **Option A:** Add columns to `businesses`: e.g. `brand_primary_color`, `brand_secondary_color`, `seo_keywords` (TEXT or JSONB array), `tagline`, `default_tone`, `cta_primary`, `cta_secondary`, `website` (may exist), `social_handles` (JSONB), `service_areas` (TEXT or JSONB), `about_text`. Logo and profile photo already exist.
- **Option B:** New table `business_branding` (1:1 with business) so the main `businesses` table stays lean and we iterate on branding without touching core business fields.

Recommendation: **Option A** for now (add columns); migrate to a separate table later if the list grows.

---

## UX: where does “Branding Identity” live?

- **New nav item:** “Branding” or “Brand identity” between e.g. “Generations” and “Settings”. One page per business (tabs or dropdown) or a single “default business” with optional multi-business later.
- **Settings:** Remove business block from Settings (or leave a short “Manage businesses” link that goes to Branding Identity). Keep in Settings: profile (name, email), password, billing/subscription if present.

---

## Implementation order (suggestion)

1. **Phase 1:** Add route `/dashboard/branding` (or `/dashboard/settings/branding`). Move business list + logo + profile photo from Settings to Branding. Keep business API as is; optional: add `website` to business form if not already there.
2. **Phase 2:** Add brand colours (primary at least), tagline, CTA primary. Store on business (or branding table). Use in overlay (e.g. border/tint) and in content generation (tagline + CTA in prompts).
3. **Phase 3:** Add SEO keywords; wire into blog-post (and optionally social-pack) generation.
4. **Phase 4:** Default tone, website, social handles, service areas, about – and wire each into the right templates.

---

## Open questions

- One business per user vs multiple? (Current product supports multiple; Branding can show one “primary” or a list with “Edit branding” per business.)
- Brand colours: colour picker only, or also “extract from logo” (we could suggest a dominant colour from the logo image)?
- SEO keywords: free text only, or integrate with a keyword tool later (e.g. suggest “people also search for”)?

If you want to proceed, we can start with Phase 1 (new page + move businesses) and add one or two branding fields (e.g. primary colour + tagline) so the workflow impact is clear early.
