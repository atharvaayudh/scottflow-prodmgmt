-- Fix branding_status enum to include 'dispatched'
-- Run this in Supabase SQL Editor if the enum already exists without 'dispatched'

-- First, check if the enum type exists
DO $$ 
BEGIN
  -- Try to add 'dispatched' to the existing enum
  -- Note: This only works if the enum exists and doesn't have 'dispatched' yet
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'branding_status') THEN
    -- Check if 'dispatched' already exists
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum 
      WHERE enumlabel = 'dispatched' 
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'branding_status')
    ) THEN
      -- Add 'dispatched' to the enum
      ALTER TYPE branding_status ADD VALUE IF NOT EXISTS 'dispatched';
      RAISE NOTICE 'Added ''dispatched'' to branding_status enum';
    ELSE
      RAISE NOTICE 'Enum value ''dispatched'' already exists';
    END IF;
  ELSE
    -- If enum doesn't exist, create it with all values
    CREATE TYPE branding_status AS ENUM (
      'creating_file',
      'printing',
      'fusing',
      'ready_to_dispatch',
      'dispatched'
    );
    RAISE NOTICE 'Created branding_status enum with all values including ''dispatched''';
  END IF;
END $$;

-- Verify the enum values
SELECT 
  e.enumlabel as enum_value,
  e.enumsortorder as sort_order
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'branding_status'
ORDER BY e.enumsortorder;

-- Ensure the columns exist
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS branding_status branding_status;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS branding_completion_date DATE;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS branding_completed_at TIMESTAMP WITH TIME ZONE;

-- Recreate the trigger function and trigger
CREATE OR REPLACE FUNCTION set_branding_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.branding_status = 'ready_to_dispatch' AND (OLD.branding_status IS NULL OR OLD.branding_status != 'ready_to_dispatch') THEN
    NEW.branding_completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_branding_completed_at ON public.orders;
CREATE TRIGGER trigger_set_branding_completed_at
  BEFORE UPDATE OF branding_status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION set_branding_completed_at();

