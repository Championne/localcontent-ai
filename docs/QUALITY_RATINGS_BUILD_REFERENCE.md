# Quality & Ratings System – Build Reference

This document describes the Picture Library, Text Library, and combined rating system for improving the content and image engines. **Vision API is explicitly out of scope** (no automatic image scoring). Storage cost is the only additional cost (see Cost section).

---

## 1. Goals

- **Record every image and every text generation** (including discarded/regenerated) for analysis.
- **Picture Library**: grid of all generated images; click → detail with inputs + full prompt + rating.
- **Text Library**: list of all generated text; click → detail with inputs + content + rating.
- **Unified rating**: 1–5 stars + optional “Why?” (feedback reasons) when rating is low; same UX for images and text.
- **Link to saved content**: when user saves to Spark Library, link `generated_images` and `generated_texts` rows via `content_id`.
- **Soft-force rating** without being annoying (see section 7).

---

## 2. Data Model

### 2.1 `generated_images`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK profiles |
| content_id | UUID | nullable, FK content (set when saved to Spark) |
| image_url | TEXT | Permanent URL (persisted to Supabase Storage) |
| topic | TEXT | |
| business_name | TEXT | |
| industry | TEXT | |
| style | TEXT | e.g. professional, promotional |
| content_type | TEXT | e.g. social-pack, blog-post |
| size | TEXT | e.g. 1024x1024 |
| full_prompt | TEXT | Exact prompt sent to DALL-E |
| revised_prompt | TEXT | From API if returned |
| prompt_version | TEXT | e.g. v1 (bump when changing prompt engine) |
| rating | SMALLINT | 1–5, nullable |
| rated_at | TIMESTAMPTZ | nullable |
| feedback_reasons | JSONB | e.g. ["Wrong style", "Text in image"], nullable |
| created_at | TIMESTAMPTZ | |

RLS: user can CRUD own rows.

### 2.2 `generated_texts`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK profiles |
| content_id | UUID | nullable, FK content |
| template | TEXT | e.g. social-pack, blog-post |
| topic | TEXT | |
| business_name | TEXT | |
| industry | TEXT | |
| tone | TEXT | |
| content_preview | TEXT | First ~500 chars or snippet |
| content_full | TEXT | Optional full content (or store in JSONB) |
| prompt_summary | TEXT | Or full_prompt if we capture it |
| prompt_version | TEXT | e.g. v1 |
| rating | SMALLINT | 1–5, nullable |
| rated_at | TIMESTAMPTZ | nullable |
| feedback_reasons | JSONB | nullable |
| created_at | TIMESTAMPTZ | |

RLS: user can CRUD own rows.

### 2.3 Content table

- No new columns required for rating (rating lives on `generated_images` and `generated_texts`).
- When saving content, client may send `generated_image_id` and `generated_text_id`; API updates those rows with `content_id` = new content id.

---

## 3. Flows

### 3.1 Image generation (record every time)

1. User requests image in `/api/content/generate`.
2. Call DALL-E; get `url`, `revisedPrompt`; we have `topic`, `businessName`, `industry`, `style`, `contentType`, and the built `fullPrompt` (from `buildImagePrompt` or returned by `generateImage`).
3. Persist image to Supabase Storage via `persistContentImage` (so URL is permanent).
4. Insert row into `generated_images` with all fields; `content_id` = null.
5. Return `generated_image_id` (and url, etc.) to client so they can rate in-flow and link on save.

### 3.2 Text generation (record every time)

1. User requests text (social pack or other template) in `/api/content/generate`.
2. Generate content; we have template, topic, businessName, industry, tone, and the generated string (or social pack JSON).
3. Insert row into `generated_texts` with template, topic, business_name, industry, tone, content_preview (e.g. first 500 chars of stringified result), optional content_full, prompt_summary (e.g. "topic + template + business"); `content_id` = null.
4. Return `generated_text_id` to client.

### 3.3 Save content to Spark Library

1. POST `/api/content` with title, content, template, metadata, and optional `generated_image_id`, `generated_text_id`.
2. Insert content row as today.
3. If `generated_image_id` provided: PATCH `generated_images` set `content_id` = new content id.
4. If `generated_text_id` provided: PATCH `generated_texts` set `content_id` = new content id.

### 3.4 Rating

