-- Fix Company Config Constraint Issue
-- This script handles the existing table and adds the missing company_code

-- First, let's check if the table exists and what columns it has
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'company_config' 
ORDER BY ordinal_position;

-- Add company_code column if it doesn't exist
ALTER TABLE company_config 
ADD COLUMN IF NOT EXISTS company_code VARCHAR(50);

-- Update existing records to have a company_code
UPDATE company_config 
SET company_code = 'COMP' || LPAD(EXTRACT(EPOCH FROM created_at)::text, 10, '0')
WHERE company_code IS NULL;

-- Now make it NOT NULL and UNIQUE
ALTER TABLE company_config 
ALTER COLUMN company_code SET NOT NULL;

-- Add unique constraint
ALTER TABLE company_config 
ADD CONSTRAINT company_config_company_code_key UNIQUE (company_code);

-- Insert default company config if no records exist
INSERT INTO company_config (company_name, company_code, address, city, state, pincode, country, phone, email) 
SELECT 'Your Company Name', 'COMP001', 'Your Company Address', 'Your City', 'Your State', '123456', 'India', '+91-1234567890', 'info@yourcompany.com'
WHERE NOT EXISTS (SELECT 1 FROM company_config);

-- Verify the fix
SELECT 'Company config constraint fixed successfully!' as status;
SELECT * FROM company_config;
