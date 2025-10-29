-- Fix orders RLS to allow authenticated users to create orders
-- Run this in your Supabase SQL editor

-- Allow authenticated users to insert orders
DROP POLICY IF EXISTS "Allow authenticated order creation" ON orders;
CREATE POLICY "Allow authenticated order creation" ON orders
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to insert order items
DROP POLICY IF EXISTS "Allow authenticated order items insert" ON order_items;
CREATE POLICY "Allow authenticated order items insert" ON order_items
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Allow users to view orders
DROP POLICY IF EXISTS "Users can view orders" ON orders;
CREATE POLICY "Users can view orders" ON orders
  FOR SELECT 
  TO authenticated
  USING (true);

-- Allow users to view order items
DROP POLICY IF EXISTS "Users can view order items" ON order_items;
CREATE POLICY "Users can view order items" ON order_items
  FOR SELECT 
  TO authenticated
  USING (true);

-- Allow users to update their own orders
DROP POLICY IF EXISTS "Users can update orders" ON orders;
CREATE POLICY "Users can update orders" ON orders
  FOR UPDATE
  TO authenticated
  USING (true);

-- Allow users to update order items
DROP POLICY IF EXISTS "Users can update order items" ON order_items;
CREATE POLICY "Users can update order items" ON order_items
  FOR UPDATE
  TO authenticated
  USING (true);
