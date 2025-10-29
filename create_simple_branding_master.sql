-- Create Simple Branding Master Table
-- Only with the 4 required fields

-- Drop existing table if it exists
DROP TABLE IF EXISTS branding_master CASCADE;

-- Create simplified branding master table
CREATE TABLE branding_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branding_type VARCHAR(100) NOT NULL,
  placement VARCHAR(255) NOT NULL,
  measurement_unit VARCHAR(50) NOT NULL,
  measurement VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE branding_master ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policy
CREATE POLICY "branding_master_policy" ON branding_master FOR ALL USING (true);

-- Insert sample data
INSERT INTO branding_master (branding_type, placement, measurement_unit, measurement) VALUES
('Logo', 'Front Center', 'cm', '5.0'),
('Text', 'Back Left', 'mm', '12.0'),
('Pattern', 'Sleeve', 'inches', '2.5'),
('Embroidery', 'Collar', 'cm', '3.0'),
('Print', 'Front Right', 'mm', '8.0')
ON CONFLICT DO NOTHING;

-- Create index for better performance
CREATE INDEX idx_branding_master_type ON branding_master(branding_type);
CREATE INDEX idx_branding_master_placement ON branding_master(placement);

-- Verify the table
SELECT 'Simple branding master table created successfully!' as status;

-- Show sample data
SELECT * FROM branding_master ORDER BY created_at DESC;
