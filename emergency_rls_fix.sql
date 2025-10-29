-- Emergency RLS Fix - Completely removes problematic policies
-- This is a more aggressive approach to fix the infinite recursion

-- ==============================================
-- 1. DISABLE RLS TEMPORARILY
-- ==============================================

-- Disable RLS on all configuration tables temporarily
ALTER TABLE company_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE branding_assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_settings DISABLE ROW LEVEL SECURITY;

-- ==============================================
-- 2. DROP ALL EXISTING POLICIES
-- ==============================================

-- Drop all policies from configuration tables
DROP POLICY IF EXISTS "Everyone can view company config" ON company_config;
DROP POLICY IF EXISTS "Admins can manage company config" ON company_config;
DROP POLICY IF EXISTS "Authenticated users can manage company config" ON company_config;

DROP POLICY IF EXISTS "Everyone can view branding assets" ON branding_assets;
DROP POLICY IF EXISTS "Admins can manage branding assets" ON branding_assets;
DROP POLICY IF EXISTS "Authenticated users can manage branding assets" ON branding_assets;

DROP POLICY IF EXISTS "Everyone can view document settings" ON document_settings;
DROP POLICY IF EXISTS "Admins can manage document settings" ON document_settings;
DROP POLICY IF EXISTS "Authenticated users can manage document settings" ON document_settings;

-- Drop all storage policies
DROP POLICY IF EXISTS "Anyone can view branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete branding assets" ON storage.objects;

-- ==============================================
-- 3. ENABLE RLS WITH SIMPLE POLICIES
-- ==============================================

-- Re-enable RLS
ALTER TABLE company_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_settings ENABLE ROW LEVEL SECURITY;

-- Create very simple policies that don't query any other tables
CREATE POLICY "Allow all operations on company_config" ON company_config
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on branding_assets" ON branding_assets
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on document_settings" ON document_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Create simple storage policies
CREATE POLICY "Allow all operations on branding storage" ON storage.objects
  FOR ALL USING (bucket_id = 'branding-assets') WITH CHECK (bucket_id = 'branding-assets');

-- ==============================================
-- 4. VERIFY TABLES EXIST AND HAVE DATA
-- ==============================================

-- Check if tables exist
SELECT 'company_config' as table_name, count(*) as row_count FROM company_config
UNION ALL
SELECT 'branding_assets' as table_name, count(*) as row_count FROM branding_assets
UNION ALL
SELECT 'document_settings' as table_name, count(*) as row_count FROM document_settings;

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'branding-assets';

-- ==============================================
-- 5. INSERT DEFAULT DATA IF MISSING
-- ==============================================

-- Insert default company config if not exists
INSERT INTO company_config (company_name, company_code, address, city, state, country, pincode, phone, email, website, gstin, pan) 
VALUES (
  'Scott International', 
  'SCOTT001', 
  '4th Cross Rd, DN Ramaiah Layout, Palace Guttahalli', 
  'Bangalore', 
  'Karnataka', 
  'India', 
  '560003', 
  '9886127844', 
  'bizz@scottinternational.com', 
  'scottinternational.com', 
  '27AABCS1234C1Z5', 
  'AABCS1234C'
) ON CONFLICT (company_code) DO NOTHING;

-- Insert default document settings if not exists
INSERT INTO document_settings (setting_key, setting_value, setting_type, description) VALUES
('invoice_prefix', 'INV', 'text', 'Prefix for invoice numbers'),
('quotation_prefix', 'QUO', 'text', 'Prefix for quotation numbers'),
('order_prefix', 'ORD', 'text', 'Prefix for order numbers'),
('currency', 'INR', 'text', 'Default currency for documents'),
('currency_symbol', '₹', 'text', 'Currency symbol'),
('terms_conditions', 'Terms and conditions apply. Please refer to our standard terms.', 'text', 'Default terms and conditions'),
('footer_text', 'Thank you for your business!', 'text', 'Footer text for documents'),
('authorized_signatory_name', 'John Doe', 'text', 'Name of authorized signatory'),
('authorized_signatory_designation', 'Managing Director', 'text', 'Designation of authorized signatory')
ON CONFLICT (setting_key) DO NOTHING;

-- ==============================================
-- 6. FINAL VERIFICATION
-- ==============================================

SELECT 'Emergency RLS fix completed successfully' as status;
