-- Create Updated Size Master Table
-- With size_type, image_url, and sizes fields

-- Drop existing table if it exists
DROP TABLE IF EXISTS size_master CASCADE;

-- Create updated size master table
CREATE TABLE size_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  size_type VARCHAR(100) NOT NULL,
  image_url TEXT,
  sizes TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE size_master ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policy
CREATE POLICY "size_master_policy" ON size_master FOR ALL USING (true);

-- Insert sample data
INSERT INTO size_master (size_type, image_url, sizes) VALUES
('Clothing', 'https://example.com/clothing-chart.jpg', 'S,M,L,XL,2XL,3XL'),
('Footwear', 'https://example.com/shoe-chart.jpg', '38,39,40,41,42,43,44,45'),
('Accessories', 'https://example.com/accessories-chart.jpg', 'One Size'),
('Bags', 'https://example.com/bags-chart.jpg', 'Small,Medium,Large'),
('Jewelry', 'https://example.com/jewelry-chart.jpg', '16,17,18,19,20,21,22'),
('Hats', 'https://example.com/hats-chart.jpg', 'S,M,L,XL')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX idx_size_master_type ON size_master(size_type);
CREATE INDEX idx_size_master_sizes ON size_master(sizes);

-- Verify the table
SELECT 'Updated size master table created successfully!' as status;

-- Show sample data
SELECT * FROM size_master ORDER BY created_at DESC;
