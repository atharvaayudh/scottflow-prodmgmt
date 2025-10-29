-- Fix company_config table - ensure only one record exists
-- Run this in your Supabase SQL editor

-- 1. Check current records
SELECT id, company_name, company_code, created_at 
FROM company_config 
ORDER BY created_at ASC;

-- 2. Keep only the oldest record, delete others
-- First, let's see which records exist
DO $$
DECLARE
    oldest_id UUID;
    record_count INTEGER;
BEGIN
    -- Count records
    SELECT COUNT(*) INTO record_count FROM company_config;
    
    IF record_count > 1 THEN
        -- Get the oldest record ID
        SELECT id INTO oldest_id 
        FROM company_config 
        ORDER BY created_at ASC 
        LIMIT 1;
        
        -- Delete all except the oldest
        DELETE FROM company_config WHERE id != oldest_id;
        
        RAISE NOTICE 'Deleted % duplicate records, kept record with id: %', (record_count - 1), oldest_id;
    ELSE
        RAISE NOTICE 'Only one record exists, no cleanup needed';
    END IF;
END $$;

-- 3. Add unique constraint to prevent future duplicates (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'company_config_single_record_check'
    ) THEN
        -- Note: We can't enforce a single row with a constraint directly
        -- But we can add a check to ensure company_code is unique (which should help)
        ALTER TABLE company_config 
        ADD CONSTRAINT company_config_code_unique UNIQUE (company_code);
        
        RAISE NOTICE 'Added unique constraint on company_code';
    END IF;
END $$;

-- 4. Verify only one record remains
SELECT COUNT(*) as total_records, 
       MAX(company_name) as company_name,
       MAX(company_code) as company_code
FROM company_config;
