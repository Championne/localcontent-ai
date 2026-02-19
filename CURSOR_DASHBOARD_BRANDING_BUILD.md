# CURSOR PROMPT — Dashboard & Brand Identity Redesign

## Context

Two new redesigned files have been prepared and are ready in the project:

- `app/dashboard/dashboard_page_new.tsx` — Replaces `app/dashboard/page.tsx`
- `app/dashboard/branding/branding_page_new.tsx` — Replaces `app/dashboard/branding/page.tsx`

The full strategy and rationale is documented in `docs/DASHBOARD_BRANDING_REDESIGN_STRATEGY.md`.

---

## Your Task

### Step 1: Deploy the new files

Replace the existing pages with the new designs:

```bash
cp app/dashboard/dashboard_page_new.tsx app/dashboard/page.tsx
cp app/dashboard/branding/branding_page_new.tsx app/dashboard/branding/page.tsx
```

Then run the dev server and verify both pages compile without TypeScript errors:

```bash
npm run dev
```

Fix any TypeScript or import errors you encounter. The pages use existing utilities and components — no new dependencies.

---

### Step 2: Verify the dashboard renders correctly

Open `/dashboard` and check:

- [ ] The greeting changes based on time of day (morning/afternoon/evening)
- [ ] "Today's Spark" card shows a contextual suggestion (varies by day of week)
- [ ] If content count is 0, the spark suggests brand setup; if > 0, it suggests content
- [ ] Stats row: Sparks count, Images count, Momentum % bar, SparkFox card
- [ ] "Sparks created" shows the agency value calculation (count × $25)
- [ ] 4 distinct Quick Launch cards render correctly
- [ ] Recent Sparks list shows thumbnails or emoji fallbacks
- [ ] Dates show as "Today", "Yesterday", "3 days ago" etc.
- [ ] Brand nudge card appears at bottom ONLY when content count is 0
- [ ] "Create a Spark" button in top right is hidden on mobile (sm:inline-flex)

---

### Step 3: Verify the brand identity page renders correctly

Open `/dashboard/branding` and check:

- [ ] Page header shows "Your brand, one place"
- [ ] Business cards show: logo/avatar, name, industry/location, completeness ring (SVG), edit/delete buttons
- [ ] Completeness ring shows correct % based on 9 essential fields only (name, industry, location, logo, primary_color, tagline, cta_primary, tone, seo_keywords)
- [ ] Clicking edit opens the 3-tab editor inline on the card
- [ ] Tab 1 (Basics): name, industry dropdown with emojis, location, website
- [ ] Tab 2 (Look): logo upload with remove button, colour picker + hex input, live preview card, brand personality chip (if colour set), Advanced colours accordion collapsed by default
- [ ] Tab 3 (Voice): tagline, CTA field, tone toggle buttons (Professional / Friendly), SEO keywords, short about textarea
- [ ] "Save & continue →" advances to next step and saves; on step 3 it says "Save & done ✓" and closes editor
- [ ] Back button appears on steps 2 and 3
- [ ] Logo upload works (calls `/api/business/logo`)
- [ ] Business updated event fires: `window.dispatchEvent(new CustomEvent('geospark:business-updated', ...))`
- [ ] "Add business" form works and auto-opens the editor on the new business

---

### Step 4: Mobile check

Test on a narrow viewport (375px):

- [ ] Dashboard: greeting + value line stacks cleanly
- [ ] Stats grid: 2 columns on mobile, 4 on sm+
- [ ] Quick launch grid: 2 columns on mobile, 4 on sm+
- [ ] Today's Spark card: emoji background doesn't overflow
- [ ] Branding page: business card header wraps correctly
- [ ] Step tabs are equal width and don't overflow

---

### Step 5: Clean up

Once everything is verified:

```bash
rm app/dashboard/dashboard_page_new.tsx
rm app/dashboard/branding/branding_page_new.tsx
```

---

## Known things to watch for

1. **`detectBrandPersonality` import** — used in `StepLook`. It's imported from `@/lib/branding/personality-detection`. This file already exists. If it throws, wrap the call in try/catch (already done in the new code).

2. **`isValidHex` helper** — defined locally in the branding page. Do not confuse with any existing utility.

3. **`getCompleteness` uses 9 fields** — NOT the old 13-field count. The ring percentage will look different from the old progress bar. This is intentional.

4. **The dashboard `page.tsx` is a server component** (no `'use client'`). All data fetching happens server-side via Supabase. Do not convert it to a client component.

5. **The branding `page.tsx` is a client component** (`'use client'` at top). This is correct — it needs state for the multi-step editor.

6. **CSS variables** — Both pages use `var(--brand-primary)`, `var(--brand-primary-10)`, `var(--brand-primary-20)`. These are set by `DashboardLayoutClient.tsx` on the root div and are available throughout the dashboard. Do not hardcode colours.

---

## Do NOT change

- `DashboardLayoutClient.tsx` — sidebar and layout work correctly
- Any API routes
- Any database schema
- Any other dashboard pages

---

## Done

When the above checklist passes, commit with:

```
git add app/dashboard/page.tsx app/dashboard/branding/page.tsx
git commit -m "feat: redesign dashboard and brand identity pages for Apple-grade UX"
git push
```
