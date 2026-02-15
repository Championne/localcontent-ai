-- Fix: "new row violates row-level security policy" when applying branding (Step 3)
-- This happens on storage upload to bucket "generated-images".
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run
--
-- Prerequisite: Create bucket in Storage → New bucket → id: generated-images, Public: true.

-- Drop existing policies so we can recreate them (avoids duplicate policy errors)
DROP POLICY IF EXISTS "generated_images_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "generated_images_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "generated_images_public_select" ON storage.objects;

-- Allow authenticated users to upload to their own folder (path: {user_id}/...)
-- Using name LIKE auth.uid()::text || '/%' so the first path segment must be the user's id
CREATE POLICY "generated_images_authenticated_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'generated-images'
  AND name LIKE (auth.uid()::text || '/%')
);

-- Allow authenticated users to update/upsert their own files
CREATE POLICY "generated_images_authenticated_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'generated-images'
  AND name LIKE (auth.uid()::text || '/%')
)
WITH CHECK (
  bucket_id = 'generated-images'
  AND name LIKE (auth.uid()::text || '/%')
);

-- Allow public read so getPublicUrl() works
CREATE POLICY "generated_images_public_select"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'generated-images');
