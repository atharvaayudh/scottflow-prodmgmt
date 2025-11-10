-- Create storage bucket for order images and attachments
-- Run this in your Supabase SQL editor

-- Create the order-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'order-images',
  'order-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view order images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload order images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update order images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete order images" ON storage.objects;

-- Anyone can view order images (public bucket)
CREATE POLICY "Anyone can view order images" ON storage.objects
  FOR SELECT USING (bucket_id = 'order-images');

-- Authenticated users can upload order images
CREATE POLICY "Authenticated can upload order images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'order-images' AND
    auth.role() IN ('authenticated', 'anon')
  );

-- Authenticated users can update order images
CREATE POLICY "Authenticated can update order images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'order-images' AND
    auth.role() IN ('authenticated', 'anon')
  );

-- Authenticated users can delete order images
CREATE POLICY "Authenticated can delete order images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'order-images' AND
    auth.role() IN ('authenticated', 'anon')
  );

-- Verify bucket was created
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id = 'order-images';
