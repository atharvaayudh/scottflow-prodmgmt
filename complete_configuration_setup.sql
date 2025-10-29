-- Complete Configuration Setup Script
-- Run this in your Supabase SQL Editor to set up all configuration features

-- ==============================================
-- 1. CREATE CONFIGURATION TABLES
-- ==============================================

-- Company configuration table
CREATE TABLE IF NOT EXISTS company_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name VARCHAR(255) NOT NULL,
  company_code VARCHAR(50) UNIQUE NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  pincode VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  gstin VARCHAR(15),
  pan VARCHAR(10),
  cin VARCHAR(21),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Branding assets table
CREATE TABLE IF NOT EXISTS branding_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_type VARCHAR(50) NOT NULL, -- 'header_logo', 'sidebar_logo', 'authorized_signatory'
  asset_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  width INTEGER,
  height INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document settings table
CREATE TABLE IF NOT EXISTS document_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'text', -- 'text', 'number', 'boolean', 'json'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 2. CREATE INDEXES
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_company_config_code ON company_config(company_code);
CREATE INDEX IF NOT EXISTS idx_branding_assets_type ON branding_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_branding_assets_active ON branding_assets(is_active);
CREATE INDEX IF NOT EXISTS idx_document_settings_key ON document_settings(setting_key);

-- ==============================================
-- 3. CREATE UPDATED_AT TRIGGER FUNCTION (if not exists)
-- ==============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ==============================================
-- 4. ADD UPDATED_AT TRIGGERS
-- ==============================================

DROP TRIGGER IF EXISTS update_company_config_updated_at ON company_config;
CREATE TRIGGER update_company_config_updated_at 
  BEFORE UPDATE ON company_config 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_branding_assets_updated_at ON branding_assets;
CREATE TRIGGER update_branding_assets_updated_at 
  BEFORE UPDATE ON branding_assets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_document_settings_updated_at ON document_settings;
CREATE TRIGGER update_document_settings_updated_at 
  BEFORE UPDATE ON document_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ==============================================

ALTER TABLE company_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_settings ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 6. CREATE RLS POLICIES
-- ==============================================

-- Company config policies
DROP POLICY IF EXISTS "Everyone can view company config" ON company_config;
CREATE POLICY "Everyone can view company config" ON company_config
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage company config" ON company_config;
CREATE POLICY "Admins can manage company config" ON company_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Branding assets policies
DROP POLICY IF EXISTS "Everyone can view branding assets" ON branding_assets;
CREATE POLICY "Everyone can view branding assets" ON branding_assets
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage branding assets" ON branding_assets;
CREATE POLICY "Admins can manage branding assets" ON branding_assets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Document settings policies
DROP POLICY IF EXISTS "Everyone can view document settings" ON document_settings;
CREATE POLICY "Everyone can view document settings" ON document_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage document settings" ON document_settings;
CREATE POLICY "Admins can manage document settings" ON document_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==============================================
-- 7. CREATE STORAGE BUCKET
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
-- 8. CREATE STORAGE POLICIES
-- ==============================================

-- Storage policies for branding assets
DROP POLICY IF EXISTS "Anyone can view branding assets" ON storage.objects;
CREATE POLICY "Anyone can view branding assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'branding-assets');

DROP POLICY IF EXISTS "Authenticated users can upload branding assets" ON storage.objects;
CREATE POLICY "Authenticated users can upload branding assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'branding-assets' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update branding assets" ON storage.objects;
CREATE POLICY "Admins can update branding assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'branding-assets' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete branding assets" ON storage.objects;
CREATE POLICY "Admins can delete branding assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'branding-assets' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==============================================
-- 9. INSERT DEFAULT DATA
-- ==============================================

-- Insert default company configuration
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
-- 10. VERIFICATION QUERIES
-- ==============================================

-- Verify tables were created
SELECT 'company_config' as table_name, count(*) as row_count FROM company_config
UNION ALL
SELECT 'branding_assets' as table_name, count(*) as row_count FROM branding_assets
UNION ALL
SELECT 'document_settings' as table_name, count(*) as row_count FROM document_settings;

-- Verify storage bucket was created
SELECT * FROM storage.buckets WHERE id = 'branding-assets';

-- Verify RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('company_config', 'branding_assets', 'document_settings')
ORDER BY tablename, policyname;
