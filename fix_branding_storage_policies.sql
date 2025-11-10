-- Fix Branding Assets Storage Policies
-- This fixes the "new row violates row-level security policy" error
-- Run this in your Supabase SQL Editor

-- ==============================================
-- 1. DROP ALL EXISTING POLICIES FOR BRANDING-ASSETS
-- ==============================================

-- Drop all existing storage policies that might be blocking
DO $$
DECLARE
  pol RECORD;
BEGIN
  -- Drop all policies related to branding-assets
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'objects' 
      AND (
        policyname ILIKE '%branding%' OR
        policyname ILIKE '%Branding%'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    RAISE NOTICE 'Dropped policy: %', pol.policyname;
  END LOOP;
END $$;

-- ==============================================
-- 2. CREATE PERMISSIVE POLICIES FOR BRANDING-ASSETS
-- ==============================================

-- Policy 1: Anyone can SELECT (view) files
CREATE POLICY "branding_assets_select" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'branding-assets');

-- Policy 2: Authenticated users can INSERT (upload) files
CREATE POLICY "branding_assets_insert" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'branding-assets' AND
    auth.role() = 'authenticated'
  );

-- Policy 3: Authenticated users can UPDATE files
CREATE POLICY "branding_assets_update" ON storage.objects
  FOR UPDATE 
  USING (
    bucket_id = 'branding-assets' AND
    auth.role() = 'authenticated'
  )
  WITH CHECK (
    bucket_id = 'branding-assets' AND
    auth.role() = 'authenticated'
  );

-- Policy 4: Authenticated users can DELETE files
CREATE POLICY "branding_assets_delete" ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'branding-assets' AND
    auth.role() = 'authenticated'
  );

-- ==============================================
-- 3. VERIFY POLICIES WERE CREATED
-- ==============================================

SELECT 
  'Storage Policies' as info,
  policyname,
  cmd as command,
  roles
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%branding%'
ORDER BY policyname;

-- ==============================================
-- 4. VERIFY BUCKET EXISTS AND IS PUBLIC
-- ==============================================

SELECT 
  'Bucket Status' as info,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'branding-assets';

-- ==============================================
-- 5. TEST POLICY (Optional - shows what auth.role() returns)
-- ==============================================

-- This will show the current auth role
SELECT 
  'Current Auth Role' as info,
  auth.role() as role,
  auth.uid() as user_id;

-- ==============================================
-- SUCCESS MESSAGE
-- ==============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Storage Policies Fixed!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'The branding-assets bucket policies have been updated.';
  RAISE NOTICE 'Authenticated users can now upload files.';
  RAISE NOTICE 'Try uploading a logo again.';
  RAISE NOTICE '========================================';
END $$;

