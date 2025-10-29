-- Remove all existing RLS policies on orders and order_items tables
-- This allows authenticated users to insert, select, update, and delete

-- Drop all existing policies on orders table
DO $$ 
DECLARE
    r record;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON orders', r.policyname);
    END LOOP;
END $$;

-- Drop all existing policies on order_items table
DO $$ 
DECLARE
    r record;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_items') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON order_items', r.policyname);
    END LOOP;
END $$;

-- Create simple policies for orders table
CREATE POLICY "Allow authenticated users to insert orders" ON orders
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to select orders" ON orders
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update orders" ON orders
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete orders" ON orders
  FOR DELETE
  TO authenticated
  USING (true);

-- Create simple policies for order_items table
CREATE POLICY "Allow authenticated users to insert order items" ON order_items
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to select order items" ON order_items
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update order items" ON order_items
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete order items" ON order_items
  FOR DELETE
  TO authenticated
  USING (true);
