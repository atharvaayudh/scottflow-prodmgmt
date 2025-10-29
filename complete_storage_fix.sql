-- Complete Fix for Storage and RLS Policies
-- This addresses the infinite recursion in both table and storage policies

-- ==============================================
-- 1. DROP ALL PROBLEMATIC STORAGE POLICIES
-- ==============================================

-- Drop all existing storage policies for branding assets
DROP POLICY IF EXISTS "Anyone can view branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete branding assets" ON storage.objects;

-- ==============================================
-- 2. DROP PROBLEMATIC TABLE POLICIES
-- ==============================================

-- Drop policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can manage company config" ON company_config;
DROP POLICY IF EXISTS "Admins can manage branding assets" ON branding_assets;
DROP POLICY IF EXISTS "Admins can manage document settings" ON document_settings;

-- ==============================================
-- 3. CREATE SAFE STORAGE POLICIES
-- ==============================================

-- Simple storage policies that don't query other tables
CREATE POLICY "Anyone can view branding assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'branding-assets');

CREATE POLICY "Authenticated users can upload branding assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'branding-assets' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update branding assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'branding-assets' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete branding assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'branding-assets' AND
    auth.role() = 'authenticated'
  );

-- ==============================================
-- 4. CREATE SAFE TABLE POLICIES
-- ==============================================

-- Create safe table policies
CREATE POLICY "Authenticated users can manage company config" ON company_config
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage branding assets" ON branding_assets
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage document settings" ON document_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- ==============================================
-- 5. VERIFY POLICIES
-- ==============================================

-- Check storage policies
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

-- Check table policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename IN ('company_config', 'branding_assets', 'document_settings')
ORDER BY tablename, policyname;

-- ==============================================
-- 6. TEST STORAGE BUCKET ACCESS
-- ==============================================

-- Verify the storage bucket exists and is accessible
SELECT * FROM storage.buckets WHERE id = 'branding-assets';
