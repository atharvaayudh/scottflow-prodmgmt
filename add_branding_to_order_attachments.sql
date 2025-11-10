-- Add branding fields to order_attachments table
-- Run this in your Supabase SQL editor

-- Add branding fields if they don't exist
DO $$ 
BEGIN
  -- Add branding_type_id (references branding_master)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'order_attachments' 
    AND column_name = 'branding_type_id'
  ) THEN
    ALTER TABLE public.order_attachments 
    ADD COLUMN branding_type_id UUID REFERENCES public.branding_master(id);
  END IF;

  -- Add placement field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'order_attachments' 
    AND column_name = 'placement'
  ) THEN
    ALTER TABLE public.order_attachments 
    ADD COLUMN placement VARCHAR(255);
  END IF;

  -- Add measurement field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'order_attachments' 
    AND column_name = 'measurement'
  ) THEN
    ALTER TABLE public.order_attachments 
    ADD COLUMN measurement VARCHAR(100);
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_order_attachments_branding_type_id 
ON public.order_attachments(branding_type_id);

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'order_attachments'
AND column_name IN ('branding_type_id', 'placement', 'measurement')
ORDER BY column_name;

