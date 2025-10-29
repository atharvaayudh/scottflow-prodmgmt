-- Update Branding Master Table
-- Add new fields for branding type, placement, measurement unit, and measurement

-- Add new columns to existing branding_master table
ALTER TABLE branding_master 
ADD COLUMN IF NOT EXISTS branding_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS placement VARCHAR(255),
ADD COLUMN IF NOT EXISTS measurement_unit VARCHAR(50),
ADD COLUMN IF NOT EXISTS measurement VARCHAR(100);

-- Create index for branding_type for better filtering
CREATE INDEX IF NOT EXISTS idx_branding_master_type ON branding_master(branding_type);

-- Insert sample data with new fields
INSERT INTO branding_master (
  brand_name, 
  brand_code, 
  branding_type, 
  placement, 
  measurement_unit, 
  measurement,
  is_active
) VALUES
('Company Logo', 'LOGO001', 'Logo', 'Front Center', 'cm', '5.0', true),
('Product Text', 'TEXT001', 'Text', 'Back Left', 'mm', '12.0', true),
('Pattern Design', 'PAT001', 'Pattern', 'Sleeve', 'inches', '2.5', true)
ON CONFLICT (brand_code) DO NOTHING;

-- Verify the changes
SELECT 'Branding master table updated successfully' as status;

-- Show sample data
SELECT 
  brand_name,
  brand_code,
  branding_type,
  placement,
  measurement_unit,
  measurement,
  is_active
FROM branding_master 
WHERE branding_type IS NOT NULL
ORDER BY created_at DESC;
