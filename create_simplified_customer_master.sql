-- Create Simplified Customer Master Table
-- Only with Customer Name, Mobile Number, City, State

-- Drop existing table if it exists
DROP TABLE IF EXISTS customer_master CASCADE;

-- Create simplified customer master table
CREATE TABLE customer_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(20) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customer_master ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policy
CREATE POLICY "customer_master_policy" ON customer_master FOR ALL USING (true);

-- Insert sample data
INSERT INTO customer_master (customer_name, mobile_number, city, state) VALUES
('John Smith', '+91-9876543210', 'Mumbai', 'Maharashtra'),
('Sarah Johnson', '+91-9876543211', 'Delhi', 'Delhi'),
('Mike Wilson', '+91-9876543212', 'Bangalore', 'Karnataka'),
('Emily Brown', '+91-9876543213', 'Chennai', 'Tamil Nadu'),
('David Lee', '+91-9876543214', 'Kolkata', 'West Bengal'),
('Lisa Davis', '+91-9876543215', 'Pune', 'Maharashtra'),
('Robert Taylor', '+91-9876543216', 'Hyderabad', 'Telangana'),
('Jennifer White', '+91-9876543217', 'Ahmedabad', 'Gujarat')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX idx_customer_master_name ON customer_master(customer_name);
CREATE INDEX idx_customer_master_mobile ON customer_master(mobile_number);
CREATE INDEX idx_customer_master_city ON customer_master(city);
CREATE INDEX idx_customer_master_state ON customer_master(state);

-- Verify the table
SELECT 'Simplified customer master table created successfully!' as status;

-- Show sample data
SELECT * FROM customer_master ORDER BY created_at DESC;
