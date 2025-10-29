-- Fix Item Master Table Structure
-- Change category_id to category (text), add image_url column

-- First, drop the old category_id column if it exists
ALTER TABLE item_master DROP COLUMN IF EXISTS category_id;

-- Add the new category column (text)
ALTER TABLE item_master ADD COLUMN IF NOT EXISTS category VARCHAR(255);

-- Add image_url column if it doesn't exist
ALTER TABLE item_master ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Insert sample data if table is empty
INSERT INTO item_master (item_name, item_code, item_type, category, unit_of_measure, description, is_active) 
SELECT 
  'Sample Item',
  'ITM-001',
  'Raw Material',
  'Fasteners',
  'Pieces',
  'Sample item for demonstration',
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM item_master WHERE item_code = 'ITM-001');

-- Update existing rows to have NULL for category if they don't have a value
UPDATE item_master 
SET category = NULL 
WHERE category IS NULL;

-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'item_master'
ORDER BY ordinal_position;

-- Show sample data
SELECT 'Item master table updated successfully!' as status;
SELECT * FROM item_master ORDER BY created_at DESC LIMIT 5;
