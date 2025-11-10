-- Verify Branding Assets Bucket Access
-- Run this to check if the bucket exists and is accessible

-- ==============================================
-- 1. CHECK IF BUCKET EXISTS
-- ==============================================
SELECT 
  'Bucket Check' as step,
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'branding-assets') 
    THEN 'Bucket EXISTS ✓' 
    ELSE 'Bucket DOES NOT EXIST ✗' 
  END as status;

-- Show bucket details
SELECT 
  'Bucket Details' as info,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'branding-assets';

-- ==============================================
-- 2. CHECK STORAGE POLICIES
-- ==============================================
SELECT 
  'Storage Policies' as info,
  policyname,
  cmd as command,
  roles,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'objects' 
  AND (policyname LIKE '%branding%' OR policyname LIKE '%Branding%')
ORDER BY policyname;

-- ==============================================
-- 3. CREATE BUCKET IF IT DOESN'T EXIST
-- ==============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'branding-assets',
  'branding-assets',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ==============================================
-- 4. ENSURE STORAGE POLICIES EXIST
-- ==============================================

-- Drop all existing policies first
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'objects' 
      AND (policyname LIKE '%branding%' OR policyname LIKE '%Branding%')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Create new policies
CREATE POLICY IF NOT EXISTS "Branding assets view policy" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'branding-assets');

CREATE POLICY IF NOT EXISTS "Branding assets insert policy" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'branding-assets' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY IF NOT EXISTS "Branding assets update policy" ON storage.objects
  FOR UPDATE 
  USING (
    bucket_id = 'branding-assets' AND
    auth.role() = 'authenticated'
  )
  WITH CHECK (
    bucket_id = 'branding-assets' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY IF NOT EXISTS "Branding assets delete policy" ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'branding-assets' AND
    auth.role() = 'authenticated'
  );

-- ==============================================
-- 5. FINAL VERIFICATION
-- ==============================================
SELECT 
  'Final Status' as step,
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'branding-assets') 
    THEN 'Bucket is ready ✓' 
    ELSE 'Bucket still missing ✗' 
  END as status;

