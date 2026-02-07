# Testing guide after Vercel deploy

Run these tests on your live Vercel URL (e.g. `https://your-app.vercel.app`) after pushing.

---

## 1. Branding page

**URL:** `/dashboard/branding`

| # | Test | What to do | Expected |
|---|------|------------|----------|
| 1.1 | Hero & layout | Open Branding | See "Your brand, one place" hero; business cards below. |
| 1.2 | Progress & % | Edit a business; fill 0 → some → all fields | "X of 13 set (Y%)" updates; at 100% see "Profile complete" and progress bar has teal glow. |
| 1.3 | 50% milestone | Fill exactly half the fields (e.g. 6–7) | "Halfway there — keep going!" appears. |
| 1.4 | Edit form sections | Click Edit on a business | Four sections: Identity, Visuals, Voice, Online presence (with numbers 1–4). |
| 1.5 | Inline help | In edit form, check under Tagline, CTA, Tone | Short helper lines under each. |
| 1.6 | Your palette & copy hex | Set primary colour; open card (not edit) | "Your palette" strip with 3 swatches; click a swatch → "Copied!" and helper says "Copied to clipboard". Paste elsewhere to confirm hex. |
| 1.7 | Save & done | Change something, click "Save & done" | Saves; success message; form can be closed. |
| 1.8 | Empty state | Business with no logo and no profile photo | Message: "Add a logo and profile photo so your content feels personal." |

---

## 2. Create content – Step 1 (Template)

**URL:** `/dashboard/content` (start from step 1)

| # | Test | What to do | Expected |
|---|------|------------|----------|
| 2.1 | Welcoming copy | Land on step 1 | Headline: "What do you want to create today?" and subline about picking a content type. |
| 2.2 | Benefit per template | Look at each template card | Each has a benefit line (e.g. "Drive traffic and show expertise", "One idea, six ready-to-publish posts"). |
| 2.3 | Selection → Step 2 | Click any template | Go to step 2; see "You're creating a [Template name]" and "Tell us what it's about." |

---

## 3. Create content – Step 2 (Details)

| # | Test | What to do | Expected |
|---|------|------------|----------|
| 3.1 | Headline | On step 2 | "Tell us what it's about" and above it "You're creating a …". |
| 3.2 | Next-step hint | Scroll to bottom of form | Line like "Next: choose your image (stock, AI, or upload), then add your branding." |
| 3.3 | Generate | Fill topic + business; click Generate | Progress/loading; then step 3 with content and image options. |

---

## 4. Create content – Step 3 (Branding) – Blog / GMB / Email

Use a **non–social-pack** template (e.g. Google Business Post or Blog).

| # | Test | What to do | Expected |
|---|------|------------|----------|
| 4.1 | Image hero line | On step 3 | Image block title: "Pick the look that fits your message." |
| 4.2 | Pick image | Choose Stock, AI, or Upload | Image selected; optional "Applying branding…" then overlay/editor or "Add Text" / "Customize". |
| 4.3 | "Your brand is on it" | After auto-branding is applied (or after you apply branding) | Text "Your brand is on it" on the generated image card. |
| 4.4 | Regenerate dropdown | Open Regenerate menu | Options: Regenerate All, **All images**, Text only, AI image only. |
| 4.5 | All images | Click "All images" (with quota) | Stock options and AI image refresh; text unchanged. |
| 4.6 | Button labels | On image card | "Customize" (not "Add Branding"); Reapply auto-branding still present. |
| 4.7 | Save area | Look above/beside Save button | "Save to library" button; line "Ready to save to your library when you're done." |
| 4.8 | Save & success | Click "Save to library" | "Saved! Taking you to your library…"; redirect to library after ~1s. |

---

## 5. Create content – Step 3 – Social pack

Use **Social Media Pack** and reach step 3.

| # | Test | What to do | Expected |
|---|------|------------|----------|
| 5.1 | Regenerate menu | Open Regenerate | Includes "All images" option. |
| 5.2 | Customize label | On an image card | "Customize" (not "Add Branding"). |

---

## 6. Stepper

| # | Test | What to do | Expected |
|---|------|------------|----------|
| 6.1 | Step changes | Move from step 1 → 2 → 3 | Step circles and connectors update with a smooth transition (no hard jump). |

---

## 7. Quick smoke checklist

- [ ] Branding: open page, edit one business, set a colour, use "Your palette" copy, save.
- [ ] Content: pick GMB Post → fill details → Generate → pick image → see "Applying branding…" or "Your brand is on it" → Save to library → see success and redirect.
- [ ] Content: pick Social Pack → Generate → step 3 → Regenerate → "All images" (if quota allows).

---

**Note:** If you use Supabase (RLS, storage), ensure migrations like `FIX_STORAGE_RLS_GENERATED_IMAGES.sql` and any RLS fixes are applied to the project linked to this Vercel deploy (same env vars).
