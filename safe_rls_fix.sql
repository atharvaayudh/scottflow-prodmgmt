-- Safe RLS Policy Fix - Handles existing policies
-- Run this in your Supabase SQL Editor

-- ==============================================
-- 1. DROP ALL EXISTING POLICIES SAFELY
-- ==============================================

-- Drop company config policies
DROP POLICY IF EXISTS "Everyone can view company config" ON company_config;
DROP POLICY IF EXISTS "Admins can manage company config" ON company_config;
DROP POLICY IF EXISTS "Authenticated users can manage company config" ON company_config;

-- Drop branding assets policies
DROP POLICY IF EXISTS "Everyone can view branding assets" ON branding_assets;
DROP POLICY IF EXISTS "Admins can manage branding assets" ON branding_assets;
DROP POLICY IF EXISTS "Authenticated users can manage branding assets" ON branding_assets;

-- Drop document settings policies
DROP POLICY IF EXISTS "Everyone can view document settings" ON document_settings;
DROP POLICY IF EXISTS "Admins can manage document settings" ON document_settings;
DROP POLICY IF EXISTS "Authenticated users can manage document settings" ON document_settings;

-- Drop storage policies
DROP POLICY IF EXISTS "Anyone can view branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete branding assets" ON storage.objects;

-- ==============================================
-- 2. CREATE NEW SAFE RLS POLICIES
-- ==============================================

-- Company config policies
CREATE POLICY "Everyone can view company config" ON company_config
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage company config" ON company_config
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Branding assets policies
CREATE POLICY "Everyone can view branding assets" ON branding_assets
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage branding assets" ON branding_assets
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Document settings policies
CREATE POLICY "Everyone can view document settings" ON document_settings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage document settings" ON document_settings
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ==============================================
-- 3. CREATE STORAGE POLICIES
-- ==============================================

-- Storage policies for branding assets
CREATE POLICY "Anyone can view branding assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'branding-assets');

CREATE POLICY "Authenticated users can upload branding assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'branding-assets' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Authenticated users can update branding assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'branding-assets' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Authenticated users can delete branding assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'branding-assets' AND
    auth.uid() IS NOT NULL
  );

-- ==============================================
-- 4. VERIFY POLICIES WERE CREATED
-- ==============================================

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
