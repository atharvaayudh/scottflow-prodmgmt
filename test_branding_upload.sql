-- Test and Fix Branding Assets Upload
-- This creates the MOST PERMISSIVE policies possible
-- Run this in Supabase SQL Editor

-- ==============================================
-- STEP 1: Remove ALL policies on storage.objects
-- ==============================================

-- Drop every single policy on storage.objects (be careful!)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'objects'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    RAISE NOTICE 'Dropped: %', pol.policyname;
  END LOOP;
END $$;

-- ==============================================
-- STEP 2: Create ULTRA-SIMPLE policies
-- ==============================================

-- View: Anyone can view
CREATE POLICY "objects_select" ON storage.objects
  FOR SELECT 
  USING (true);

-- Insert: Anyone can insert (for testing - VERY PERMISSIVE)
-- Change this after testing if needed
CREATE POLICY "objects_insert" ON storage.objects
  FOR INSERT 
  WITH CHECK (true);

-- Update: Anyone can update (for testing)
CREATE POLICY "objects_update" ON storage.objects
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- Delete: Anyone can delete (for testing)
CREATE POLICY "objects_delete" ON storage.objects
  FOR DELETE 
  USING (true);

-- ==============================================
-- ALTERNATIVE: If above is too permissive, use this instead:
-- ==============================================

/*
-- Drop the permissive policies above first
DROP POLICY IF EXISTS "objects_select" ON storage.objects;
DROP POLICY IF EXISTS "objects_insert" ON storage.objects;
DROP POLICY IF EXISTS "objects_update" ON storage.objects;
DROP POLICY IF EXISTS "objects_delete" ON storage.objects;

-- Then create bucket-specific policies
CREATE POLICY "branding_select" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'branding-assets');

CREATE POLICY "branding_insert" ON storage.objects
  FOR INSERT 
  WITH CHECK (bucket_id = 'branding-assets');

CREATE POLICY "branding_update" ON storage.objects
  FOR UPDATE 
  USING (bucket_id = 'branding-assets')
  WITH CHECK (bucket_id = 'branding-assets');

CREATE POLICY "branding_delete" ON storage.objects
  FOR DELETE 
  USING (bucket_id = 'branding-assets');
*/

-- ==============================================
-- STEP 3: Verify
-- ==============================================

SELECT 
  'Policies' as info,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'objects'
ORDER BY policyname;

SELECT 
  'Bucket' as info,
  id,
  name,
  public
FROM storage.buckets 
WHERE id = 'branding-assets';

