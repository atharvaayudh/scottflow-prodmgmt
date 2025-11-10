-- Add branding status and expected completion date to orders table
-- Run this in Supabase SQL Editor

-- Create branding_status enum type
-- First, check if enum exists and add 'dispatched' if missing
DO $$ 
BEGIN
  -- Check if enum exists
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'branding_status') THEN
    -- Check if 'dispatched' exists in the enum
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum 
      WHERE enumlabel = 'dispatched' 
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'branding_status')
    ) THEN
      -- Try to add 'dispatched' to existing enum
      BEGIN
        ALTER TYPE branding_status ADD VALUE 'dispatched';
        RAISE NOTICE 'Added ''dispatched'' to existing branding_status enum';
      EXCEPTION
        WHEN OTHERS THEN
          RAISE NOTICE 'Could not add value to existing enum: %', SQLERRM;
      END;
    END IF;
  ELSE
    -- Create enum with all values if it doesn't exist
    CREATE TYPE branding_status AS ENUM (
      'creating_file',
      'printing',
      'fusing',
      'ready_to_dispatch',
      'dispatched'
    );
    RAISE NOTICE 'Created branding_status enum with all values';
  END IF;
END $$;

-- Add branding_status column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS branding_status branding_status;

-- Add branding_completion_date column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS branding_completion_date DATE;

-- Add branding_completed_at timestamp column (when status is set to ready_to_dispatch)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS branding_completed_at TIMESTAMP WITH TIME ZONE;

-- Create index for branding status
CREATE INDEX IF NOT EXISTS idx_orders_branding_status ON public.orders(branding_status);

-- Add comment to columns
COMMENT ON COLUMN public.orders.branding_status IS 'Status of branding process: creating_file, printing, fusing, ready_to_dispatch, dispatched';
COMMENT ON COLUMN public.orders.branding_completion_date IS 'Expected date of completion for branding process';
COMMENT ON COLUMN public.orders.branding_completed_at IS 'Timestamp when branding status was set to ready_to_dispatch';

-- Create function to automatically set branding_completed_at when status changes to ready_to_dispatch
CREATE OR REPLACE FUNCTION set_branding_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.branding_status = 'ready_to_dispatch' AND (OLD.branding_status IS NULL OR OLD.branding_status != 'ready_to_dispatch') THEN
    NEW.branding_completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set branding_completed_at
DROP TRIGGER IF EXISTS trigger_set_branding_completed_at ON public.orders;
CREATE TRIGGER trigger_set_branding_completed_at
  BEFORE UPDATE OF branding_status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION set_branding_completed_at();

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  udt_name,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name IN ('branding_status', 'branding_completion_date', 'branding_completed_at')
ORDER BY column_name;

