-- Add item-level GST columns to order_items
-- Safe to run multiple times

-- Add gst_percent (percentage as numeric) if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'order_items'
      AND column_name = 'gst_percent'
  ) THEN
    ALTER TABLE public.order_items
      ADD COLUMN gst_percent NUMERIC(6,3) DEFAULT 0;
  END IF;
END $$;

-- Add gst_amount (absolute amount) if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'order_items'
      AND column_name = 'gst_amount'
  ) THEN
    ALTER TABLE public.order_items
      ADD COLUMN gst_amount NUMERIC(14,2) DEFAULT 0;
  END IF;
END $$;

-- Optional: index for analytics/reporting
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname = 'idx_order_items_gst_percent'
  ) THEN
    CREATE INDEX idx_order_items_gst_percent ON public.order_items (gst_percent);
  END IF;
END $$;
