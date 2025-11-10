-- Verify and create order-images bucket
-- Run this in your Supabase SQL editor

-- 1. Check if bucket exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'order-images') 
    THEN 'Bucket EXISTS' 
    ELSE 'Bucket MISSING - Will create below'
  END AS bucket_status;

-- 2. Try to delete and recreate (safe operation)
DO $$
BEGIN
    DELETE FROM storage.buckets WHERE id = 'order-images';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not delete existing bucket, will update instead';
END $$;

-- 3. Create the order-images bucket
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

-- 4. Drop and recreate storage policies
DROP POLICY IF EXISTS "Anyone can view order images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload order images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update order images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete order images" ON storage.objects;

CREATE POLICY "Anyone can view order images" ON storage.objects
  FOR SELECT USING (bucket_id = 'order-images');

CREATE POLICY "Authenticated can upload order images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'order-images' AND
    auth.role() IN ('authenticated', 'anon')
  );

CREATE POLICY "Authenticated can update order images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'order-images' AND
    auth.role() IN ('authenticated', 'anon')
  );

CREATE POLICY "Authenticated can delete order images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'order-images' AND
    auth.role() IN ('authenticated', 'anon')
  );

-- 5. Verify bucket was created successfully
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id = 'order-images';

-- 6. List all buckets (to help debug)
SELECT id, name, public FROM storage.buckets ORDER BY created_at DESC;
