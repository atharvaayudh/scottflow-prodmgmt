-- Fix Document Settings Table and Policies
-- This ensures the document_settings table exists and has proper RLS policies

-- ==============================================
-- 1. CREATE DOCUMENT_SETTINGS TABLE IF NOT EXISTS
-- ==============================================

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
-- 2. CREATE INDEXES
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_document_settings_key ON document_settings(setting_key);

-- ==============================================
-- 3. CREATE UPDATED_AT TRIGGER
-- ==============================================

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for document_settings
DROP TRIGGER IF EXISTS update_document_settings_updated_at ON document_settings;
CREATE TRIGGER update_document_settings_updated_at 
  BEFORE UPDATE ON document_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- 4. ENABLE RLS
-- ==============================================

ALTER TABLE document_settings ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 5. DROP EXISTING POLICIES AND CREATE NEW ONES
-- ==============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Everyone can view document settings" ON document_settings;
DROP POLICY IF EXISTS "Admins can manage document settings" ON document_settings;
DROP POLICY IF EXISTS "Authenticated users can manage document settings" ON document_settings;

-- Create new policies
CREATE POLICY "Everyone can view document settings" ON document_settings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage document settings" ON document_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- ==============================================
-- 6. INSERT DEFAULT DOCUMENT SETTINGS
-- ==============================================

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
-- 7. VERIFY THE TABLE AND DATA
-- ==============================================

-- Check if table exists and has data
SELECT 'Document settings table created successfully' as status;
SELECT count(*) as total_settings FROM document_settings;
SELECT setting_key, setting_value FROM document_settings ORDER BY setting_key;
