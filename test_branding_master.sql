-- Test Branding Master Table
-- Check if table exists and test basic operations

-- Check if table exists
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'branding_master'
ORDER BY ordinal_position;

-- Test insert
INSERT INTO branding_master (branding_type, placement, measurement_unit, measurement) 
VALUES ('Test Logo', 'Front Center', 'cm', '5.0')
RETURNING *;

-- Test select
SELECT * FROM branding_master ORDER BY created_at DESC LIMIT 5;

-- Test update
UPDATE branding_master 
SET measurement = '6.0' 
WHERE branding_type = 'Test Logo'
RETURNING *;

-- Test delete
DELETE FROM branding_master 
WHERE branding_type = 'Test Logo'
RETURNING *;

-- Final check
SELECT 'Branding master table is working correctly!' as status;
