-- Add sales_team_id column to orders table
-- This allows assigning a sales person/team to each order

-- Add sales_team_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'sales_team_id'
  ) THEN
    ALTER TABLE public.orders 
    ADD COLUMN sales_team_id UUID REFERENCES public.people(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_sales_team_id 
ON public.orders(sales_team_id);

