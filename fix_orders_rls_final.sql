-- Final fix for orders RLS - allows both authenticated and anon users
-- Run this in your Supabase SQL editor

-- Drop all existing policies on orders table
DO $$ 
DECLARE
    r record;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.orders', r.policyname);
    END LOOP;
END $$;

-- Drop all existing policies on order_items table
DO $$ 
DECLARE
    r record;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_items') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.order_items', r.policyname);
    END LOOP;
END $$;

-- Create simple policies for orders table - allow authenticated AND anon
CREATE POLICY "Allow insert orders" ON public.orders
  FOR INSERT 
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Allow select orders" ON public.orders
  FOR SELECT 
  TO authenticated, anon
  USING (true);

CREATE POLICY "Allow update orders" ON public.orders
  FOR UPDATE
  TO authenticated, anon
  USING (true);

CREATE POLICY "Allow delete orders" ON public.orders
  FOR DELETE
  TO authenticated, anon
  USING (true);

-- Create simple policies for order_items table - allow authenticated AND anon
CREATE POLICY "Allow insert order items" ON public.order_items
  FOR INSERT 
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Allow select order items" ON public.order_items
  FOR SELECT 
  TO authenticated, anon
  USING (true);

CREATE POLICY "Allow update order items" ON public.order_items
  FOR UPDATE
  TO authenticated, anon
  USING (true);

CREATE POLICY "Allow delete order items" ON public.order_items
  FOR DELETE
  TO authenticated, anon
  USING (true);

-- Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename, policyname;
