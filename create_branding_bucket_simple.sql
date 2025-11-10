-- SIMPLE: Create Branding Assets Bucket
-- Run this in Supabase SQL Editor
-- This is the most permissive version that should work

-- Step 1: Create the bucket (idempotent)
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

-- Step 2: Drop ALL existing policies for this bucket
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'objects' 
      AND (policyname ILIKE '%branding%' OR policyname ILIKE '%Branding%')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Step 3: Create the MOST PERMISSIVE policies (for testing)
-- View: Anyone can view
CREATE POLICY "branding_assets_public_view" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'branding-assets');

-- Upload: Any authenticated user can upload
CREATE POLICY "branding_assets_authenticated_upload" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'branding-assets' AND
    auth.role() = 'authenticated'
  );

-- Update: Any authenticated user can update
CREATE POLICY "branding_assets_authenticated_update" ON storage.objects
  FOR UPDATE 
  USING (
    bucket_id = 'branding-assets' AND
    auth.role() = 'authenticated'
  )
  WITH CHECK (
    bucket_id = 'branding-assets' AND
    auth.role() = 'authenticated'
  );

-- Delete: Any authenticated user can delete
CREATE POLICY "branding_assets_authenticated_delete" ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'branding-assets' AND
    auth.role() = 'authenticated'
  );

-- Step 4: Verify
SELECT 
  '✓ Bucket created/updated' as status,
  id,
  name,
  public,
  file_size_limit
FROM storage.buckets 
WHERE id = 'branding-assets';

SELECT 
  '✓ Policies created' as status,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%branding%'
ORDER BY policyname;

