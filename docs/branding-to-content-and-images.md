# How Branding Page Inputs Flow Into Content & Images

Overview of how each field from **Brand Identity** (branding page) is used in:
1. **Text creation** (AI prompt for blog, social, GMB, etc.)
2. **Image selection** (stock photo search)
3. **Image creation** (AI image generation, e.g. DALL·E)
4. **Step 3: Overlays** (logo, photo, tagline, website, social, colours, frame)

---

## 1. Text creation (query to AI)

All of these are sent from the content page to `POST /api/content/generate` and passed into `lib/openai` prompts (`buildPrompt` / `buildSocialPackPrompt`).

| Branding field        | In generate request | In prompt / usage |
|-----------------------|---------------------|-------------------|
| **Name**              | ✅ `businessName`    | "Business Name: …" |
| **Industry**          | ✅ `industry`       | "Industry: …" |
| **Location**          | ✅ `location`       | "Location: … — mention naturally" |
| **Tagline**           | ✅ `tagline`        | "Tagline (use in sign-off or when appropriate)" |
| **SEO keywords**      | ✅ `seoKeywords`    | "SEO keywords (weave naturally into headings/body)" |
| **Primary CTA**       | ✅ `defaultCtaPrimary`  | "Preferred call-to-action: …" |
| **Secondary CTA**     | ✅ `defaultCtaSecondary` | Same as above |
| **Short about**       | ✅ `shortAbout`     | "About the business (use for voice and key points)" |
| **Website**           | ✅ `website`        | "Website (use for 'Visit our site' / 'Learn more')" |
| **Social handles**    | ✅ `socialHandles`  | "Social handles (use in sign-off or 'Follow us')" |
| **Service areas**     | ✅ `serviceAreas`   | "Service areas (cities/neighbourhoods served — mention when relevant)" |
| **Default tone**      | ✅ `tone`           | "Desired Tone: …" (from business or form) |

**Source:** Content page sends `currentBusiness?.…` (and topic/template) in the generate request body. The API forwards these into `generateContent()` / `generateSocialPack()` in `lib/openai/index.ts`.

---

## 2. Image selection (stock photo query)

Used when the user chooses **Free stock image** and the app fetches options from Unsplash.

| Branding field | Used? | Where / how |
|----------------|--------|-------------|
| **Topic**      | ✅     | From the content form (user input), not from branding. |
| **Industry**   | ✅     | From selected business → sent as `industry` in generate request. |
| **Template**   | ✅     | Determines orientation (e.g. blog = landscape, social = squarish). |

**Flow:**  
`app/api/content/generate/route.ts` calls `getStockImageOptions({ topic, industry, contentType: template }, 5)`.  
`lib/stock-images/index.ts` → `getSearchQueryForTopic(topic, industry)` in `lib/stock-images/keywords.ts` builds the search query (e.g. first few words of topic + industry). No other branding fields (location, tagline, colours, etc.) are used in the stock image query.

---

## 3. Image creation (AI image, e.g. DALL·E)

Used when the user chooses **AI-generated image**.

| Branding field | Used? | Where / how |
|----------------|--------|-------------|
| **Topic**      | ✅     | From content form → used in image prompt. |
| **Business name** | ✅  | Passed as `businessName` (in params but only industry/topic drive the scene text). |
| **Industry**   | ✅     | "… for a {industry} context" in scene description. |
| **Style**      | ✅     | From `imageStyle` (or `detectBestStyle(topic)`): promotional, professional, friendly, seasonal. |

**Flow:**  
`app/api/content/generate/route.ts` calls `generateImage({ topic, businessName, industry, style: finalImageStyle, contentType: template })`.  
`lib/openai/images.ts` → `buildImagePrompt()` builds a **no-text** scene: theme from topic, industry context, style prefix, format. **No** tagline, location, colours, website, or other branding in the image prompt (by design: DALL·E scene is theme-only; branding is added in Step 3).

---

## 4. Step 3: Overlays (after image is chosen/generated)

The **Image Overlay** step uses branding for layout and colours. Data comes from `currentBusiness` and `getBrandColors()` on the content page; the overlay editor receives them as props and sends back an `OverlayApplyPayload` to `handleApplyOverlays`, which calls `/api/image/composite` and (for text) client-side canvas + `/api/image/upload-overlay`.

