-- Configuration tables for company settings and branding

-- Company configuration table
CREATE TABLE company_config (
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
CREATE TABLE branding_assets (
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(asset_type, is_active) -- Only one active asset per type
);

-- Document settings table
CREATE TABLE document_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'text', -- 'text', 'number', 'boolean', 'json'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_company_config_code ON company_config(company_code);
CREATE INDEX idx_branding_assets_type ON branding_assets(asset_type);
CREATE INDEX idx_branding_assets_active ON branding_assets(is_active);
CREATE INDEX idx_document_settings_key ON document_settings(setting_key);

-- Add updated_at triggers
CREATE TRIGGER update_company_config_updated_at BEFORE UPDATE ON company_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_branding_assets_updated_at BEFORE UPDATE ON branding_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_settings_updated_at BEFORE UPDATE ON document_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE company_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company_config
CREATE POLICY "Everyone can view company config" ON company_config
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage company config" ON company_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for branding_assets
CREATE POLICY "Everyone can view branding assets" ON branding_assets
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage branding assets" ON branding_assets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for document_settings
CREATE POLICY "Everyone can view document settings" ON document_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage document settings" ON document_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default company configuration
INSERT INTO company_config (company_name, company_code, address, city, state, country, pincode, phone, email, website, gstin, pan) VALUES
('Scott International', 'SCOTT001', '123 Business Park, Industrial Area', 'Mumbai', 'Maharashtra', 'India', '400001', '+91-22-12345678', 'info@scottinternational.com', 'www.scottinternational.com', '27AABCS1234C1Z5', 'AABCS1234C');

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
('authorized_signatory_designation', 'Managing Director', 'text', 'Designation of authorized signatory');
