-- Simple Configuration Fix
-- This focuses on making the configuration system work

-- ==============================================
-- 1. ENSURE STORAGE BUCKET EXISTS
-- ==============================================

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'branding-assets',
  'branding-assets',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- 2. SIMPLIFY CONFIGURATION TABLE POLICIES
-- ==============================================

-- Disable RLS temporarily
ALTER TABLE company_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE branding_assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_settings DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Public company config access" ON company_config;
DROP POLICY IF EXISTS "Public branding assets access" ON branding_assets;
DROP POLICY IF EXISTS "Public document settings access" ON document_settings;
DROP POLICY IF EXISTS "Allow all operations on company_config" ON company_config;
DROP POLICY IF EXISTS "Allow all operations on branding_assets" ON branding_assets;
DROP POLICY IF EXISTS "Allow all operations on document_settings" ON document_settings;

-- Re-enable RLS
ALTER TABLE company_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_settings ENABLE ROW LEVEL SECURITY;

-- Create very simple policies
CREATE POLICY "company_config_policy" ON company_config
  FOR ALL USING (true);

CREATE POLICY "branding_assets_policy" ON branding_assets
  FOR ALL USING (true);

CREATE POLICY "document_settings_policy" ON document_settings
  FOR ALL USING (true);

-- ==============================================
-- 3. INSERT DEFAULT DATA
-- ==============================================

-- Insert default company config
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
) ON CONFLICT (company_code) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  country = EXCLUDED.country,
  pincode = EXCLUDED.pincode,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  website = EXCLUDED.website,
  gstin = EXCLUDED.gstin,
  pan = EXCLUDED.pan;

-- Insert default document settings
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
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  setting_type = EXCLUDED.setting_type,
  description = EXCLUDED.description;

-- ==============================================
-- 4. VERIFY EVERYTHING WORKS
-- ==============================================

-- Check tables have data
SELECT 'company_config' as table_name, count(*) as row_count FROM company_config
UNION ALL
SELECT 'branding_assets' as table_name, count(*) as row_count FROM branding_assets
UNION ALL
SELECT 'document_settings' as table_name, count(*) as row_count FROM document_settings;

-- Check storage bucket
SELECT 'Storage bucket' as info, id, public FROM storage.buckets WHERE id = 'branding-assets';

SELECT 'Configuration system ready - try uploading now' as status;