| Branding field           | Used in overlay step? | How |
|--------------------------|------------------------|-----|
| **Logo**                 | ✅                     | `logoUrl` → drag onto image; composite API places it; optional ring in brand colour. |
| **Profile photo**        | ✅                     | `photoUrl` → same as logo, composited as circular with optional ring. |
| **Primary colour**       | ✅                     | Ring around logo/photo (default), tint overlay, text colour, frame colour. |
| **Secondary colour**     | ✅                     | Optional tint, text, or frame when user picks "secondary". |
| **Accent colour**        | ✅                     | Optional tint, text, or frame when user picks "accent". |
| **Tagline**              | ✅                     | Draggable text overlay; colour = primary/secondary/accent. |
| **Website**              | ✅                     | Draggable text overlay; same colour options. |
| **Social handles**       | ✅                     | Draggable text overlay; same colour options. |

**Flow:**

- **Content page**  
  - `getBrandColors()`: builds `{ primary, secondary, accent }` from `currentBusiness.brand_primary_color` (and secondary/accent), with fallbacks.  
  - Passes to `ImageOverlayEditor`: `brandColors={getBrandColors()}`, `tagline`, `website`, `socialHandles`, `logoUrl`, `photoUrl` from `currentBusiness`.

- **ImageOverlayEditor**  
  - User places logo/photo, optional border colour per overlay (default primary), optional tint (colour + opacity), optional text overlays (tagline, website, social) with colour key, optional frame (style + colour key).  
  - On Apply → `onApply(payload)` with `imageOverlays`, `overlayBorderColors`, `tintOverlay`, `textOverlays`, `frame`.

- **handleApplyOverlays** (content page)  
  - For each image overlay: `POST /api/image/composite` with `imageUrl`, `logoUrl`, `position`, `isCircular`, `overlayBorderColor` (from payload or `currentBusiness.brand_primary_color`).  
  - If tint: composite with `tintOverlay: { color: hex, opacity }` (hex from `getBrandColors()` by key).  
  - Text overlays: drawn on canvas with brand colours, then uploaded via `/api/image/upload-overlay`.  
  - If frame: composite with `frame: { style, color: hex }` (hex from brand colours by key).

- **Composite API** (`/api/image/composite`)  
  - Accepts: `imageUrl`, `logoUrl`, `position`, `isCircular`, `overlayBorderColor`, `brandPrimaryColor` (fallback for ring), `tintOverlay: { color, opacity }`, `frame: { style, color }`.  
  - Draws logo/photo, optional ring, optional full-image tint, optional frame (thin/solid/thick/double/rounded) in the given colour.

**Not used in overlay step:** name, industry, location, SEO keywords, CTAs, short about, default tone, service areas (those are text-only).

---

## Summary table

| Branding field     | Text creation | Stock image query | AI image creation | Step 3 overlay |
|--------------------|---------------|-------------------|------------------|----------------|
| Name               | ✅            | —                 | ✅ (param only)  | —              |
| Industry           | ✅            | ✅                | ✅               | —              |
| Location           | ✅            | —                 | —                | —              |
| Website            | ✅            | —                 | —                | ✅ (text)      |
| Logo               | —            | —                 | —                | ✅             |
| Profile photo      | —            | —                 | —                | ✅             |
| Primary colour     | —            | —                 | —                | ✅             |
| Secondary colour   | —            | —                 | —                | ✅             |
| Accent colour      | —            | —                 | —                | ✅             |
| Tagline            | ✅            | —                 | —                | ✅ (text)      |
| Primary CTA        | ✅            | —                 | —                | —              |
| Secondary CTA      | ✅            | —                 | —                | —              |
| SEO keywords       | ✅            | —                 | —                | —              |
| Default tone       | ✅            | —                 | —                | —              |
| Social handles     | ✅            | —                 | —                | ✅ (text)      |
| Service areas      | ✅            | —                 | —                | —              |
| Short about        | ✅            | —                 | —                | —              |

So: **text** uses almost all branding fields; **image selection** uses topic + industry + template; **image creation** uses topic + industry + style (no other branding); **overlays** use logo, profile photo, all three colours, tagline, website, and social handles.
