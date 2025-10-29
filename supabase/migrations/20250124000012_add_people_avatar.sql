-- Add avatar support for people

-- 1) Add avatar_url column to people
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'people' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.people ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- 2) Create storage bucket for avatars (public read)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'people-avatars', 'people-avatars', true, 5242880, -- 5MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3) Storage policies
DROP POLICY IF EXISTS "Anyone can view people avatars" ON storage.objects;
CREATE POLICY "Anyone can view people avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'people-avatars');

DROP POLICY IF EXISTS "Authenticated can upload people avatars" ON storage.objects;
CREATE POLICY "Authenticated can upload people avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'people-avatars' AND auth.role() IN ('authenticated','anon')
  );

DROP POLICY IF EXISTS "Authenticated can update people avatars" ON storage.objects;
CREATE POLICY "Authenticated can update people avatars" ON storage.objects
  FOR UPDATE USING (bucket_id = 'people-avatars' AND auth.role() IN ('authenticated','anon'));

DROP POLICY IF EXISTS "Authenticated can delete people avatars" ON storage.objects;
CREATE POLICY "Authenticated can delete people avatars" ON storage.objects
  FOR DELETE USING (bucket_id = 'people-avatars' AND auth.role() IN ('authenticated','anon'));
