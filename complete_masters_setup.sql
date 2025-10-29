-- Complete Masters Setup Script
-- Run this in your Supabase SQL Editor to set up all master data tables

-- ==============================================
-- 1. CREATE ALL MASTER TABLES
-- ==============================================

-- Product categories table (already exists, but ensure it has all fields)
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

-- Branding master table
CREATE TABLE IF NOT EXISTS branding_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_name VARCHAR(255) NOT NULL,
  brand_code VARCHAR(50) UNIQUE NOT NULL,
  logo_url TEXT,
  brand_colors JSONB,
  typography VARCHAR(100),
  brand_guidelines TEXT,
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  branding_type VARCHAR(100),
  placement VARCHAR(255),
  measurement_unit VARCHAR(50),
  measurement VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Size master table
CREATE TABLE IF NOT EXISTS size_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  size_name VARCHAR(50) NOT NULL,
  size_code VARCHAR(20) UNIQUE NOT NULL,
  size_type VARCHAR(50),
  measurements JSONB,
  size_chart_url TEXT,
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
-- 2. CREATE INDEXES
-- ==============================================

-- Product categories indexes
CREATE INDEX IF NOT EXISTS idx_product_categories_code ON product_categories(code);
CREATE INDEX IF NOT EXISTS idx_product_categories_parent ON product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_active ON product_categories(is_active);

-- Fabric master indexes
CREATE INDEX IF NOT EXISTS idx_fabric_master_code ON fabric_master(fabric_code);
CREATE INDEX IF NOT EXISTS idx_fabric_master_type ON fabric_master(fabric_type);
CREATE INDEX IF NOT EXISTS idx_fabric_master_active ON fabric_master(is_active);

-- Item master indexes
CREATE INDEX IF NOT EXISTS idx_item_master_code ON item_master(item_code);
CREATE INDEX IF NOT EXISTS idx_item_master_category ON item_master(category_id);
CREATE INDEX IF NOT EXISTS idx_item_master_type ON item_master(item_type);
CREATE INDEX IF NOT EXISTS idx_item_master_active ON item_master(is_active);

-- Branding master indexes
CREATE INDEX IF NOT EXISTS idx_branding_master_code ON branding_master(brand_code);
CREATE INDEX IF NOT EXISTS idx_branding_master_active ON branding_master(is_active);

-- Size master indexes
CREATE INDEX IF NOT EXISTS idx_size_master_code ON size_master(size_code);
CREATE INDEX IF NOT EXISTS idx_size_master_type ON size_master(size_type);
CREATE INDEX IF NOT EXISTS idx_size_master_active ON size_master(is_active);

-- Customization master indexes
CREATE INDEX IF NOT EXISTS idx_customization_master_code ON customization_master(customization_code);
CREATE INDEX IF NOT EXISTS idx_customization_master_type ON customization_master(customization_type);
CREATE INDEX IF NOT EXISTS idx_customization_master_active ON customization_master(is_active);

-- Customer master indexes
CREATE INDEX IF NOT EXISTS idx_customer_master_code ON customer_master(customer_code);
CREATE INDEX IF NOT EXISTS idx_customer_master_type ON customer_master(customer_type);
CREATE INDEX IF NOT EXISTS idx_customer_master_active ON customer_master(is_active);

-- Vendor master indexes
CREATE INDEX IF NOT EXISTS idx_vendor_master_code ON vendor_master(vendor_code);
CREATE INDEX IF NOT EXISTS idx_vendor_master_type ON vendor_master(vendor_type);
CREATE INDEX IF NOT EXISTS idx_vendor_master_active ON vendor_master(is_active);

-- ==============================================
-- 3. CREATE TRIGGERS
-- ==============================================

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all master tables
CREATE TRIGGER update_product_categories_updated_at 
  BEFORE UPDATE ON product_categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fabric_master_updated_at 
  BEFORE UPDATE ON fabric_master 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_item_master_updated_at 
  BEFORE UPDATE ON item_master 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branding_master_updated_at 
  BEFORE UPDATE ON branding_master 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_size_master_updated_at 
  BEFORE UPDATE ON size_master 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customization_master_updated_at 
  BEFORE UPDATE ON customization_master 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_master_updated_at 
  BEFORE UPDATE ON customer_master 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_master_updated_at 
  BEFORE UPDATE ON vendor_master 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- 4. ENABLE RLS
-- ==============================================

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE fabric_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE size_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE customization_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_master ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 5. CREATE RLS POLICIES
-- ==============================================

-- Simple policies for all master tables
CREATE POLICY "product_categories_policy" ON product_categories
  FOR ALL USING (true);

CREATE POLICY "fabric_master_policy" ON fabric_master
  FOR ALL USING (true);

CREATE POLICY "item_master_policy" ON item_master
  FOR ALL USING (true);

CREATE POLICY "branding_master_policy" ON branding_master
  FOR ALL USING (true);

CREATE POLICY "size_master_policy" ON size_master
  FOR ALL USING (true);

CREATE POLICY "customization_master_policy" ON customization_master
  FOR ALL USING (true);

CREATE POLICY "customer_master_policy" ON customer_master
  FOR ALL USING (true);

CREATE POLICY "vendor_master_policy" ON vendor_master
  FOR ALL USING (true);

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

-- Insert sample sizes
INSERT INTO size_master (size_name, size_code, size_type, measurements) VALUES
('Small', 'S', 'Clothing', '{"chest": "36", "waist": "30", "length": "28"}'),
('Medium', 'M', 'Clothing', '{"chest": "38", "waist": "32", "length": "29"}'),
('Large', 'L', 'Clothing', '{"chest": "40", "waist": "34", "length": "30"}'),
('Extra Large', 'XL', 'Clothing', '{"chest": "42", "waist": "36", "length": "31"}')
ON CONFLICT (size_code) DO NOTHING;

-- Insert sample customization types
INSERT INTO customization_master (customization_name, customization_code, customization_type, description, cost_per_unit, time_required_hours) VALUES
('Embroidery', 'EMB', 'Embroidery', 'Custom embroidery work', 50.00, 2.0),
('Screen Printing', 'PRT', 'Printing', 'Screen printing on fabric', 25.00, 1.0),
('Custom Stitching', 'STI', 'Stitching', 'Custom stitching patterns', 75.00, 3.0),
('Logo Application', 'LOG', 'Branding', 'Logo application on products', 30.00, 1.5)
ON CONFLICT (customization_code) DO NOTHING;

-- ==============================================
-- 7. VERIFICATION
-- ==============================================

-- Check all tables were created
SELECT 'Masters tables created successfully' as status;

-- Check table counts
SELECT 'product_categories' as table_name, count(*) as row_count FROM product_categories
UNION ALL
SELECT 'fabric_master' as table_name, count(*) as row_count FROM fabric_master
UNION ALL
SELECT 'item_master' as table_name, count(*) as row_count FROM item_master
UNION ALL
SELECT 'branding_master' as table_name, count(*) as row_count FROM branding_master
UNION ALL
SELECT 'size_master' as table_name, count(*) as row_count FROM size_master
UNION ALL
SELECT 'customization_master' as table_name, count(*) as row_count FROM customization_master
UNION ALL
SELECT 'customer_master' as table_name, count(*) as row_count FROM customer_master
UNION ALL
SELECT 'vendor_master' as table_name, count(*) as row_count FROM vendor_master;
