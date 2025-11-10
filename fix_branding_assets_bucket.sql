-- Fix Branding Assets Storage Bucket
-- Run this in your Supabase SQL Editor to fix logo upload issues

-- ==============================================
-- 1. CHECK IF BUCKET EXISTS
-- ==============================================

-- First, check if the bucket exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'branding-assets') THEN
    RAISE NOTICE 'Bucket does not exist. Creating it...';
    
    -- Create the storage bucket
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'branding-assets',
      'branding-assets',
      true,
      5242880, -- 5MB limit
      ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    );
    
    RAISE NOTICE 'Bucket created successfully!';
  ELSE
    RAISE NOTICE 'Bucket already exists.';
  END IF;
END $$;

-- ==============================================
-- 2. DROP ALL EXISTING STORAGE POLICIES
-- ==============================================

-- Drop all existing policies for branding-assets bucket
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
DROP POLICY IF EXISTS "branding_assets_select" ON storage.objects;
DROP POLICY IF EXISTS "branding_assets_insert" ON storage.objects;
DROP POLICY IF EXISTS "branding_assets_update" ON storage.objects;
DROP POLICY IF EXISTS "branding_assets_delete" ON storage.objects;

-- ==============================================
-- 3. CREATE SIMPLE, PERMISSIVE STORAGE POLICIES
-- ==============================================

-- Allow anyone to view branding assets (public bucket)
CREATE POLICY "Branding assets view policy" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'branding-assets');

-- Allow authenticated users to upload branding assets
CREATE POLICY "Branding assets insert policy" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'branding-assets' AND
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to update branding assets
CREATE POLICY "Branding assets update policy" ON storage.objects
  FOR UPDATE 
  USING (
    bucket_id = 'branding-assets' AND
    auth.role() = 'authenticated'
  )
  WITH CHECK (
    bucket_id = 'branding-assets' AND
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete branding assets
CREATE POLICY "Branding assets delete policy" ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'branding-assets' AND
    auth.role() = 'authenticated'
  );

-- ==============================================
-- 4. VERIFY BUCKET AND POLICIES
-- ==============================================

-- Check if bucket exists and show details
SELECT 
  'Bucket Status' as info,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'branding-assets';

-- Check storage policies
SELECT 
  'Storage Policies' as info,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%branding%' OR policyname LIKE '%Branding%'
ORDER BY policyname;

-- ==============================================
-- 5. VERIFY BRANDING_ASSETS TABLE RLS
-- ==============================================

-- Ensure branding_assets table has permissive RLS
ALTER TABLE IF EXISTS branding_assets ENABLE ROW LEVEL SECURITY;

-- Drop and recreate simple policies for branding_assets table
DROP POLICY IF EXISTS "Everyone can view branding assets" ON branding_assets;
DROP POLICY IF EXISTS "Authenticated users can manage branding assets" ON branding_assets;
DROP POLICY IF EXISTS "Admins can manage branding assets" ON branding_assets;
DROP POLICY IF EXISTS "Allow all operations on branding_assets" ON branding_assets;

-- Create simple policies
CREATE POLICY "Everyone can view branding assets" ON branding_assets
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can manage branding assets" ON branding_assets
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ==============================================
-- SUCCESS MESSAGE
-- ==============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Branding Assets Bucket Setup Complete!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'The branding-assets bucket has been created/verified.';
  RAISE NOTICE 'Storage policies have been set up for authenticated users.';
  RAISE NOTICE 'You should now be able to upload logos.';
  RAISE NOTICE '========================================';
END $$;

