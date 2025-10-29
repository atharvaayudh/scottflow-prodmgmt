-- Fix RLS policies to avoid infinite recursion
-- Run this in your Supabase SQL Editor

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage company config" ON company_config;
DROP POLICY IF EXISTS "Admins can manage branding assets" ON branding_assets;
DROP POLICY IF EXISTS "Admins can manage document settings" ON document_settings;

-- Create simplified policies that don't cause circular dependencies
-- For now, allow all authenticated users to manage configurations
-- You can restrict this later once the basic functionality works

CREATE POLICY "Authenticated users can manage company config" ON company_config
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage branding assets" ON branding_assets
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage document settings" ON document_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Also update storage policies to be less restrictive temporarily
DROP POLICY IF EXISTS "Authenticated users can upload branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete branding assets" ON storage.objects;

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

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('company_config', 'branding_assets', 'document_settings')
ORDER BY tablename, policyname;
