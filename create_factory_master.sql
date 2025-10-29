-- Create Factory Master Table
-- Supports 2 types of factories: Own Factory and Jobwork Factory

-- Drop existing table if it exists
DROP TABLE IF EXISTS factory_master CASCADE;

-- Create factory master table
CREATE TABLE factory_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  factory_code VARCHAR(50) NOT NULL UNIQUE,
  factory_name VARCHAR(255) NOT NULL,
  factory_type VARCHAR(20) NOT NULL CHECK (factory_type IN ('Own Factory', 'Jobwork Factory')),
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  pincode VARCHAR(20),
  gstin VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE factory_master ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "factory_master_policy" ON factory_master FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_factory_master_code ON factory_master(factory_code);
CREATE INDEX idx_factory_master_name ON factory_master(factory_name);
CREATE INDEX idx_factory_master_type ON factory_master(factory_type);
CREATE INDEX idx_factory_master_active ON factory_master(is_active);

-- Insert sample data
INSERT INTO factory_master (factory_code, factory_name, factory_type, contact_person, phone, email, city, state) VALUES
('FAC-001', 'Main Production Unit', 'Own Factory', 'John Doe', '+91-9876543210', 'main@company.com', 'Mumbai', 'Maharashtra'),
('FAC-002', 'Stitching Department', 'Own Factory', 'Jane Smith', '+91-9876543211', 'stitching@company.com', 'Mumbai', 'Maharashtra'),
('FAC-003', 'Finishing Unit', 'Own Factory', 'Bob Johnson', '+91-9876543212', 'finishing@company.com', 'Mumbai', 'Maharashtra'),
('FAC-004', 'ABC Garments Pvt Ltd', 'Jobwork Factory', 'Raj Kumar', '+91-9876543213', 'abc@jobwork.com', 'Delhi', 'Delhi'),
('FAC-005', 'XYZ Textiles', 'Jobwork Factory', 'Priya Sharma', '+91-9876543214', 'xyz@textiles.com', 'Bangalore', 'Karnataka'),
('FAC-006', 'Quick Stitches Ltd', 'Jobwork Factory', 'Amit Patel', '+91-9876543215', 'quick@stitches.com', 'Ahmedabad', 'Gujarat')
ON CONFLICT (factory_code) DO NOTHING;

-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'factory_master'
ORDER BY ordinal_position;

-- Verify sample data
SELECT 'Factory master table created successfully!' as status;
SELECT * FROM factory_master ORDER BY factory_type, created_at DESC;
