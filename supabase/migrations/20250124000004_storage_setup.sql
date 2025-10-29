-- Create storage bucket for branding assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'branding-assets',
  'branding-assets',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
);

-- Create storage policies for branding assets
CREATE POLICY "Anyone can view branding assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'branding-assets');

CREATE POLICY "Authenticated users can upload branding assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'branding-assets' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update branding assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'branding-assets' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete branding assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'branding-assets' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
