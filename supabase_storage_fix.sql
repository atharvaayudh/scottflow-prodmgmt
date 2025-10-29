-- Supabase-Compatible Storage Fix
-- This works within Supabase's security constraints

-- ==============================================
-- 1. CREATE STORAGE BUCKET (if not exists)
-- ==============================================

-- Create storage bucket for branding assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'branding-assets',
  'branding-assets',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- 2. CREATE STORAGE POLICIES (Supabase Compatible)
-- ==============================================

-- Drop existing policies first
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

-- Create new policies that work with Supabase
CREATE POLICY "Public branding assets view" ON storage.objects
  FOR SELECT USING (bucket_id = 'branding-assets');

CREATE POLICY "Authenticated branding assets upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'branding-assets' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated branding assets update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'branding-assets' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated branding assets delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'branding-assets' AND
    auth.role() = 'authenticated'
  );

-- ==============================================
-- 3. VERIFY STORAGE BUCKET
-- ==============================================

-- Check if bucket was created
SELECT 
  'Storage bucket status' as info,
  id,
  name,
  public,
  file_size_limit
FROM storage.buckets 
WHERE id = 'branding-assets';

-- ==============================================
-- 4. CHECK STORAGE POLICIES
-- ==============================================

-- Check storage policies (this might not work due to permissions)
SELECT 
  'Storage policies check' as info,
  count(*) as policy_count
FROM pg_policies 
WHERE tablename = 'objects' AND policyname LIKE '%branding%';

-- ==============================================
-- 5. ALTERNATIVE: DISABLE RLS ON CONFIGURATION TABLES
-- ==============================================

-- Since we can't modify storage policies, let's make sure our tables work
-- This ensures the configuration system works even if storage has issues

-- Make sure our configuration tables have simple policies
ALTER TABLE company_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE branding_assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_settings DISABLE ROW LEVEL SECURITY;

-- Re-enable with simple policies
ALTER TABLE company_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on company_config" ON company_config;
DROP POLICY IF EXISTS "Allow all operations on branding_assets" ON branding_assets;
DROP POLICY IF EXISTS "Allow all operations on document_settings" ON document_settings;

-- Create simple policies
CREATE POLICY "Public company config access" ON company_config
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public branding assets access" ON branding_assets
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public document settings access" ON document_settings
  FOR ALL USING (true) WITH CHECK (true);

-- ==============================================
-- 6. FINAL STATUS
-- ==============================================

SELECT 'Storage and configuration system configured' as status;
