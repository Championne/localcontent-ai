# Cleanup Issues

## Known Issues

### 1. Dead code in content/page.tsx
Functions `applyPayloadToImage`, `handleApplyOverlays`, `revertToSuggestedBranding`, and the auto-branding recommendation flow still exist as dead code. They reference `/api/image/composite` (now deleted) at runtime. These should be removed in a follow-up PR.

### 2. Stub types for removed imports
`OverlayApplyPayload`, `BrandColors`, `FRAME_PRESET_COLORS` are defined as inline stub types at the top of `content/page.tsx` to keep dead-code functions compiling. Remove when the dead code is cleaned up.

### 3. Database migration not yet run
`supabase/migrations/20260215000000_image_generation_metadata.sql` needs to be executed in Supabase Dashboard before the new columns are available.

### 4. Cost analytics shows zeros until metadata columns are populated
The `generation_cost` and `model_used` columns need to be populated by the image generation API. Currently the API doesn't write these values. A follow-up task should update `app/api/content/generate/route.ts` to set these fields on insert.
