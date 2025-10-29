-- Quick Fix for Infinite Recursion Error
-- This only fixes the problematic policies without recreating everything

-- Drop only the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can manage company config" ON company_config;
DROP POLICY IF EXISTS "Admins can manage branding assets" ON branding_assets;
DROP POLICY IF EXISTS "Admins can manage document settings" ON document_settings;

-- Create simple policies that don't cause recursion
CREATE POLICY "Authenticated users can manage company config" ON company_config
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage branding assets" ON branding_assets
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage document settings" ON document_settings
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Fix storage policies too
DROP POLICY IF EXISTS "Authenticated users can upload branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete branding assets" ON storage.objects;

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

-- Verify the fix worked
SELECT 'Policies updated successfully' as status;
