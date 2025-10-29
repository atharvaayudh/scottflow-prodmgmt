-- Recreate Storage Bucket for Branding Assets
-- This ensures the storage bucket is properly configured

-- ==============================================
-- 1. DELETE EXISTING BUCKET (if exists)
-- ==============================================

-- Delete the bucket if it exists
DELETE FROM storage.buckets WHERE id = 'branding-assets';

-- ==============================================
-- 2. CREATE NEW STORAGE BUCKET
-- ==============================================

-- Create storage bucket for branding assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'branding-assets',
  'branding-assets',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
);

-- ==============================================
-- 3. CREATE SIMPLE STORAGE POLICIES
-- ==============================================

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow all operations on branding storage" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete branding assets" ON storage.objects;

-- Create very simple storage policies
CREATE POLICY "Allow all operations on branding storage" ON storage.objects
  FOR ALL USING (bucket_id = 'branding-assets') WITH CHECK (bucket_id = 'branding-assets');

-- ==============================================
-- 4. VERIFY BUCKET CREATION
-- ==============================================

-- Check if bucket was created
SELECT * FROM storage.buckets WHERE id = 'branding-assets';

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

SELECT 'Storage bucket recreated successfully' as status;