- PATCH `/api/generated-images/[id]` body: `{ rating, feedback_reasons? }`.
- PATCH `/api/generated-texts/[id]` body: `{ rating, feedback_reasons? }`.
- Only the owner can rate (enforced by RLS and API).

---

## 4. APIs

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/generated-images | List user's images; query: sort=unrated_first, limit, offset |
| GET | /api/generated-images/[id] | Single image with all fields |
| PATCH | /api/generated-images/[id] | Update rating, rated_at, feedback_reasons |
| GET | /api/generated-texts | List user's texts; query: sort=unrated_first, limit, offset |
| GET | /api/generated-texts/[id] | Single text with all fields |
| PATCH | /api/generated-texts/[id] | Update rating, rated_at, feedback_reasons |
| GET | /api/quality/counts | Optional: { unratedImages, unratedTexts } for reminder banner |

---

## 5. UI

### 5.1 Picture Library (`/dashboard/pictures`)

- Grid of thumbnails (all `generated_images` for user).
- Default sort/filter: **Unrated first** (nullable rating).
- Optional filters: date range, style, content_type, rating (e.g. 1–2 = “Worst”).
- Click thumbnail → `/dashboard/pictures/[id]`: large image + “Generation inputs” (topic, business, industry, style, content_type, size, full_prompt, revised_prompt) + rating widget (1–5 + “Why?” when low) + optional “View in Spark Library” if `content_id` present.

### 5.2 Text Library (`/dashboard/text` or `/dashboard/text-library`)

- List or grid of items (snippet + template + date).
- Default: **Unrated first**.
- Click → `/dashboard/text/[id]`: full text + inputs (template, topic, business, industry, tone, prompt_summary) + rating widget.

### 5.3 Shared rating component

- Reusable: 1–5 stars, optional “What was wrong?” (multi-select or checkboxes) when rating ≤ 2.
- Feedback options (examples): Wrong style, Off-topic, Poor quality, Unwanted text (for images), Wrong tone (for text), Other.
- Always include “Skip” or “Later” so it’s not blocking.

### 5.4 Navigation

- Add **Picture Library** and **Text Library** (or **Copy Library**) to dashboard nav (e.g. after Spark Library).

---

## 6. Soft-Force Rating (without being annoying)

### 6.1 In-flow rating (primary)

- **Where:** On the **review step** (step 3) of Create Content, after content and image are visible.
- **What:** A compact “How was this?” block at the bottom: “Rate this copy” (stars) and “Rate this image” (stars) when applicable, with **Skip** / **Later**.
- **Why:** User is already looking at the result; one tap to rate. Non-blocking.

### 6.2 Unrated first

- Picture Library and Text Library default to **Unrated first** (or a prominent “Unrated” tab).
- Optional: small “Quick rate” or grey stars on list cards; click opens detail scrolled to rating or inline stars.

### 6.3 Gentle reminder (low frequency)

- When user opens Spark Library or Picture Library or Text Library and there are unrated items: show **once per session** (or once per day) a dismissible banner: “Rate a few to help us improve what we generate” with link to unrated view.
- After dismiss, do not show again until next session (e.g. sessionStorage flag).

### 6.4 Do not

- Block saving or navigation until user rates.
- Show a modal every time they open the app.
- Hide Skip / Later on in-flow rating.

---

## 7. Cost

- **No Vision API** (no automatic image scoring).
- **Extra cost = storage only:**
  - **Images:** Every generated image is persisted to Supabase Storage (~200–500 KB each). At ~300 KB/image, 1 GB ≈ 3k images. Supabase overage ~\$0.021/GB/month.
  - **Text:** Rows in `generated_texts` are small (KB per row); negligible at typical volume.
- **Optional later:** Retention policy (e.g. delete unrated images older than 6 months) to cap storage growth.

---

## 8. Prompt versioning

- When changing the image or text prompt logic in code, bump `prompt_version` (e.g. store `v1`, `v2`) in the generation flow so each `generated_images` and `generated_texts` row has a version. Enables “average rating by prompt_version” and A/B analysis later.

---

## 9. Out of scope (this build)

- Vision API or any automatic image scoring.
- A/B testing (challenger prompts); can be added later using the same tables.
- “Quality” dashboard page (e.g. worst-rated across both); can be added later using the same APIs.
