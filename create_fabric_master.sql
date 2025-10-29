-- Create Fabric Master Table
-- Fields: fabric_code, fabric_name, color, gsm, uom, colors (array), image_url

-- Drop existing table if it exists
DROP TABLE IF EXISTS fabric_master CASCADE;

-- Create fabric master table
CREATE TABLE fabric_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fabric_code VARCHAR(50) NOT NULL UNIQUE,
  fabric_name VARCHAR(255) NOT NULL,
  color VARCHAR(100),
  gsm INTEGER,
  uom VARCHAR(50) DEFAULT 'Meters',
  colors JSONB,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE fabric_master ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "fabric_master_policy" ON fabric_master FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_fabric_master_code ON fabric_master(fabric_code);
CREATE INDEX idx_fabric_master_name ON fabric_master(fabric_name);
CREATE INDEX idx_fabric_master_gsm ON fabric_master(gsm);
CREATE INDEX idx_fabric_master_active ON fabric_master(is_active);
CREATE INDEX idx_fabric_master_colors ON fabric_master USING GIN (colors);

-- Insert sample data
INSERT INTO fabric_master (fabric_code, fabric_name, color, gsm, uom, colors) VALUES
('FB-001', 'Cotton Twill', 'Navy Blue', 180, 'Meters', '[
  {"color_name": "Navy Blue"},
  {"color_name": "Black"},
  {"color_name": "Khaki"}
]'::jsonb),
('FB-002', 'Cotton Poplin', 'White', 160, 'Meters', '[
  {"color_name": "White"},
  {"color_name": "Ivory"},
  {"color_name": "Light Blue"}
]'::jsonb),
('FB-003', 'Denim', 'Blue', 220, 'Meters', '[
  {"color_name": "Indigo Blue"},
  {"color_name": "Light Blue"},
  {"color_name": "Black"}
]'::jsonb),
('FB-004', 'Polyester Twill', 'Grey', 200, 'Meters', '[
  {"color_name": "Grey"},
  {"color_name": "Navy"},
  {"color_name": "Black"}
]'::jsonb),
('FB-005', 'Cotton Jersey', 'Red', 140, 'Meters', '[
  {"color_name": "Red"},
  {"color_name": "Blue"},
  {"color_name": "Green"}
]'::jsonb),
('FB-006', 'Cotton Canvas', 'Beige', 240, 'Meters', '[
  {"color_name": "Beige"},
  {"color_name": "Natural"},
  {"color_name": "Off-White"}
]'::jsonb),
('FB-007', 'Polyester Mesh', 'Black', 110, 'Meters', '[
  {"color_name": "Black"},
  {"color_name": "Grey"},
  {"color_name": "White"}
]'::jsonb),
('FB-008', 'Cotton Lawn', 'Pink', 130, 'Meters', '[
  {"color_name": "Pink"},
  {"color_name": "Yellow"},
  {"color_name": "Mint"}
]'::jsonb)
ON CONFLICT (fabric_code) DO NOTHING;

-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'fabric_master'
ORDER BY ordinal_position;

-- Verify sample data
SELECT 'Fabric master table created successfully!' as status;
SELECT * FROM fabric_master ORDER BY created_at DESC;
