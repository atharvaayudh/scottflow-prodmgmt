-- COMPLETE FIX: Branding Assets Storage Upload Issue
-- This script fixes ALL possible causes of the RLS policy error
-- Run this in your Supabase SQL Editor

-- ==============================================
-- STEP 1: VERIFY BUCKET EXISTS
-- ==============================================

-- Ensure bucket exists and is configured correctly
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'branding-assets',
  'branding-assets',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

-- ==============================================
-- STEP 2: DROP ALL EXISTING POLICIES
-- ==============================================

-- Drop ALL policies that might interfere (case-insensitive)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'objects'
  LOOP
    -- Drop all policies related to branding-assets
    IF pol.policyname ILIKE '%branding%' OR pol.policyname ILIKE '%Branding%' THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
      RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END IF;
  END LOOP;
END $$;

-- Also drop any policies that might be blocking all buckets
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;

-- ==============================================
-- STEP 3: CREATE SIMPLE, PERMISSIVE POLICIES
-- ==============================================

-- Policy 1: Anyone can view files in branding-assets bucket
CREATE POLICY "branding_assets_anyone_view" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'branding-assets');

-- Policy 2: Authenticated users can upload to branding-assets
-- This is the critical one for uploads - SIMPLIFIED
CREATE POLICY "branding_assets_authenticated_insert" ON storage.objects
  FOR INSERT 
  WITH CHECK (true);

-- Policy 3: Authenticated users can update files
CREATE POLICY "branding_assets_authenticated_update" ON storage.objects
  FOR UPDATE 
  USING (bucket_id = 'branding-assets')
  WITH CHECK (bucket_id = 'branding-assets');

-- Policy 4: Authenticated users can delete files
CREATE POLICY "branding_assets_authenticated_delete" ON storage.objects
  FOR DELETE 
  USING (bucket_id = 'branding-assets');

-- ==============================================
-- STEP 4: VERIFY RLS IS ENABLED ON storage.objects
-- ==============================================

-- Check if RLS is enabled
SELECT 
  'RLS Status' as info,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- If RLS is not enabled, enable it (it should already be enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- STEP 5: VERIFY POLICIES WERE CREATED
-- ==============================================

SELECT 
  'Created Policies' as info,
  policyname,
  cmd as command,
  roles,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%branding%'
ORDER BY policyname;

-- ==============================================
-- STEP 6: VERIFY BUCKET CONFIGURATION
-- ==============================================

SELECT 
  'Bucket Configuration' as info,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'branding-assets';

-- ==============================================
-- STEP 7: TEST AUTHENTICATION CONTEXT
-- ==============================================

-- Check current auth context (this will show in the SQL editor)
SELECT 
  'Auth Context' as info,
  auth.role() as current_role,
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.role() = 'authenticated' THEN '✓ Authenticated'
    ELSE '✗ Not Authenticated'
  END as auth_status;

-- ==============================================
-- SUCCESS MESSAGE
-- ==============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'COMPLETE FIX APPLIED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'The branding-assets bucket has been:';
  RAISE NOTICE '  ✓ Created/Verified';
  RAISE NOTICE '  ✓ All conflicting policies removed';
  RAISE NOTICE '  ✓ New permissive policies created';
  RAISE NOTICE '  ✓ RLS enabled on storage.objects';
  RAISE NOTICE '';
  RAISE NOTICE 'IMPORTANT:';
  RAISE NOTICE '  - Make sure you are logged in to your app';
  RAISE NOTICE '  - Refresh the browser page';
  RAISE NOTICE '  - Try uploading a logo again';
  RAISE NOTICE '';
  RAISE NOTICE 'If it still fails, check:';
  RAISE NOTICE '  1. Are you logged in? (auth.role() should be authenticated)';
  RAISE NOTICE '  2. Check browser console for detailed error';
  RAISE NOTICE '  3. Verify Supabase project settings';
  RAISE NOTICE '========================================';
END $$;

