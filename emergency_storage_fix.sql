-- Emergency Storage Fix - Disable RLS Temporarily
-- This completely removes RLS from storage to fix upload issues

-- ==============================================
-- 1. DISABLE RLS ON STORAGE OBJECTS
-- ==============================================

-- Disable RLS on storage.objects table
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- ==============================================
-- 2. DROP ALL STORAGE POLICIES
-- ==============================================

-- Drop all existing storage policies
DROP POLICY IF EXISTS "Anyone can view branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on branding storage" ON storage.objects;
DROP POLICY IF EXISTS "Simple branding view policy" ON storage.objects;
DROP POLICY IF EXISTS "Simple branding insert policy" ON storage.objects;
DROP POLICY IF EXISTS "Simple branding update policy" ON storage.objects;
DROP POLICY IF EXISTS "Simple branding delete policy" ON storage.objects;

-- ==============================================
-- 3. ENSURE STORAGE BUCKET EXISTS
-- ==============================================

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'branding-assets',
  'branding-assets',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- 4. VERIFY STORAGE IS WORKING
-- ==============================================

-- Check bucket exists
SELECT * FROM storage.buckets WHERE id = 'branding-assets';

-- Check RLS status
SELECT 
  schemaname, 
  tablename, 
  rowsecurity
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- ==============================================
-- 5. TEST STORAGE ACCESS
-- ==============================================

-- Test basic storage operations
SELECT 
  'Storage test' as test_type,
  count(*) as total_objects
FROM storage.objects;

SELECT 'Storage RLS disabled - uploads should work now' as status;
