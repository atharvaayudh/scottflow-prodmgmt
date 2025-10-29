-- Fix All Masters and Storage Issues
-- This script creates all masters tables and fixes RLS policies

-- ==============================================
-- 1. CREATE ALL MASTERS TABLES
-- ==============================================

-- Product categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES product_categories(id),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fabric master table
CREATE TABLE IF NOT EXISTS fabric_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fabric_name VARCHAR(255) NOT NULL,
  fabric_code VARCHAR(50) UNIQUE NOT NULL,
  fabric_type VARCHAR(100),
  composition TEXT,
  weight_gsm INTEGER,
  width_cm DECIMAL(5,2),
  color VARCHAR(100),
  supplier VARCHAR(255),
  cost_per_meter DECIMAL(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Item master table
CREATE TABLE IF NOT EXISTS item_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_name VARCHAR(255) NOT NULL,
  item_code VARCHAR(50) UNIQUE NOT NULL,
  item_type VARCHAR(100),
  category_id UUID REFERENCES product_categories(id),
  description TEXT,
  unit_of_measure VARCHAR(20),
  specifications JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Branding master table (simplified)
CREATE TABLE IF NOT EXISTS branding_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branding_type VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Size master table (updated)
CREATE TABLE IF NOT EXISTS size_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  size_type VARCHAR(100) NOT NULL,
  image_url TEXT,
  sizes TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customization master table
CREATE TABLE IF NOT EXISTS customization_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customization_name VARCHAR(255) NOT NULL,
  customization_code VARCHAR(50) UNIQUE NOT NULL,
  customization_type VARCHAR(100),
  description TEXT,
  cost_per_unit DECIMAL(10,2),
  time_required_hours DECIMAL(5,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer master table
CREATE TABLE IF NOT EXISTS customer_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name VARCHAR(255) NOT NULL,
  customer_code VARCHAR(50) UNIQUE NOT NULL,
  customer_type VARCHAR(50),
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  country VARCHAR(100) DEFAULT 'India',
  gstin VARCHAR(15),
  pan VARCHAR(10),
  credit_limit DECIMAL(12,2),
  payment_terms VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendor master table
CREATE TABLE IF NOT EXISTS vendor_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_name VARCHAR(255) NOT NULL,
  vendor_code VARCHAR(50) UNIQUE NOT NULL,
  vendor_type VARCHAR(50),
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  country VARCHAR(100) DEFAULT 'India',
  gstin VARCHAR(15),
  pan VARCHAR(10),
  bank_details JSONB,
  payment_terms VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 2. CREATE CONFIGURATION TABLES
-- ==============================================

-- Company config table
CREATE TABLE IF NOT EXISTS company_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name VARCHAR(255) NOT NULL,
  company_code VARCHAR(50) UNIQUE NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  country VARCHAR(100) DEFAULT 'India',
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  gstin VARCHAR(15),
  pan VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Branding assets table
CREATE TABLE IF NOT EXISTS branding_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_type VARCHAR(50) NOT NULL,
  asset_url TEXT NOT NULL,
  asset_name VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document settings table
CREATE TABLE IF NOT EXISTS document_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'text',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 3. ENABLE RLS ON ALL TABLES
-- ==============================================

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE fabric_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE size_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE customization_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_settings ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 4. CREATE SIMPLE RLS POLICIES
-- ==============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "product_categories_policy" ON product_categories;
DROP POLICY IF EXISTS "fabric_master_policy" ON fabric_master;
DROP POLICY IF EXISTS "item_master_policy" ON item_master;
DROP POLICY IF EXISTS "branding_master_policy" ON branding_master;
DROP POLICY IF EXISTS "size_master_policy" ON size_master;
DROP POLICY IF EXISTS "customization_master_policy" ON customization_master;
DROP POLICY IF EXISTS "customer_master_policy" ON customer_master;
DROP POLICY IF EXISTS "vendor_master_policy" ON vendor_master;
DROP POLICY IF EXISTS "company_config_policy" ON company_config;
DROP POLICY IF EXISTS "branding_assets_policy" ON branding_assets;
DROP POLICY IF EXISTS "document_settings_policy" ON document_settings;

-- Create simple policies for all tables
CREATE POLICY "product_categories_policy" ON product_categories FOR ALL USING (true);
CREATE POLICY "fabric_master_policy" ON fabric_master FOR ALL USING (true);
CREATE POLICY "item_master_policy" ON item_master FOR ALL USING (true);
CREATE POLICY "branding_master_policy" ON branding_master FOR ALL USING (true);
CREATE POLICY "size_master_policy" ON size_master FOR ALL USING (true);
CREATE POLICY "customization_master_policy" ON customization_master FOR ALL USING (true);
CREATE POLICY "customer_master_policy" ON customer_master FOR ALL USING (true);
CREATE POLICY "vendor_master_policy" ON vendor_master FOR ALL USING (true);
CREATE POLICY "company_config_policy" ON company_config FOR ALL USING (true);
CREATE POLICY "branding_assets_policy" ON branding_assets FOR ALL USING (true);
CREATE POLICY "document_settings_policy" ON document_settings FOR ALL USING (true);

-- ==============================================
-- 5. CREATE STORAGE BUCKET AND POLICIES
-- ==============================================

-- Create branding-assets bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('branding-assets', 'branding-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies
DROP POLICY IF EXISTS "branding_assets_select" ON storage.objects;
DROP POLICY IF EXISTS "branding_assets_insert" ON storage.objects;
DROP POLICY IF EXISTS "branding_assets_update" ON storage.objects;
DROP POLICY IF EXISTS "branding_assets_delete" ON storage.objects;

-- Create simple storage policies
CREATE POLICY "branding_assets_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'branding-assets');

CREATE POLICY "branding_assets_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'branding-assets');

CREATE POLICY "branding_assets_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'branding-assets');

CREATE POLICY "branding_assets_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'branding-assets');

-- ==============================================
-- 6. INSERT SAMPLE DATA
-- ==============================================

-- Insert sample product categories
INSERT INTO product_categories (name, code, description) VALUES
('Apparel', 'APP', 'Clothing and fashion items'),
('Accessories', 'ACC', 'Fashion accessories'),
('Footwear', 'FOT', 'Shoes and footwear'),
('Bags', 'BAG', 'Handbags and luggage')
ON CONFLICT (code) DO NOTHING;

-- Insert sample branding types
INSERT INTO branding_master (branding_type) VALUES
('Logo'),
('Text'),
('Pattern'),
('Embroidery'),
('Print'),
('Sticker'),
('Custom Design'),
('Monogram')
ON CONFLICT DO NOTHING;

-- Insert sample sizes
INSERT INTO size_master (size_type, sizes) VALUES
('Clothing', 'S,M,L,XL,2XL,3XL'),
('Footwear', '38,39,40,41,42,43,44,45'),
('Accessories', 'One Size'),
('Bags', 'Small,Medium,Large'),
('Jewelry', '16,17,18,19,20,21,22'),
('Hats', 'S,M,L,XL')
ON CONFLICT DO NOTHING;

-- Insert sample customization types
INSERT INTO customization_master (customization_name, customization_code, customization_type, description, cost_per_unit, time_required_hours) VALUES
('Embroidery', 'EMB', 'Embroidery', 'Custom embroidery work', 50.00, 2.0),
('Screen Printing', 'PRT', 'Printing', 'Screen printing on fabric', 25.00, 1.0),
('Custom Stitching', 'STI', 'Stitching', 'Custom stitching patterns', 75.00, 3.0),
('Logo Application', 'LOG', 'Branding', 'Logo application on products', 30.00, 1.5)
ON CONFLICT (customization_code) DO NOTHING;

-- Insert default company config
INSERT INTO company_config (company_name, company_code, address, city, state, pincode, country, phone, email) VALUES
('Your Company Name', 'COMP001', 'Your Company Address', 'Your City', 'Your State', '123456', 'India', '+91-1234567890', 'info@yourcompany.com')
ON CONFLICT (company_code) DO NOTHING;

-- Insert default document settings
INSERT INTO document_settings (setting_key, setting_value, setting_type, description) VALUES
('document_title', 'Production Order', 'text', 'Default document title'),
('document_footer', 'Thank you for your business!', 'text', 'Default document footer text'),
('page_margins', '1 inch', 'text', 'Default page margins'),
('font_family', 'Arial', 'text', 'Default font family'),
('font_size', '12', 'number', 'Default font size')
ON CONFLICT (setting_key) DO NOTHING;

-- ==============================================
-- 7. VERIFICATION
-- ==============================================

SELECT 'All masters tables and storage fixed successfully!' as status;

-- Check table counts
SELECT 'product_categories' as table_name, count(*) as row_count FROM product_categories
UNION ALL
SELECT 'branding_master' as table_name, count(*) as row_count FROM branding_master
UNION ALL
SELECT 'size_master' as table_name, count(*) as row_count FROM size_master
UNION ALL
SELECT 'customization_master' as table_name, count(*) as row_count FROM customization_master
UNION ALL
SELECT 'company_config' as table_name, count(*) as row_count FROM company_config
UNION ALL
SELECT 'branding_assets' as table_name, count(*) as row_count FROM branding_assets
UNION ALL
SELECT 'document_settings' as table_name, count(*) as row_count FROM document_settings;
