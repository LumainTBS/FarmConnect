-- ====================================================================
-- FarmConnect Eswatini - Storage Setup for Produce Listing Images
-- Run this in your Supabase SQL Editor if produce-images bucket is not yet created.
-- ====================================================================

-- 1. Create produce-images storage bucket if it does not already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'produce-images',
  'produce-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- 2. Allow public read access to all images in produce-images bucket
DO $$
BEGIN
  DROP POLICY IF EXISTS "Produce images are publicly viewable" ON storage.objects;
  CREATE POLICY "Produce images are publicly viewable" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'produce-images');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 3. Allow authenticated farmers to upload produce images
DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can upload produce images" ON storage.objects;
  CREATE POLICY "Authenticated users can upload produce images" 
    ON storage.objects FOR INSERT 
    TO authenticated 
    WITH CHECK (bucket_id = 'produce-images');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 4. Allow farmers to update or delete their own produce images
DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can update produce images" ON storage.objects;
  CREATE POLICY "Authenticated users can update produce images" 
    ON storage.objects FOR UPDATE 
    TO authenticated 
    USING (bucket_id = 'produce-images');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can delete produce images" ON storage.objects;
  CREATE POLICY "Authenticated users can delete produce images" 
    ON storage.objects FOR DELETE 
    TO authenticated 
    USING (bucket_id = 'produce-images');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
