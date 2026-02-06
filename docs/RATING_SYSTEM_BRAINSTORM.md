# Rating system brainstorm (stock-first workflow)

## Current system

- **Where:** Create Content step 3 (in-flow), Picture Library, Text Library.
- **What we collect:**
  - **Images:** 1–5 stars; if ≤2 stars, optional checkboxes: Wrong style, Unwanted text, Off-topic, Blurry, Other.
  - **Text:** 1–5 stars; if ≤2 stars, optional: Wrong tone, Off-topic, Poor quality, Too short/long, Other.
- **Stored in:** `generated_images.rating` / `generated_texts.rating` (+ `feedback_reasons`).
- **Reminder:** Picture Library and Text Library show “Rate a few to help us improve…” with unrated counts.

## How stock-first changes things

1. **Many “images” are no longer AI-generated**  
   We now insert rows into `generated_images` for stock and composite images too. Rating “Wrong style / Off-topic” on a stock photo doesn’t train an image model—we didn’t generate it. So either we:
   - Only ask for ratings on **AI-generated** images, or
   - Repurpose image rating to **“fit for this content?”** (useful for improving stock search/picker), or
   - Simplify image feedback to a single thumbs up/down and drop reasons.

2. **Text is still 100% AI**  
   Copy rating is still “rate our AI output” and can stay as is, or be simplified in the same way as images for consistency.

3. **Friction vs. signal**  
   Two separate 1–5 + reason UIs (copy + image) can feel heavy after every spark. Simplifying can increase completion and still give useful signal.

---

## Options

### A. Only rate AI-generated images

- **Idea:** In Create Content and Picture Library, show “Rate this image” only when the image has an AI source (e.g. row has `full_prompt` or we add `source: 'ai'`). Stock/composite: no image rating, or optional single “Did this image work for you? 👍 / 👎” (no stars/reasons).
- **Pros:** Clear meaning: “we’re improving our image model.” No confusing “rate this stock photo” with AI-style reasons.
- **Cons:** Fewer image ratings overall; need a clean way to know “this row is from AI” in the UI and in quality counts.

### B. One “content pack” rating instead of separate copy + image

- **Idea:** After step 3, one question: “How was this spark?” 1–5 (or 👍 / 👎). Optional short reason only on low rating (e.g. “Copy”, “Image”, “Both”, “Other”). Store against the content or the latest generated_text/generated_image.
- **Pros:** One tap, less friction, still “good vs bad” signal. Fits “I’m rating the overall result.”
- **Cons:** We lose separate copy vs image signal. Harder to improve text and image models independently.

### C. Thumbs only (👍 / 👎), reasons only on 👎

- **Idea:** Replace 1–5 stars with two buttons: “Good” (e.g. 4) and “Not great” (e.g. 2). Only if “Not great” do we show the existing reason checkboxes (for text: tone, off-topic, etc.; for image: style, off-topic, etc., or a shorter list for stock “fit”).
- **Pros:** Faster, clearer. “Was this useful?” is easy to answer. Reasons still available for debugging/improvement.
- **Cons:** Less granular than 1–5 (usually we only care “good vs bad” anyway).

### D. Rate only in libraries, not in-flow

- **Idea:** Remove rating from Create Content step 3. Keep rating only on Picture Library and Text Library when the user opens an item (and optionally “Show unrated”).
- **Pros:** Zero friction during creation. Users who care can rate later in bulk.
- **Cons:** Fewer ratings (many users never open library detail). Reminder banners become the main driver.

### E. Image rating = “fit for this content” for all images

- **Idea:** For every image (AI or stock), ask: “Did this image work for your post?” 1–5 or 👍/👎. Optional reasons: “Didn’t match topic”, “Wrong style”, “Other.” Use this to improve stock search/picker (and later AI prompts), not to train an image model directly.
- **Pros:** One consistent question. Stock feedback improves search/keywords; AI feedback can still be used if we tag source.
- **Cons:** Need to store `source` (ai vs stock) and interpret analytics by source. Slightly different meaning than “rate our image model.”

---

## Recommendation (to discuss)

- **Text:** Keep rating (it’s pure AI). Optionally simplify to **thumbs (👍/👎) + reasons on 👎** (Option C) to reduce friction and align with image.
- **Image:**
  - **AI-generated only** in step 3 and in Picture Library: show full rating (stars or thumbs + reasons).  
  - **Stock/composite:** Either no rating, or a single “Did this image work for you? 👍 / 👎” stored separately (e.g. `fit_rating` or a simple flag) so we don’t mix “model quality” with “search result fit.”
- **Reminder:** Base “unrated” counts only on items that are **rateable** (e.g. unrated AI images + unrated texts). Don’t push users to rate stock images with the same “help us improve the engine” message.
- **Implementation:** Add `source` to `generated_images` (or derive from `full_prompt` presence). In UI, only show “Rate this image” (and include in unrated count) when `source === 'ai'`. Optionally add a lightweight “Image work for you? 👍/👎” for stock rows without stars/reasons.

---

## Next steps

1. Decide: separate copy vs image rating, or one “spark” rating?
2. Decide: stars vs thumbs for copy (and for image when we keep it).
3. Decide: rate stock images at all? If yes, separate question and storage.
4. Add `source` (or equivalent) to `generated_images` and wire UI/counts to “rateable” only where it makes sense.
5. Optionally simplify `RatingStars` to a `ThumbsRating` component and reuse for both copy and image.
