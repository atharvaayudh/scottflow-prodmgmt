-- Create Single Field Branding Master Table
-- Only with branding_type field

-- Drop existing table if it exists
DROP TABLE IF EXISTS branding_master CASCADE;

-- Create simplified branding master table with only branding_type
CREATE TABLE branding_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branding_type VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE branding_master ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policy
CREATE POLICY "branding_master_policy" ON branding_master FOR ALL USING (true);

-- Insert sample data
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

-- Create index for better performance
CREATE INDEX idx_branding_master_type ON branding_master(branding_type);

-- Verify the table
SELECT 'Single field branding master table created successfully!' as status;

-- Show sample data
SELECT * FROM branding_master ORDER BY created_at DESC;
