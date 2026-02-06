# Merge Picture Library & Text Library – brainstorm

## Current state

We have **three** library-style surfaces:

| Surface | Route | Data | Purpose |
|--------|--------|------|--------|
| **Spark Library** | `/dashboard/library` | `content` table (saved drafts/published) | Browse, edit, delete **saved** sparks; thumbnails from metadata |
| **Picture Library** | `/dashboard/pictures` | `generated_images` (AI + stock) | Browse every generated image; rate (thumbs); link to content |
| **Text Library** | `/dashboard/text-library` | `generated_texts` | Browse every generated copy; rate (thumbs); link to content |

Picture and Text libraries exist so users can **rate** outputs (to improve the engine) and **browse** past generations. They’re separate lists with separate nav items.

---

## Why merge?

1. **Simpler nav** – One item instead of two (“Picture Library” + “Text Library” → one “Generations” or “Feedback”).
2. **One place for “rate & browse”** – Same mental model: “stuff I generated that I can rate or revisit.”
3. **Aligned with simplified rating** – We already use one thumbs pattern for both; one reminder count. One screen can show both types with the same interaction.
4. **Less duplication** – Same reminder banner, same “Create New” CTA, same unrated-count logic in one page.

---

## Options

### A. One page, one list, filter: All | Images | Copy

- **Single route** e.g. `/dashboard/generations` (or keep `/dashboard/pictures` and redirect text-library there).
- **One list**: items are either “image” or “text”. Default view = “All” (images and texts interleaved by `created_at`). Filter tabs: **All | Images | Copy**.
- **Card types**: In “All”, each row is either an image card (thumbnail + topic + rating) or a text card (template + topic + preview + rating). Same as today, but in one feed.
- **Detail**: Click image → existing picture detail. Click text → existing text-library detail. Routes can stay `/dashboard/generations/image/[id]` and `/dashboard/generations/text/[id]` or we keep `/dashboard/pictures/[id]` and `/dashboard/text-library/[id]` and only merge the list.
- **Pros**: Single entry point, one reminder, clear filter. **Cons**: Two card layouts in one list (need a small type indicator or layout that works for both).

### B. One page, two sections (Images section + Copy section)

- Same single route, but the page is split: e.g. “Recent images” (grid) and “Recent copy” (list) on the same page, or collapsible sections.
- **Pros**: Clear separation, no mixed card design. **Cons**: Longer page; “one library” is more like “two blocks on one page.”

### C. Merge into Spark Library as a “Rate & improve” block

- Keep Spark Library as the main “library” page. Add a section at the top or bottom: “Unrated generations” (images + texts that have no rating yet), with thumbnails / previews and thumbs. Once rated, they could disappear from that block or move to “Recently rated.”
- **Pros**: One place for “my content” and “rate these.” **Cons**: Spark Library gets heavier; mixing “saved content” with “generations to rate” might blur the two concepts (saved vs. not saved).

### D. One feed, unified “spark” cards (image + copy together)

- Each item in the list is a **generation event**: one card showing image (if any) + copy preview, with “Rate copy” and “Rate image” on the same card. This would require grouping by `content_id` or by a not-yet-existing “generation_run_id.”
- **Pros**: Matches “a spark = image + copy.” **Cons**: We don’t have a single “generation” entity; images and texts are stored separately and only linked via `content_id` when saved. Orphan generations (never saved) wouldn’t have a natural pair. So we’d need to either only show “saved sparks” with rating (then it’s really Spark Library + rating) or keep separate image/text rows and “pair” heuristically by date/user (fragile).

---

## Naming

If we merge Picture + Text into one:

- **“Generations”** – Neutral; “your generated images and copy.”
- **“Feedback”** – Emphasizes rating; “rate what we generated.”
- **“Recent generations”** – Same, with a time angle.
- **“Library”** is already used for Spark Library, so “Library” alone would be ambiguous unless we rename Spark Library (e.g. “My Sparks” or “Content”) and use “Library” for the merged generations list.

Suggested: keep **Spark Library** for saved content; call the merged page **“Generations”** or **“Feedback”** so nav is: Spark Library | Generations | … (and drop Picture Library + Text Library).

---

## Implementation sketch (Option A)

- **New route**: `/dashboard/generations` (or replace `/dashboard/pictures` and redirect `/dashboard/text-library` → `/dashboard/generations`).
- **Data**: Fetch `/api/generated-images` and `/api/generated-texts` (or one combined endpoint that returns `{ items: Array<{ type: 'image', ... } | { type: 'text', ... }> }` sorted by `created_at`).
- **UI**: Tabs [All | Images | Copy]. “All” = interleaved list with a type badge or icon; list item links to `/dashboard/generations/image/[id]` or `/dashboard/generations/text/[id]` (or keep current detail URLs with redirects).
- **Detail**: Keep existing Picture and Text Library detail pages; either move under `/dashboard/generations/image/[id]` and `/dashboard/generations/text/[id]` or leave paths and link from the unified list.
- **Nav**: One item “Generations” (or “Feedback”); remove Picture Library and Text Library.
- **Reminder**: Same as now; one banner on the merged page; count = unratedImages + unratedTexts.

---

## Recommendation

- **Option A** (one page, one list, filter All | Images | Copy) gives a single place for “rate & browse” without changing data model or mixing saved content with generations. Naming: **“Generations”** in the nav, page title “Generations” or “Your generations.”
- Keep **Spark Library** as is (saved content only).
- Detail pages can stay at current paths and be linked from the unified list; or we move them under `/dashboard/generations/…` for a cleaner URL tree.

If you want to go ahead, next step is to implement Option A: one `/dashboard/generations` page, combined fetch (or two fetches + merge sort), tabs, and nav update.
