-- Fix: "new row violates row-level security policy" for generated_images / generated_texts
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run
--
-- If the error happens when applying branding (Step 3) or uploading an image, it is
-- storage RLS: run supabase/FIX_STORAGE_RLS_GENERATED_IMAGES.sql and ensure the bucket
-- is named "generated-images" in Supabase Storage.

-- Enable RLS (no-op if already enabled)
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_texts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if present
DROP POLICY IF EXISTS "generated_images_select_own" ON generated_images;
DROP POLICY IF EXISTS "generated_images_insert_own" ON generated_images;
DROP POLICY IF EXISTS "generated_images_update_own" ON generated_images;
DROP POLICY IF EXISTS "generated_images_delete_own" ON generated_images;
DROP POLICY IF EXISTS "generated_texts_select_own" ON generated_texts;
DROP POLICY IF EXISTS "generated_texts_insert_own" ON generated_texts;
DROP POLICY IF EXISTS "generated_texts_update_own" ON generated_texts;
DROP POLICY IF EXISTS "generated_texts_delete_own" ON generated_texts;

-- generated_images: users can only access their own rows
CREATE POLICY "generated_images_select_own" ON generated_images
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "generated_images_insert_own" ON generated_images
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "generated_images_update_own" ON generated_images
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "generated_images_delete_own" ON generated_images
  FOR DELETE USING (auth.uid() = user_id);

-- generated_texts: users can only access their own rows
CREATE POLICY "generated_texts_select_own" ON generated_texts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "generated_texts_insert_own" ON generated_texts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "generated_texts_update_own" ON generated_texts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "generated_texts_delete_own" ON generated_texts
  FOR DELETE USING (auth.uid() = user_id);
