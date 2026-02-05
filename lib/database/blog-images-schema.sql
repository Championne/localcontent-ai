-- Blog Images Table
-- Run this in Supabase SQL Editor to create the table

CREATE TABLE IF NOT EXISTS blog_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  style TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_blog_images_slug ON blog_images(slug);

-- Enable RLS
ALTER TABLE blog_images ENABLE ROW LEVEL SECURITY;

-- Allow public read access (blog images are public)
CREATE POLICY "Blog images are publicly readable"
  ON blog_images FOR SELECT
  TO public
  USING (true);

-- Allow authenticated admins to insert/update/delete
-- You may want to restrict this to specific roles
CREATE POLICY "Admins can manage blog images"
  ON blog_images FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
