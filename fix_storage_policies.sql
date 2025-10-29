-- Complete Storage Policy Fix
-- This completely removes all storage policies and creates simple ones

-- ==============================================
-- 1. DROP ALL EXISTING STORAGE POLICIES
-- ==============================================

-- Drop all existing storage policies for branding assets
DROP POLICY IF EXISTS "Anyone can view branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on branding storage" ON storage.objects;

-- ==============================================
-- 2. CREATE SIMPLE STORAGE POLICIES
-- ==============================================

-- Create very simple storage policies that don't query any other tables
CREATE POLICY "Simple branding view policy" ON storage.objects
  FOR SELECT USING (bucket_id = 'branding-assets');

CREATE POLICY "Simple branding insert policy" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'branding-assets');

CREATE POLICY "Simple branding update policy" ON storage.objects
  FOR UPDATE USING (bucket_id = 'branding-assets');

CREATE POLICY "Simple branding delete policy" ON storage.objects
  FOR DELETE USING (bucket_id = 'branding-assets');

-- ==============================================
-- 3. VERIFY STORAGE BUCKET EXISTS
-- ==============================================

-- Check if storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'branding-assets';

-- If bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'branding-assets',
  'branding-assets',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- 4. CHECK STORAGE POLICIES
-- ==============================================

-- Verify storage policies were created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'objects' AND policyname LIKE '%branding%'
ORDER BY policyname;

-- ==============================================
-- 5. TEST STORAGE ACCESS
-- ==============================================

-- Test if we can query the storage bucket
SELECT 
  'Storage bucket test' as test_type,
  count(*) as object_count
FROM storage.objects 
WHERE bucket_id = 'branding-assets';

SELECT 'Storage policies fixed successfully' as status;
