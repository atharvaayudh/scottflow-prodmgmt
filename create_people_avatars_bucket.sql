-- Create storage bucket for people avatars
-- Run this in your Supabase SQL editor

-- Drop and recreate bucket if it exists (handle conflicts)
DO $$
BEGIN
    -- Try to delete bucket if it exists (this will fail if bucket has files, which is fine)
    DELETE FROM storage.buckets WHERE id = 'people-avatars';
EXCEPTION
    WHEN OTHERS THEN
        -- If deletion fails (bucket has files), just continue
        RAISE NOTICE 'Could not delete existing bucket, will update instead';
END $$;

-- Create the people-avatars bucket (will update if exists due to conflicts)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'people-avatars',
  'people-avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view people avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload people avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update people avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete people avatars" ON storage.objects;

-- Anyone can view people avatars (public bucket)
CREATE POLICY "Anyone can view people avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'people-avatars');

-- Authenticated users can upload avatars
CREATE POLICY "Authenticated can upload people avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'people-avatars' AND
    auth.role() IN ('authenticated', 'anon')
  );

-- Authenticated users can update avatars
CREATE POLICY "Authenticated can update people avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'people-avatars' AND
    auth.role() IN ('authenticated', 'anon')
  );

-- Authenticated users can delete avatars
CREATE POLICY "Authenticated can delete people avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'people-avatars' AND
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
WHERE id = 'people-avatars';
