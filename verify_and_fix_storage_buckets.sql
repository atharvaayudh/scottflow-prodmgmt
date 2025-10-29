-- Verify and fix storage buckets
-- Run this in your Supabase SQL editor to check bucket status

-- 1. List all existing buckets
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
ORDER BY created_at DESC;

-- 2. Check if people-avatars bucket exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'people-avatars') 
    THEN 'Bucket EXISTS' 
    ELSE 'Bucket MISSING - Run creation script below'
  END AS bucket_status;

-- 3. If bucket doesn't exist or has issues, run this to create/fix it
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'people-avatars',
  'people-avatars',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 4. Fix company_config to have only one record
-- First, check how many records exist
SELECT COUNT(*) as total_records, id, company_name 
FROM company_config 
GROUP BY id, company_name;

-- If you have multiple records, keep the first one and delete others
-- Uncomment the line below after verifying which record to keep:
-- DELETE FROM company_config WHERE id NOT IN (SELECT id FROM company_config ORDER BY created_at ASC LIMIT 1);

-- Or if you want to keep a specific one, replace 'YOUR_RECORD_ID' with the actual ID:
-- DELETE FROM company_config WHERE id != 'YOUR_RECORD_ID';
