-- Quick Fix for Storage Upload Error
-- This specifically fixes the storage policy infinite recursion

-- Drop all existing storage policies for branding assets
DROP POLICY IF EXISTS "Anyone can view branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete branding assets" ON storage.objects;

-- Create simple storage policies that don't cause recursion
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

-- Verify the policies were created
SELECT 'Storage policies updated successfully' as status;
