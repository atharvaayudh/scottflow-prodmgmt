-- Create Simplified Product Category Master Table
-- Fields: Category Code, Category Name, Category Description, Image URL, Sort Order, Active

-- Drop existing table if it exists
DROP TABLE IF EXISTS product_categories CASCADE;

-- Create product category master table
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_code VARCHAR(50) NOT NULL UNIQUE,
  category_name VARCHAR(255) NOT NULL,
  category_description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "product_categories_policy" ON product_categories FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_product_categories_code ON product_categories(category_code);
CREATE INDEX idx_product_categories_name ON product_categories(category_name);
CREATE INDEX idx_product_categories_sort ON product_categories(sort_order);
CREATE INDEX idx_product_categories_active ON product_categories(is_active);

-- Insert sample data
INSERT INTO product_categories (category_code, category_name, category_description, sort_order) VALUES
('CAT-001', 'T-Shirts', 'All types of T-Shirts including round neck, V-neck, and polo shirts', 1),
('CAT-002', 'Shirts', 'Formal and casual shirts for men and women', 2),
('CAT-003', 'Trousers', 'Formal and casual trousers including jeans, chinos, and formal pants', 3),
('CAT-004', 'Dresses', 'Party dresses, casual dresses, and formal dresses', 4),
('CAT-005', 'Jackets', 'Winter jackets, blazers, and casual jackets', 5),
('CAT-006', 'Activewear', 'Sportswear including track pants, shorts, and athletic tops', 6),
('CAT-007', 'Accessories', 'Belts, hats, bags, and other accessories', 7),
('CAT-008', 'Innerwear', 'Undergarments and innerwear items', 8)
ON CONFLICT (category_code) DO NOTHING;

-- Verify the table
SELECT 'Product category master table created successfully!' as status;

-- Show sample data
SELECT * FROM product_categories ORDER BY sort_order ASC;
